'use client';

import { useTranslations } from 'next-intl';

interface Props {
  value: number | 'mixed';
  onChange: (value: number | 'mixed') => void;
}

export default function DifficultySelector({ value, onChange }: Props) {
  const t = useTranslations('generator');
  const options: { label: string; value: number | 'mixed' }[] = [
    { label: '⭐', value: 1 },
    { label: '⭐⭐', value: 2 },
    { label: '⭐⭐⭐', value: 3 },
    { label: '⭐⭐⭐⭐', value: 4 },
    { label: t('mixed'), value: 'mixed' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
            value === opt.value
              ? 'bg-[var(--gold)] text-[var(--background)] border-[var(--gold)]'
              : 'bg-[var(--dark-card)] text-[var(--foreground)] border-[var(--dark-border)] hover:border-[var(--gold)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
