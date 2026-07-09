'use client';

import { useTranslations } from 'next-intl';
import Select from '@/components/ds/Select';
import type { Category } from '@/types/quiz';

// Sentinel id for "Gemischt" rounds: questions from all categories.
export const MIXED_CATEGORY_ID = -1;
export const MIXED_CATEGORY_SLUG = 'gemischt';
export const MIXED_CATEGORY_ICON = '🎲';

interface Props {
  categories: Category[];
  value: number;
  onChange: (category: Pick<Category, 'id' | 'slug' | 'name_de' | 'icon'>) => void;
}

export default function CategorySelector({ categories, value, onChange }: Props) {
  const t = useTranslations('generator');

  return (
    <Select
      value={value}
      onChange={(e) => {
        const id = parseInt(e.target.value);
        const cat =
          id === MIXED_CATEGORY_ID
            ? {
                id: MIXED_CATEGORY_ID,
                slug: MIXED_CATEGORY_SLUG,
                name_de: t('mixedCategory'),
                icon: MIXED_CATEGORY_ICON,
              }
            : categories.find((c) => c.id === id);
        if (cat) onChange(cat);
      }}
      className="w-full"
    >
      <option value={0}>{t('chooseCategory')}</option>
      <option value={MIXED_CATEGORY_ID}>{t('mixedCategory')}</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name_de}
        </option>
      ))}
    </Select>
  );
}
