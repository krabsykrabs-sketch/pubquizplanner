'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Brain, Dices, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Category, QuizConfig, QuizQuestion, RoundConfig } from '@/types/quiz';
import CategorySelector from '@/components/CategorySelector';
import QuestionCard from '@/components/QuestionCard';
import Button from '@/components/ds/Button';
import IconButton from '@/components/ds/IconButton';
import Select from '@/components/ds/Select';
import { categoryIcon } from '@/lib/category-visuals';
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
  // One round is shown at a time; the switcher above the panel navigates.
  const [activeRound, setActiveRound] = useState(0);

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
    setActiveRound(i);

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
    setActiveRound((a) => Math.min(a > i ? a - 1 : a, rounds.length - 1));
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

  if (initializing) {
    return (
      <div className="py-20 text-center">
        <Brain className="mx-auto mb-4 h-10 w-10 animate-pulse text-[var(--accent)]" aria-hidden />
        <p className="text-[var(--text-muted)]">{t('loading')}</p>
      </div>
    );
  }

  const ready =
    roundsData.length > 0 &&
    roundsData.every((r) => r.questions.length > 0) &&
    loadingRounds.size === 0;

  // Never point past the end (rounds can be removed).
  const current = Math.min(activeRound, config.rounds.length - 1);
  const round = config.rounds[current];
  const data = roundsData[current];
  const isLoading = loadingRounds.has(current);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <h2 className="font-display text-[1.75rem] font-extrabold tracking-[-0.02em] text-[var(--text-strong)]">
        {t('step1')}
      </h2>

      {/* Round switcher — one round is shown at a time. Sticky below the site
          header so orientation survives long question lists. */}
      <nav
        aria-label={t('rounds')}
        className="sticky top-[70px] z-40 -mx-4 border-b border-[var(--border-subtle)] bg-[var(--bg-page)]/95 px-4 py-3 [backdrop-filter:blur(8px)]"
      >
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {config.rounds.map((r, i) => {
            const on = i === current;
            const Icon = categoryIcon(r.categorySlug);
            const count = roundsData[i]?.questions.length || r.questionsPerRound;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActiveRound(i)}
                aria-current={on ? 'true' : undefined}
                className={`flex items-center gap-2.5 rounded-ds-lg border-[1.5px] px-3 py-2 text-left transition-colors ${
                  on
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                    : 'border-[var(--border-subtle)] bg-[var(--surface-card)] hover:border-[var(--border-strong)]'
                }`}
              >
                <span
                  className={`flex h-8 w-8 flex-none items-center justify-center rounded-ds ${
                    on
                      ? 'bg-[var(--accent)] text-[var(--text-on-accent)]'
                      : 'bg-[var(--surface-inset)] text-[var(--text-muted)]'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span
                    className={`block truncate text-[0.85rem] font-semibold leading-tight ${
                      on ? 'text-[var(--accent-text)]' : 'text-[var(--text-strong)]'
                    }`}
                  >
                    {t('round')} <span className="font-mono">{i + 1}</span>
                    {r.categoryName ? ` · ${r.categoryName}` : ''}
                  </span>
                  <span
                    className={`block font-mono text-[0.68rem] leading-tight text-[var(--text-faint)] ${
                      loadingRounds.has(i) ? 'animate-pulse' : ''
                    }`}
                  >
                    {loadingRounds.has(i)
                      ? t('loading')
                      : `${count} ${t('questions')}`}
                  </span>
                </span>
              </button>
            );
          })}
          {config.rounds.length < MAX_ROUNDS && (
            <button
              type="button"
              onClick={addRound}
              title={t('addRound')}
              className="flex items-center justify-center gap-1.5 rounded-ds-lg border-[1.5px] border-dashed border-[var(--border-strong)] px-3 py-2 text-[0.85rem] font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent-text)]"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {t('addRound')}
            </button>
          )}
        </div>
      </nav>

      {/* Active round */}
      <div className="overflow-hidden rounded-ds-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-warm-sm">
        {/* Round header = its configuration */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4">
          <span className="whitespace-nowrap font-semibold text-[var(--text-strong)]">
            {t('round')}{' '}
            <span className="font-mono text-[var(--accent-text)]">{current + 1}</span>
          </span>
          <div className="min-w-[180px] flex-1">
            <CategorySelector
              categories={categories}
              value={round.categoryId}
              onChange={(cat) =>
                updateRound(current, {
                  categoryId: cat.id,
                  categorySlug: cat.slug,
                  categoryName: cat.name_de,
                  categoryIcon: cat.icon || '',
                })
              }
            />
          </div>
          <Select
            value={round.questionsPerRound}
            onChange={(e) =>
              updateRound(current, { questionsPerRound: parseInt(e.target.value) })
            }
            title={t('questionsPerRound')}
          >
            {[5, 8, 10].map((n) => (
              <option key={n} value={n}>
                {n} {t('questions')}
              </option>
            ))}
          </Select>
          <IconButton
            label={t('rerollRound')}
            variant="outline"
            onClick={() => rerollRound(current)}
            disabled={isLoading}
          >
            <Dices className="h-[18px] w-[18px]" aria-hidden />
          </IconButton>
          {config.rounds.length > MIN_ROUNDS && (
            <IconButton
              label={t('removeRound')}
              variant="outline"
              onClick={() => removeRound(current)}
              disabled={isLoading}
              className="hover:border-[var(--danger)] hover:text-[var(--danger)]"
            >
              <X className="h-[18px] w-[18px]" aria-hidden />
            </IconButton>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-3 px-5 py-4">
          {isLoading ? (
            <p className="animate-pulse py-6 text-center text-[var(--text-muted)]">
              {t('loading')}
            </p>
          ) : (
            (data?.questions ?? []).map((question, qIndex) => (
              <QuestionCard
                key={question.id}
                question={question}
                onSwap={() => handleSwap(current, qIndex)}
                swapDisabled={swapping === `${current}-${qIndex}`}
              />
            ))
          )}
        </div>
      </div>

      <Button
        size="lg"
        fullWidth
        onClick={onNext}
        disabled={!ready}
        iconRight={<ArrowRight className="h-5 w-5" aria-hidden />}
      >
        {t('toDownload')}
      </Button>
    </div>
  );
}
