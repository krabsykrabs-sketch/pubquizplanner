'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Dices } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import type { Category, QuizConfig, QuizQuestion } from '@/types/quiz';
import { DEFAULT_QUIZ_MODE } from '@/lib/quiz-modes';
import StepBuild, { makeRound } from '@/components/quiz-builder/StepBuild';
import StepDownload from '@/components/quiz-builder/StepDownload';
import { trackGenerator } from '@/lib/generator-track';

interface RoundQuestions {
  questions: QuizQuestion[];
  expanded: boolean;
}

const DEFAULT_ROUNDS = 5;
// "Überrasch mich": a small, snappy quiz from randomly picked real
// categories — same screen as the normal flow, just different defaults.
const QUICK_ROUNDS = 3;
const QUICK_QUESTIONS_PER_ROUND = 5;

function makeConfig(locale: string): QuizConfig {
  return {
    title: '',
    date: '',
    venue: '',
    locale,
    numberOfRounds: DEFAULT_ROUNDS,
    mode: DEFAULT_QUIZ_MODE,
    timerSeconds: 0,
    timerSound: true,
    rounds: Array.from({ length: DEFAULT_ROUNDS }, (_, i) => makeRound(i + 1)),
  };
}

function GeneratorFlow() {
  const t = useTranslations('generator');
  const locale = useLocale();
  const params = useSearchParams();
  const quick = params.get('quick') === '1';
  // Optional themed quick quiz, e.g. ?quick=1&cat=weihnachten: every round
  // comes from that one category (questions never repeat across rounds).
  const quickCat = params.get('cat');
  const [step, setStep] = useState(1);
  const [quickReady, setQuickReady] = useState(!quick);
  const [config, setConfig] = useState<QuizConfig>(() => makeConfig(locale));
  const [roundsData, setRoundsData] = useState<RoundQuestions[]>([]);

  // Funnel instrumentation (see lib/generator-events.ts): reaching step 2,
  // copying text, and leaving (last step + seconds on the page). 'exit' can
  // fire more than once (tab hidden, page closed, in-app navigation); the
  // dashboard takes the latest step and the longest duration per visit.
  const startedAt = useRef(Date.now());
  const stepRef = useRef(step);
  const copiedSteps = useRef(new Set<number>());
  useEffect(() => {
    if (step === 2 && stepRef.current !== 2) trackGenerator('to_download');
    stepRef.current = step;
  }, [step]);
  useEffect(() => {
    const sendExit = () =>
      trackGenerator('exit', {
        step: stepRef.current,
        seconds: Math.round((Date.now() - startedAt.current) / 1000),
      });
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') sendExit();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', sendExit);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', sendExit);
      sendExit(); // in-app navigation away from the generator
    };
  }, []);
  const onCopy = () => {
    if (copiedSteps.current.has(step)) return;
    copiedSteps.current.add(step);
    trackGenerator('copy', { step });
  };

  useEffect(() => {
    if (!quick) return;
    fetch(`/api/questions/categories?locale=${locale}`)
      .then((res) => res.json())
      .then((cats: Category[]) => {
        const themed = quickCat ? cats.find((c) => c.slug === quickCat) : undefined;
        const picked = themed
          ? Array.from({ length: QUICK_ROUNDS }, () => themed)
          : [...cats].sort(() => Math.random() - 0.5).slice(0, QUICK_ROUNDS);
        if (picked.length === 0) throw new Error('no categories');
        setConfig((c) => ({
          ...c,
          numberOfRounds: picked.length,
          rounds: picked.map((cat, i) => ({
            roundNumber: i + 1,
            categoryId: cat.id,
            categorySlug: cat.slug,
            categoryName: cat.name_de,
            categoryIcon: cat.icon || '',
            questionsPerRound: QUICK_QUESTIONS_PER_ROUND,
          })),
        }));
        setQuickReady(true);
      })
      .catch(() => setQuickReady(true)); // fall back to default rounds
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stepLabels = [t('step1'), t('step2')];
  const hasQuiz = roundsData.length > 0 && roundsData.some((r) => r.questions.length > 0);

  return (
    <main className="min-h-screen bg-[var(--bg-page)] px-4 py-8 nav:py-12" onCopy={onCopy}>
      {/* Header */}
      <div className="mx-auto mb-8 max-w-3xl">
        <h1 className="mb-6 text-center font-display text-[1.75rem] font-extrabold tracking-[-0.02em] text-[var(--text-strong)]">
          {t('title')}
        </h1>

        {/* Clickable step indicator */}
        <div className="flex items-center justify-center gap-2">
          {stepLabels.map((label, i) => {
            const target = i + 1;
            const clickable = target === 1 || hasQuiz;
            return (
              <div key={i} className="flex items-center gap-2">
                <button
                  onClick={() => clickable && setStep(target)}
                  disabled={!clickable}
                  className={`flex items-center gap-2 ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-semibold transition-colors ${
                      step === target
                        ? 'bg-[var(--accent)] text-[var(--text-on-accent)]'
                        : clickable
                        ? 'bg-[var(--accent-soft)] text-[var(--accent-text)]'
                        : 'border border-[var(--border-subtle)] bg-[var(--surface-card)] text-[var(--text-faint)]'
                    }`}
                  >
                    {target}
                  </span>
                  <span
                    className={`hidden text-sm font-medium sm:inline ${
                      step === target
                        ? 'text-[var(--text-strong)]'
                        : clickable
                        ? 'text-[var(--text-muted)] hover:text-[var(--text-strong)]'
                        : 'text-[var(--text-faint)]'
                    }`}
                  >
                    {label}
                  </span>
                </button>
                {i < stepLabels.length - 1 && (
                  <div className="h-px w-8 bg-[var(--border-strong)]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Steps */}
      {!quickReady && (
        <div className="py-20 text-center">
          <Dices className="mx-auto mb-4 h-10 w-10 animate-pulse text-[var(--accent)]" aria-hidden />
          <p className="text-[var(--text-muted)]">{t('loading')}</p>
        </div>
      )}
      {quickReady && step === 1 && (
        <StepBuild
          config={config}
          onChange={setConfig}
          roundsData={roundsData}
          setRoundsData={setRoundsData}
          onNext={() => setStep(2)}
        />
      )}
      {quickReady && step === 2 && (
        <StepDownload
          config={config}
          onChange={setConfig}
          roundsData={roundsData}
          onBack={() => setStep(1)}
        />
      )}
    </main>
  );
}

export default function GeneratorPage() {
  return (
    <Suspense>
      <GeneratorFlow />
    </Suspense>
  );
}
