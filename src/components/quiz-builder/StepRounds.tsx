'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Category, QuizConfig, RoundConfig } from '@/types/quiz';
import CategorySelector from '@/components/CategorySelector';
import DifficultySelector from '@/components/DifficultySelector';

const MIN_ROUNDS = 3;
const MAX_ROUNDS = 8;

export function makeRound(roundNumber: number): RoundConfig {
  return {
    roundNumber,
    categoryId: 0,
    categorySlug: '',
    categoryName: '',
    categoryIcon: '',
    difficulty: [1, 2, 3],
    questionsPerRound: 10,
  };
}

interface Props {
  config: QuizConfig;
  onChange: (config: QuizConfig) => void;
  onNext: () => void;
}

export default function StepRounds({ config, onChange, onNext }: Props) {
  const t = useTranslations('generator');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/questions/categories')
      .then((res) => res.json())
      .then((cats: Category[]) => {
        setCategories(cats);
        // First visit: prefill each round with a distinct category so the
        // step is one click away from a working quiz.
        if (cats.length > 0 && config.rounds.every((r) => r.categoryId === 0)) {
          const rounds = config.rounds.map((round, i) => {
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
      })
      .catch(console.error);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateRound = (index: number, updates: Partial<RoundConfig>) => {
    const newRounds = [...config.rounds];
    newRounds[index] = { ...newRounds[index], ...updates };
    onChange({ ...config, rounds: newRounds, numberOfRounds: newRounds.length });
  };

  const addRound = () => {
    if (config.rounds.length >= MAX_ROUNDS) return;
    const rounds = [...config.rounds, makeRound(config.rounds.length + 1)];
    onChange({ ...config, rounds, numberOfRounds: rounds.length });
  };

  const removeRound = (index: number) => {
    if (config.rounds.length <= MIN_ROUNDS) return;
    const rounds = config.rounds
      .filter((_, i) => i !== index)
      .map((r, i) => ({ ...r, roundNumber: i + 1 }));
    onChange({ ...config, rounds, numberOfRounds: rounds.length });
  };

  const allRoundsConfigured = config.rounds.every((r) => r.categoryId !== 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-[var(--gold)]">{t('step1')}</h2>

      {config.rounds.map((round, i) => (
        <div
          key={i}
          className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">
              {t('round')} {i + 1}
            </h3>
            {config.rounds.length > MIN_ROUNDS && (
              <button
                onClick={() => removeRound(i)}
                className="text-sm text-[var(--muted)] hover:text-red-400 transition-colors"
                title={t('removeRound')}
              >
                ✕ {t('removeRound')}
              </button>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              {t('category')}
            </label>
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

          {/* Difficulty */}
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              {t('difficulty')}
            </label>
            <DifficultySelector
              value={round.difficulty}
              onChange={(val) => updateRound(i, { difficulty: val })}
            />
          </div>

          {/* Questions per round */}
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              {t('questionsPerRound')}
            </label>
            <select
              value={round.questionsPerRound}
              onChange={(e) =>
                updateRound(i, { questionsPerRound: parseInt(e.target.value) })
              }
              className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-4 py-2 text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
            >
              {[5, 8, 10].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}

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
        disabled={!allRoundsConfigured}
        className="w-full bg-[var(--gold)] text-[var(--background)] py-3 rounded-lg font-bold hover:bg-[var(--gold-light)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {t('next')} →
      </button>
    </div>
  );
}
