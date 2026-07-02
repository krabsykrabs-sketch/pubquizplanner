'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { QuizConfig, QuizQuestion } from '@/types/quiz';
import { MIXED_CATEGORY } from '@/components/CategorySelector';
import StepRounds, { makeRound } from '@/components/quiz-builder/StepRounds';
import StepPreview from '@/components/quiz-builder/StepPreview';
import StepDownload from '@/components/quiz-builder/StepDownload';

interface RoundQuestions {
  questions: QuizQuestion[];
  expanded: boolean;
}

const DEFAULT_ROUNDS = 5;

function makeConfig(mixed: boolean): QuizConfig {
  return {
    title: '',
    date: '',
    venue: '',
    numberOfRounds: DEFAULT_ROUNDS,
    answerPlacement: 'all_at_end',
    rounds: Array.from({ length: DEFAULT_ROUNDS }, (_, i) => ({
      ...makeRound(i + 1),
      ...(mixed
        ? {
            categoryId: MIXED_CATEGORY.id,
            categorySlug: MIXED_CATEGORY.slug,
            categoryName: MIXED_CATEGORY.name_de,
            categoryIcon: MIXED_CATEGORY.icon || '',
          }
        : {}),
    })),
  };
}

function GeneratorFlow() {
  const t = useTranslations('generator');
  // ?quick=1 (the "Überrasch mich" path): start with 5 mixed rounds and jump
  // straight to the preview — details can be filled in at the end.
  const quick = useSearchParams().get('quick') === '1';
  const [step, setStep] = useState(quick ? 2 : 1);
  const [config, setConfig] = useState<QuizConfig>(() => makeConfig(quick));
  const [roundsData, setRoundsData] = useState<RoundQuestions[]>([]);

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
      {step === 1 && (
        <StepRounds
          config={config}
          onChange={setConfig}
          onNext={() => {
            setRoundsData([]);
            setStep(2);
          }}
        />
      )}
      {step === 2 && (
        <StepPreview
          config={config}
          roundsData={roundsData}
          setRoundsData={setRoundsData}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
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
