'use client';

import { useTranslations } from 'next-intl';
import type { QuizConfig } from '@/types/quiz';

interface Props {
  config: QuizConfig;
  onChange: (config: QuizConfig) => void;
  onNext: () => void;
}

export default function StepSetup({ config, onChange, onNext }: Props) {
  const t = useTranslations('generator');

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold text-[var(--gold)]">{t('step1')}</h2>

      {/* Quiz Title */}
      <div>
        <label className="block text-sm font-medium text-[var(--muted)] mb-2">
          {t('quizTitle')}
        </label>
        <input
          type="text"
          value={config.title}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          placeholder={t('quizTitleDefault')}
          className="w-full bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-4 py-3 text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none transition-colors"
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-[var(--muted)] mb-2">
          {t('date')}
        </label>
        <input
          type="date"
          value={config.date}
          onChange={(e) => onChange({ ...config, date: e.target.value })}
          className="w-full bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-4 py-3 text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none transition-colors"
        />
      </div>

      {/* Venue */}
      <div>
        <label className="block text-sm font-medium text-[var(--muted)] mb-2">
          {t('venue')}
        </label>
        <input
          type="text"
          value={config.venue}
          onChange={(e) => onChange({ ...config, venue: e.target.value })}
          className="w-full bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-4 py-3 text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none transition-colors"
        />
      </div>

      {/* Number of Rounds */}
      <div>
        <label className="block text-sm font-medium text-[var(--muted)] mb-2">
          {t('numberOfRounds')}
        </label>
        <select
          value={config.numberOfRounds}
          onChange={(e) => {
            const num = parseInt(e.target.value);
            const rounds = Array.from({ length: num }, (_, i) => ({
              roundNumber: i + 1,
              categoryId: config.rounds[i]?.categoryId || 0,
              categorySlug: config.rounds[i]?.categorySlug || '',
              categoryName: config.rounds[i]?.categoryName || '',
              categoryIcon: config.rounds[i]?.categoryIcon || '',
              difficulty: config.rounds[i]?.difficulty || [1, 2, 3, 4],
              questionsPerRound: config.rounds[i]?.questionsPerRound || 10,
              roundType: config.rounds[i]?.roundType || ('standard' as const),
            }));
            onChange({ ...config, numberOfRounds: num, rounds });
          }}
          className="w-full bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-4 py-3 text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none transition-colors"
        >
          {[3, 4, 5, 6, 7, 8].map((n) => (
            <option key={n} value={n}>
              {n} Runden
            </option>
          ))}
        </select>
      </div>

      {/* Answer Placement */}
      <div>
        <label className="block text-sm font-medium text-[var(--muted)] mb-2">
          {t('answerPlacement')}
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="answerPlacement"
              value="after_each"
              checked={config.answerPlacement === 'after_each'}
              onChange={() =>
                onChange({ ...config, answerPlacement: 'after_each' })
              }
              className="accent-[var(--gold)]"
            />
            <span>{t('afterEach')}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="answerPlacement"
              value="all_at_end"
              checked={config.answerPlacement === 'all_at_end'}
              onChange={() =>
                onChange({ ...config, answerPlacement: 'all_at_end' })
              }
              className="accent-[var(--gold)]"
            />
            <span>{t('allAtEnd')}</span>
          </label>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-[var(--gold)] text-[var(--background)] py-3 rounded-lg font-bold text-lg hover:bg-[var(--gold-light)] transition-colors"
      >
        {t('next')} →
      </button>
    </div>
  );
}
