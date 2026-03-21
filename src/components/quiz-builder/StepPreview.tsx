'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { QuizConfig, QuizQuestion } from '@/types/quiz';
import QuestionCard from '@/components/QuestionCard';

interface RoundQuestions {
  questions: QuizQuestion[];
  swapsUsed: number;
  expanded: boolean;
}

interface Props {
  config: QuizConfig;
  roundsData: RoundQuestions[];
  setRoundsData: (data: RoundQuestions[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepPreview({
  config,
  roundsData,
  setRoundsData,
  onNext,
  onBack,
}: Props) {
  const t = useTranslations('generator');
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState<string | null>(null);

  const maxSwaps = 3;

  useEffect(() => {
    if (roundsData.length > 0 && roundsData.some((r) => r.questions.length > 0)) return;

    setLoading(true);
    const fetchAll = config.rounds.map((round) =>
      fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: round.categoryId,
          difficulty: round.difficulty,
          count: round.questionsPerRound,
          roundType: round.roundType,
        }),
      }).then((res) => res.json())
    );

    Promise.all(fetchAll)
      .then((results) => {
        const data: RoundQuestions[] = results.map((questions, i) => ({
          questions: questions.map((q: QuizQuestion, j: number) => ({
            ...q,
            roundNumber: i + 1,
            questionNumber: j + 1,
          })),
          swapsUsed: 0,
          expanded: true,
        }));
        setRoundsData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSwap = async (roundIndex: number, questionIndex: number) => {
    const round = roundsData[roundIndex];
    if (round.swapsUsed >= maxSwaps) return;

    const swapKey = `${roundIndex}-${questionIndex}`;
    setSwapping(swapKey);

    const excludeIds = round.questions.map((q) => q.id);
    const roundConfig = config.rounds[roundIndex];

    try {
      const res = await fetch('/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: roundConfig.categoryId,
          difficulty: roundConfig.difficulty,
          roundType: roundConfig.roundType,
          excludeIds,
        }),
      });
      const newQuestion = await res.json();

      if (newQuestion) {
        const newData = [...roundsData];
        const newQuestions = [...round.questions];
        newQuestions[questionIndex] = {
          ...newQuestion,
          roundNumber: roundIndex + 1,
          questionNumber: questionIndex + 1,
        };
        newData[roundIndex] = {
          ...round,
          questions: newQuestions,
          swapsUsed: round.swapsUsed + 1,
        };
        setRoundsData(newData);
      }
    } catch {
      // silently fail
    }
    setSwapping(null);
  };

  const toggleRound = (index: number) => {
    const newData = [...roundsData];
    newData[index] = { ...newData[index], expanded: !newData[index].expanded };
    setRoundsData(newData);
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4 animate-pulse">🧠</div>
        <p className="text-[var(--muted)]">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-[var(--gold)]">{t('step3')}</h2>

      {roundsData.map((round, roundIndex) => (
        <div
          key={roundIndex}
          className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl overflow-hidden"
        >
          <button
            onClick={() => toggleRound(roundIndex)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--background)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {config.rounds[roundIndex]?.categoryIcon}
              </span>
              <span className="font-bold">
                {t('round')} {roundIndex + 1}:{' '}
                {config.rounds[roundIndex]?.categoryName}
              </span>
              <span className="text-sm text-[var(--muted)]">
                ({round.questions.length} Fragen)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--muted)] font-mono">
                {maxSwaps - round.swapsUsed} {t('swapsLeft')}
              </span>
              <span className="text-[var(--muted)]">
                {round.expanded ? '▼' : '▶'}
              </span>
            </div>
          </button>

          {round.expanded && (
            <div className="px-5 pb-5 space-y-3">
              {round.questions.map((question, qIndex) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  onSwap={() => handleSwap(roundIndex, qIndex)}
                  swapDisabled={
                    round.swapsUsed >= maxSwaps ||
                    swapping === `${roundIndex}-${qIndex}`
                  }
                />
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 border border-[var(--dark-border)] py-3 rounded-lg font-bold hover:border-[var(--gold)] transition-colors"
        >
          ← {t('back')}
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-[var(--gold)] text-[var(--background)] py-3 rounded-lg font-bold hover:bg-[var(--gold-light)] transition-colors"
        >
          {t('next')} →
        </button>
      </div>
    </div>
  );
}
