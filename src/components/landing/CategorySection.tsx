'use client';

import { ArrowRight, Database } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ds/Button';
import CategoryTile from '@/components/ds/CategoryTile';
import Tag from '@/components/ds/Tag';
import { categoryVisual } from '@/lib/category-visuals';
import type { Locale } from '@/config/locales';
import { categoryPath, questionsIndexPath } from '@/config/slugs';
import type { CategoryChip } from './types';

// The six featured tiles lead with the design's picks, topped up from the
// remaining visible categories so the grid stays full.
const FEATURED_PICKS = [
  'kunst-kultur',
  'geschichte',
  'essen-trinken',
  'technik',
  'logik-mathe',
  'allgemeinwissen',
];

export default function CategorySection({
  locale,
  categories,
  displayCount,
}: {
  locale: string;
  categories: CategoryChip[];
  displayCount: number;
}) {
  const t = useTranslations('landing');
  const [activeCat, setActiveCat] = useState<string>('kunst-kultur');

  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const featured = FEATURED_PICKS.map((slug) => bySlug.get(slug)).filter(
    (c): c is CategoryChip => !!c
  );
  for (const c of categories) {
    if (featured.length >= 6) break;
    if (!featured.includes(c)) featured.push(c);
  }

  const hasCategories = categories.length > 0;

  return (
    <section
      id="kategorien"
      className="border-y border-[var(--border-subtle)] bg-[var(--bg-sunken)] py-[60px] nav:py-[92px]"
    >
      <div className="mx-auto max-w-container px-6">
        <span className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--accent-text)]">
          {t('kickerCategories')}
        </span>

        {hasCategories ? (
          <div>
            <h2 className="mb-0 mt-2.5 max-w-[26ch] font-display text-4xl font-extrabold tracking-[-0.02em] text-[var(--text-strong)]">
              {t.rich('categoriesTitle', {
                questions: displayCount.toLocaleString(locale),
                categoryCount: categories.length,
                n: (chunks) => (
                  <span className="font-mono text-[var(--accent-text)]">{chunks}</span>
                ),
              })}
            </h2>
            <p className="mb-0 mt-3 max-w-[54ch] text-base leading-[1.6] text-[var(--text-muted)]">
              {t('categoriesText')}
            </p>

            <div className="mb-6 mt-7 flex flex-wrap gap-2">
              {categories.map((c) => (
                <Tag
                  key={c.slug}
                  selected={c.slug === activeCat}
                  onClick={() => setActiveCat(c.slug)}
                >
                  {c.name_de}
                </Tag>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 nav:grid-cols-3">
              {featured.map((c) => (
                <CategoryTile
                  key={c.slug}
                  title={c.name_de}
                  subtitle={t('questionsCount', { count: c.question_count })}
                  image={categoryVisual(c.slug)?.background}
                  selected={c.slug === activeCat}
                  href={categoryPath(locale as Locale, c.slug)}
                  ratio="4 / 3"
                />
              ))}
            </div>

            <div className="mt-7">
              <a
                href={questionsIndexPath(locale as Locale)}
                className="inline-flex items-center gap-[7px] text-[0.95rem] font-semibold text-[var(--link)] no-underline transition-colors hover:text-[var(--link-hover)]"
              >
                {t('allQuestionsLink')}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="mb-0 mt-2.5 font-display text-4xl font-extrabold tracking-[-0.02em] text-[var(--text-strong)]">
              {t('categoriesEmptyTitle')}
            </h2>
            <div className="mt-7 flex flex-wrap items-center gap-5 rounded-ds-xl border-[1.5px] border-dashed border-[var(--border-strong)] bg-[var(--surface-card)] px-8 py-11">
              <div className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--surface-inset)] text-[var(--text-muted)]">
                <Database aria-hidden />
              </div>
              <div className="min-w-[240px] flex-1">
                <h3 className="m-0 mb-1 font-display text-[1.2rem] font-bold text-[var(--text-strong)]">
                  {t('categoriesEmptyHeading')}
                </h3>
                <p className="m-0 text-[0.95rem] text-[var(--text-muted)]">
                  {t('categoriesEmptyText')}
                </p>
              </div>
              <Button href={`/${locale}/generator`}>{t('cta')}</Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
