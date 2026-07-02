'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import type { Category, QuizConfig, QuizQuestion } from '@/types/quiz';
import StepRounds, { makeRound } from '@/components/quiz-builder/StepRounds';
import StepPreview from '@/components/quiz-builder/StepPreview';
import StepDownload from '@/components/quiz-builder/StepDownload';

interface RoundQuestions {
  questions: QuizQuestion[];
  expanded: boolean;
}

const DEFAULT_ROUNDS = 5;
// "Überrasch mich": a small, snappy quiz from randomly picked real
// categories. Going back to step 1 makes every part of it adjustable.
const QUICK_ROUNDS = 3;
const QUICK_QUESTIONS_PER_ROUND = 5;

function makeConfig(locale: string): QuizConfig {
  return {
    title: '',
    date: '',
    venue: '',
    locale,
    numberOfRounds: DEFAULT_ROUNDS,
    answerPlacement: 'all_at_end',
    rounds: Array.from({ length: DEFAULT_ROUNDS }, (_, i) => makeRound(i + 1)),
  };
}

function GeneratorFlow() {
  const t = useTranslations('generator');
  const locale = useLocale();
  // ?quick=1: pick QUICK_ROUNDS random real categories and jump straight to
  // the preview — details can be filled in at the end.
  const quick = useSearchParams().get('quick') === '1';
  const [step, setStep] = useState(quick ? 2 : 1);
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
      .catch(() => {
        // fall back to the manual flow
        setStep(1);
        setQuickReady(true);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stepLabels = [t('step1'), t('step2'), t('step3')];

  return (
    <main className="min-h-screen py-8 px-4">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <h1 className="text-2xl font-bold text-center mb-6">{t('title')}</h1>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          {stepLabels.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono ${
                  step === i + 1
                    ? 'bg-[var(--gold)] text-[var(--background)]'
                    : step > i + 1
                    ? 'bg-[var(--gold)] bg-opacity-30 text-[var(--gold)]'
                    : 'bg-[var(--dark-card)] text-[var(--muted)]'
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-sm hidden sm:inline ${
                  step === i + 1
                    ? 'text-[var(--foreground)]'
                    : 'text-[var(--muted)]'
                }`}
              >
                {label}
              </span>
              {i < stepLabels.length - 1 && (
                <div className="w-8 h-px bg-[var(--dark-border)]" />
              )}
            </div>
          ))}
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
        <StepRounds
          config={config}
          onChange={setConfig}
          onNext={() => {
            setRoundsData([]);
            setStep(2);
          }}
        />
      )}
      {quickReady && step === 2 && (
        <StepPreview
          config={config}
          roundsData={roundsData}
          setRoundsData={setRoundsData}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {quickReady && step === 3 && (
        <StepDownload
          config={config}
          onChange={setConfig}
          roundsData={roundsData}
          onBack={() => setStep(2)}
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
