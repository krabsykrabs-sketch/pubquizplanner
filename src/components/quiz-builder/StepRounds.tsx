'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Category, QuizConfig, RoundConfig } from '@/types/quiz';
import CategorySelector from '@/components/CategorySelector';
import DifficultySelector from '@/components/DifficultySelector';
import DifficultyPreview from '@/components/DifficultyPreview';

interface Props {
  config: QuizConfig;
  onChange: (config: QuizConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepRounds({ config, onChange, onNext, onBack }: Props) {
  const t = useTranslations('generator');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/questions/categories')
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const updateRound = (index: number, updates: Partial<RoundConfig>) => {
    const newRounds = [...config.rounds];
    newRounds[index] = { ...newRounds[index], ...updates };
    onChange({ ...config, rounds: newRounds });
  };

  const allRoundsConfigured = config.rounds.every((r) => r.categoryId > 0);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-[var(--gold)]">{t('step2')}</h2>

      {config.rounds.map((round, i) => (
        <div
          key={i}
          className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-6 space-y-4"
        >
          <h3 className="text-lg font-bold">
            {t('round')} {i + 1}
          </h3>

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
            <DifficultyPreview categoryId={round.categoryId} />
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

          {/* Round Type */}
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              {t('roundType')}
            </label>
            <select
              value={round.roundType}
              onChange={(e) =>
                updateRound(i, {
                  roundType: e.target.value as 'standard' | 'multiple_choice',
                })
              }
              className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-4 py-2 text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
            >
              <option value="standard">{t('standard')}</option>
              <option value="multiple_choice">{t('multipleChoice')}</option>
            </select>
          </div>
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
          disabled={!allRoundsConfigured}
          className="flex-1 bg-[var(--gold)] text-[var(--background)] py-3 rounded-lg font-bold hover:bg-[var(--gold-light)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {t('next')} →
        </button>
      </div>
    </div>
  );
}
