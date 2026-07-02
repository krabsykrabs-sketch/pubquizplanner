'use client';

import type { Category } from '@/types/quiz';

// Sentinel category for "Gemischt" rounds: questions from all categories.
export const MIXED_CATEGORY: Pick<Category, 'id' | 'slug' | 'name_de' | 'icon'> = {
  id: -1,
  slug: 'gemischt',
  name_de: 'Gemischt (alle Kategorien)',
  icon: '🎲',
};

interface Props {
  categories: Category[];
  value: number;
  onChange: (category: Pick<Category, 'id' | 'slug' | 'name_de' | 'icon'>) => void;
}

export default function CategorySelector({ categories, value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => {
        const id = parseInt(e.target.value);
        const cat =
          id === MIXED_CATEGORY.id ? MIXED_CATEGORY : categories.find((c) => c.id === id);
        if (cat) onChange(cat);
      }}
      className="w-full bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-4 py-3 text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none transition-colors"
    >
      <option value={0}>Kategorie wählen...</option>
      <option value={MIXED_CATEGORY.id}>
        {MIXED_CATEGORY.icon} {MIXED_CATEGORY.name_de}
      </option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.icon} {cat.name_de}
        </option>
      ))}
    </select>
  );
}
