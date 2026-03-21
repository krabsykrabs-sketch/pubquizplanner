'use client';

interface Props {
  value: number[];
  onChange: (value: number[]) => void;
}

const LEVELS = [
  { label: '⭐', value: 1 },
  { label: '⭐⭐', value: 2 },
  { label: '⭐⭐⭐', value: 3 },
  { label: '⭐⭐⭐⭐', value: 4 },
];

export default function DifficultySelector({ value, onChange }: Props) {
  const toggle = (level: number) => {
    const isSelected = value.includes(level);
    // Prevent unchecking the last one
    if (isSelected && value.length <= 1) return;

    if (isSelected) {
      onChange(value.filter((v) => v !== level));
    } else {
      onChange([...value, level].sort());
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {LEVELS.map((opt) => {
        const checked = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
              checked
                ? 'bg-[var(--gold)] text-[var(--background)] border-[var(--gold)]'
                : 'bg-[var(--dark-card)] text-[var(--foreground)] border-[var(--dark-border)] hover:border-[var(--gold)] opacity-50'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
