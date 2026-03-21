'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { QuizConfig, QuizQuestion } from '@/types/quiz';
import StepSetup from '@/components/quiz-builder/StepSetup';
import StepRounds from '@/components/quiz-builder/StepRounds';
import StepPreview from '@/components/quiz-builder/StepPreview';
import StepDownload from '@/components/quiz-builder/StepDownload';

interface RoundQuestions {
  questions: QuizQuestion[];
  swapsUsed: number;
  expanded: boolean;
}

const defaultConfig: QuizConfig = {
  title: 'Quiz Abend',
  date: '',
  venue: '',
  numberOfRounds: 5,
  answerPlacement: 'all_at_end',
  rounds: Array.from({ length: 5 }, (_, i) => ({
    roundNumber: i + 1,
    categoryId: 0,
    categorySlug: '',
    categoryName: '',
    categoryIcon: '',
    difficulty: 'mixed' as const,
    questionsPerRound: 10,
    roundType: 'standard' as const,
  })),
};

export default function GeneratorPage() {
  const t = useTranslations('generator');
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<QuizConfig>(defaultConfig);
  const [roundsData, setRoundsData] = useState<RoundQuestions[]>([]);

  const stepLabels = [t('step1'), t('step2'), t('step3'), t('step4')];

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
              {i < 3 && (
                <div className="w-8 h-px bg-[var(--dark-border)]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      {step === 1 && (
        <StepSetup
          config={config}
          onChange={setConfig}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <StepRounds
          config={config}
          onChange={setConfig}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <StepPreview
          config={config}
          roundsData={roundsData}
          setRoundsData={setRoundsData}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <StepDownload
          config={config}
          roundsData={roundsData}
          onBack={() => setStep(3)}
        />
      )}
    </main>
  );
}
