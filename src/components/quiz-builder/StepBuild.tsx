'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Category, QuizConfig, QuizQuestion, RoundConfig } from '@/types/quiz';
import CategorySelector from '@/components/CategorySelector';
import QuestionCard from '@/components/QuestionCard';
import { getSessionId } from '@/lib/session-id';

const MIN_ROUNDS = 3;
const MAX_ROUNDS = 8;

export function makeRound(roundNumber: number): RoundConfig {
  return {
    roundNumber,
    categoryId: 0,
    categorySlug: '',
    categoryName: '',
    categoryIcon: '',
    questionsPerRound: 10,
  };
}

interface RoundQuestions {
  questions: QuizQuestion[];
  expanded: boolean;
}

interface Props {
  config: QuizConfig;
  onChange: (config: QuizConfig) => void;
  roundsData: RoundQuestions[];
  setRoundsData: React.Dispatch<React.SetStateAction<RoundQuestions[]>>;
  onNext: () => void;
}

// Combined configure + preview: each round card carries its own category and
// question-count controls; changing them regenerates that round in place.
export default function StepBuild({
  config,
  onChange,
  roundsData,
  setRoundsData,
  onNext,
}: Props) {
  const t = useTranslations('generator');
  const [categories, setCategories] = useState<Category[]>([]);
  const [initializing, setInitializing] = useState(roundsData.length === 0);
  const [loadingRounds, setLoadingRounds] = useState<Set<number>>(new Set());
  const [swapping, setSwapping] = useState<string | null>(null);

  const fetchQuestions = async (
    round: RoundConfig,
    excludeIds: number[]
  ): Promise<QuizQuestion[]> => {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-quiz-session': getSessionId() ?? '',
      },
      body: JSON.stringify({
        categoryId: round.categoryId,
        count: round.questionsPerRound,
        excludeIds,
        locale: config.locale,
      }),
    });
    return res.json();
  };

  const numberQuestions = (qs: QuizQuestion[], roundIndex: number) =>
    qs.map((q, j) => ({ ...q, roundNumber: roundIndex + 1, questionNumber: j + 1 }));

  // Mount: load categories, prefill unconfigured rounds with distinct
  // categories, and fetch questions for every round that has none yet.
  useEffect(() => {
    (async () => {
      try {
        const cats: Category[] = await (
          await fetch(`/api/questions/categories?locale=${config.locale}`)
        ).json();
        setCategories(cats);

        let rounds = config.rounds;
        if (cats.length > 0 && rounds.every((r) => r.categoryId === 0)) {
          rounds = rounds.map((round, i) => {
            const cat = cats[i % cats.length];
            return {
              ...round,
              categoryId: cat.id,
              categorySlug: cat.slug,
              categoryName: cat.name_de,
              categoryIcon: cat.icon || '',
            };
          });
          onChange({ ...config, rounds });
        }

        if (roundsData.length === 0) {
          const data: RoundQuestions[] = [];
          const excludeIds: number[] = [];
          for (let i = 0; i < rounds.length; i++) {
            const qs = await fetchQuestions(rounds[i], excludeIds);
            excludeIds.push(...qs.map((q) => q.id));
            data.push({ questions: numberQuestions(qs, i), expanded: true });
          }
          setRoundsData(data);
        }
      } catch {
        // keep whatever loaded
      }
      setInitializing(false);
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setRoundLoading = (i: number, on: boolean) =>
    setLoadingRounds((prev) => {
      const next = new Set(prev);
      if (on) next.add(i);
      else next.delete(i);
      return next;
    });

  const excludeIdsExcept = (skipIndex: number | null) =>
    roundsData.flatMap((r, j) =>
      j === skipIndex ? [] : r.questions.map((q) => q.id)
    );

  // Change category/count for a round and regenerate its questions in place.
  const updateRound = async (i: number, updates: Partial<RoundConfig>) => {
    const rounds = [...config.rounds];
    rounds[i] = { ...rounds[i], ...updates };
    onChange({ ...config, rounds, numberOfRounds: rounds.length });

    setRoundLoading(i, true);
    try {
      const qs = await fetchQuestions(rounds[i], excludeIdsExcept(i));
      setRoundsData((prev) => {
        const next = [...prev];
        next[i] = { questions: numberQuestions(qs, i), expanded: true };
        return next;
      });
    } catch {
      // keep old questions
    }
    setRoundLoading(i, false);
  };

  // Fresh questions for the same configuration (exclude the current ones too).
  const rerollRound = async (i: number) => {
    setRoundLoading(i, true);
    try {
      const exclude = [
        ...excludeIdsExcept(i),
        ...(roundsData[i]?.questions.map((q) => q.id) ?? []),
      ];
      let qs = await fetchQuestions(config.rounds[i], exclude);
      // Small category: allow repeats rather than an empty round
      if (qs.length < config.rounds[i].questionsPerRound) {
        qs = await fetchQuestions(config.rounds[i], excludeIdsExcept(i));
      }
      setRoundsData((prev) => {
        const next = [...prev];
        next[i] = { questions: numberQuestions(qs, i), expanded: true };
        return next;
      });
    } catch {
      // keep old questions
    }
    setRoundLoading(i, false);
  };

  const addRound = async () => {
    if (config.rounds.length >= MAX_ROUNDS) return;
    const usedIds = new Set(config.rounds.map((r) => r.categoryId));
    const unused = categories.filter((c) => !usedIds.has(c.id));
    const pool = unused.length > 0 ? unused : categories;
    const cat = pool[Math.floor(Math.random() * pool.length)];
    if (!cat) return;

    const i = config.rounds.length;
    const round: RoundConfig = {
      ...makeRound(i + 1),
      categoryId: cat.id,
      categorySlug: cat.slug,
      categoryName: cat.name_de,
      categoryIcon: cat.icon || '',
      questionsPerRound: config.rounds[i - 1]?.questionsPerRound ?? 10,
    };
    const rounds = [...config.rounds, round];
    onChange({ ...config, rounds, numberOfRounds: rounds.length });
    setRoundsData((prev) => [...prev, { questions: [], expanded: true }]);

    setRoundLoading(i, true);
    try {
      const qs = await fetchQuestions(round, excludeIdsExcept(null));
      setRoundsData((prev) => {
        const next = [...prev];
        next[i] = { questions: numberQuestions(qs, i), expanded: true };
        return next;
      });
    } catch {
      // leave empty; user can re-roll
    }
    setRoundLoading(i, false);
  };

  const removeRound = (i: number) => {
    if (config.rounds.length <= MIN_ROUNDS) return;
    const rounds = config.rounds
      .filter((_, j) => j !== i)
      .map((r, j) => ({ ...r, roundNumber: j + 1 }));
    onChange({ ...config, rounds, numberOfRounds: rounds.length });
    setRoundsData((prev) => prev.filter((_, j) => j !== i));
  };

  const handleSwap = async (roundIndex: number, questionIndex: number) => {
    const swapKey = `${roundIndex}-${questionIndex}`;
    setSwapping(swapKey);
    try {
      const res = await fetch('/api/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: config.rounds[roundIndex].categoryId,
          excludeIds: roundsData.flatMap((r) => r.questions.map((q) => q.id)),
          locale: config.locale,
        }),
      });
      const newQuestion = await res.json();
      if (newQuestion) {
        setRoundsData((prev) => {
          const next = [...prev];
          const questions = [...next[roundIndex].questions];
          questions[questionIndex] = {
            ...newQuestion,
            roundNumber: roundIndex + 1,
            questionNumber: questionIndex + 1,
          };
          next[roundIndex] = { ...next[roundIndex], questions };
          return next;
        });
      }
    } catch {
      // silently fail
    }
    setSwapping(null);
  };

  const toggleRound = (i: number) =>
    setRoundsData((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], expanded: !next[i].expanded };
      return next;
    });

  if (initializing) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-4 animate-pulse">🧠</div>
        <p className="text-[var(--muted)]">{t('loading')}</p>
      </div>
    );
  }

  const ready =
    roundsData.length > 0 &&
    roundsData.every((r) => r.questions.length > 0) &&
    loadingRounds.size === 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-[var(--gold)]">{t('step1')}</h2>

      {config.rounds.map((round, i) => {
        const data = roundsData[i];
        const isLoading = loadingRounds.has(i);
        return (
          <div
            key={i}
            className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl overflow-hidden"
          >
            {/* Round header = its configuration */}
            <div className="flex flex-wrap items-center gap-2 p-4 border-b border-[var(--dark-border)]">
              <button
                onClick={() => toggleRound(i)}
                className="text-[var(--muted)] hover:text-[var(--foreground)] px-1"
                title={data?.expanded ? '▲' : '▼'}
              >
                {data?.expanded ? '▼' : '▶'}
              </button>
              <span className="font-bold whitespace-nowrap">
                {t('round')} {i + 1}
              </span>
              <div className="flex-1 min-w-[180px]">
                <CategorySelector
                  categories={categories}
                  value={round.categoryId}
                  onChange={(cat) =>
                    updateRound(i, {
                      categoryId: cat.id,
                      categorySlug: cat.slug,
                      categoryName: cat.name_de,
                      categoryIcon: cat.icon || '',
                    })
                  }
                />
              </div>
              <select
                value={round.questionsPerRound}
                onChange={(e) =>
                  updateRound(i, { questionsPerRound: parseInt(e.target.value) })
                }
                className="bg-[var(--background)] border border-[var(--dark-border)] rounded-lg px-3 py-3 text-sm text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
                title={t('questionsPerRound')}
              >
                {[5, 8, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} {t('questions')}
                  </option>
                ))}
              </select>
              <button
                onClick={() => rerollRound(i)}
                disabled={isLoading}
                className="px-3 py-2.5 rounded-lg text-sm border border-[var(--dark-border)] hover:border-[var(--gold)] transition-colors disabled:opacity-30"
                title={t('rerollRound')}
              >
                🎲
              </button>
              {config.rounds.length > MIN_ROUNDS && (
                <button
                  onClick={() => removeRound(i)}
                  disabled={isLoading}
                  className="px-3 py-2.5 rounded-lg text-sm border border-[var(--dark-border)] text-[var(--muted)] hover:border-red-400 hover:text-red-400 transition-colors disabled:opacity-30"
                  title={t('removeRound')}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Questions */}
            {data?.expanded && (
              <div className="px-5 py-4 space-y-3">
                {isLoading ? (
                  <p className="text-center text-[var(--muted)] animate-pulse py-6">
                    {t('loading')}
                  </p>
                ) : (
                  data.questions.map((question, qIndex) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      onSwap={() => handleSwap(i, qIndex)}
                      swapDisabled={swapping === `${i}-${qIndex}`}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}

      {config.rounds.length < MAX_ROUNDS && (
        <button
          onClick={addRound}
          className="w-full border border-dashed border-[var(--dark-border)] py-3 rounded-2xl text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
        >
          + {t('addRound')}
        </button>
      )}

      <button
        onClick={onNext}
        disabled={!ready}
        className="w-full bg-[var(--gold)] text-[var(--background)] py-3 rounded-lg font-bold hover:bg-[var(--gold-light)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {t('toDownload')} →
      </button>
    </div>
  );
}
