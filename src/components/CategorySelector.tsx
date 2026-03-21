'use client';

import type { Category } from '@/types/quiz';

interface Props {
  categories: Category[];
  value: number;
  onChange: (category: Category) => void;
}

export default function CategorySelector({ categories, value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => {
        const cat = categories.find((c) => c.id === parseInt(e.target.value));
        if (cat) onChange(cat);
      }}
      className="w-full bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-4 py-3 text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none transition-colors"
    >
      <option value={0}>Kategorie wählen...</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.icon} {cat.name_de}
        </option>
      ))}
    </select>
  );
}
