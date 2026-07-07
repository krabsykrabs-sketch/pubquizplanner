'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import type { Category, QuizConfig, QuizQuestion } from '@/types/quiz';
import { DEFAULT_QUIZ_MODE } from '@/lib/quiz-modes';
import StepBuild, { makeRound } from '@/components/quiz-builder/StepBuild';
import StepDownload from '@/components/quiz-builder/StepDownload';

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
    rounds: Array.from({ length: DEFAULT_ROUNDS }, (_, i) => makeRound(i + 1)),
  };
}

function GeneratorFlow() {
  const t = useTranslations('generator');
  const locale = useLocale();
  const quick = useSearchParams().get('quick') === '1';
  const [step, setStep] = useState(1);
  const [quickReady, setQuickReady] = useState(!quick);
  const [config, setConfig] = useState<QuizConfig>(() => makeConfig(locale));
  const [roundsData, setRoundsData] = useState<RoundQuestions[]>([]);

  useEffect(() => {
    if (!quick) return;
    fetch(`/api/questions/categories?locale=${locale}`)
      .then((res) => res.json())
      .then((cats: Category[]) => {
        const picked = [...cats].sort(() => Math.random() - 0.5).slice(0, QUICK_ROUNDS);
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
    <main className="min-h-screen py-8 px-4">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-center mb-6">{t('title')}</h1>

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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono ${
                      step === target
                        ? 'bg-[var(--gold)] text-[var(--background)]'
                        : step > target || (clickable && target !== step)
                        ? 'bg-[var(--gold)] bg-opacity-30 text-[var(--gold)]'
                        : 'bg-[var(--dark-card)] text-[var(--muted)]'
                    }`}
                  >
                    {target}
                  </span>
                  <span
                    className={`text-sm hidden sm:inline ${
                      step === target
                        ? 'text-[var(--foreground)]'
                        : clickable
                        ? 'text-[var(--muted)] hover:text-[var(--foreground)]'
                        : 'text-[var(--muted)]'
                    }`}
                  >
                    {label}
                  </span>
                </button>
                {i < stepLabels.length - 1 && (
                  <div className="w-8 h-px bg-[var(--dark-border)]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Steps */}
      {!quickReady && (
        <div className="text-center py-20">
          <div className="text-4xl mb-4 animate-pulse">🎲</div>
          <p className="text-[var(--muted)]">{t('loading')}</p>
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
