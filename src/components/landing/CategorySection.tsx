import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { CategoryChip } from './types';

// Dynamic category chips (only categories that clear the per-locale threshold)
// plus the rounded question count. Renders nothing when there are no categories.
export default async function CategorySection({
  locale,
  categories,
  displayCount,
}: {
  locale: string;
  categories: CategoryChip[];
  displayCount: number;
}) {
  if (categories.length === 0) return null;
  const t = await getTranslations('landing');

  return (
    <section className="max-w-4xl mx-auto px-6 pb-12 text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-2">
        {t('categoriesHeadline', { count: displayCount })}
      </h2>
      <p className="text-lg text-[var(--muted)] mb-8">
        {t('categoriesSubtitle', { categoryCount: categories.length })}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${locale}/fragen/${cat.slug}`}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium border border-[var(--dark-border)] bg-[var(--dark-card)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
          >
            <span>{cat.icon}</span>
            <span>{cat.name_de}</span>
          </Link>
        ))}
      </div>
      <Link
        href={`/${locale}/fragen`}
        className="inline-block mt-6 text-sm text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors"
      >
        {t('allQuestionsLink')} &rarr;
      </Link>
    </section>
  );
}
