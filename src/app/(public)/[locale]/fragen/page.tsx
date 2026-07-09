import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { query } from '@/lib/db';
import Button from '@/components/ds/Button';
import CategoryTile from '@/components/ds/CategoryTile';
import { categoryIcon, categoryVisual } from '@/lib/category-visuals';
import {
  SOURCE_LOCALE,
  localeAlternates,
  MIN_QUESTIONS_PER_CATEGORY as MIN_QUESTIONS,
} from '@/config/locales';
import {
  BASE_URL,
  JsonLd,
  breadcrumbSchema,
  itemListSchema,
} from '@/lib/structured-data';

export const dynamic = 'force-dynamic';

const SAMPLES_PER_CATEGORY = 3;

interface CategoryWithCount {
  id: number;
  slug: string;
  name_de: string;
  icon: string;
  count: number;
}

interface SampleQuestion {
  category_slug: string;
  text_de: string;
  answer_de: string;
}

// For non-German locales only translated questions count and the localized
// category name is aliased onto name_de.
async function getActiveCategories(locale: string): Promise<CategoryWithCount[]> {
  if (locale === SOURCE_LOCALE) {
    return query<CategoryWithCount>(
      `SELECT c.id, c.slug, c.name_de, c.icon, COUNT(q.id)::int as count
       FROM categories c
       JOIN questions q ON q.category_id = c.id
       WHERE q.status = 'approved'
       GROUP BY c.id
       HAVING COUNT(q.id) >= $1
       ORDER BY COUNT(q.id) DESC`,
      [MIN_QUESTIONS]
    );
  }
  return query<CategoryWithCount>(
    `SELECT c.id, c.slug, ct.name AS name_de, c.icon, COUNT(q.id)::int as count
     FROM categories c
     JOIN category_translations ct ON ct.category_id = c.id AND ct.locale = $2
     JOIN questions q ON q.category_id = c.id AND q.status = 'approved'
     JOIN question_translations t ON t.question_id = q.id
       AND t.locale = $2 AND t.status IN ('machine', 'reviewed')
     GROUP BY c.id, ct.name
     HAVING COUNT(q.id) >= $1
     ORDER BY COUNT(q.id) DESC`,
    [MIN_QUESTIONS, locale]
  );
}

// A few random questions from each qualifying category — real content depth
// for the hub, fresh on every request.
async function getSampleQuestions(
  categoryIds: number[],
  locale: string
): Promise<SampleQuestion[]> {
  if (categoryIds.length === 0) return [];
  if (locale === SOURCE_LOCALE) {
    return query<SampleQuestion>(
      `SELECT c.slug AS category_slug, s.text_de, s.answer_de
       FROM categories c
       JOIN LATERAL (
         SELECT q.text_de, q.answer_de
         FROM questions q
         WHERE q.category_id = c.id AND q.status = 'approved'
         ORDER BY RANDOM()
         LIMIT $2
       ) s ON true
       WHERE c.id = ANY($1)`,
      [categoryIds, SAMPLES_PER_CATEGORY]
    );
  }
  return query<SampleQuestion>(
    `SELECT c.slug AS category_slug, s.text AS text_de, s.answer AS answer_de
     FROM categories c
     JOIN LATERAL (
       SELECT t.text, t.answer
       FROM questions q
       JOIN question_translations t ON t.question_id = q.id
         AND t.locale = $3 AND t.status IN ('machine', 'reviewed')
       WHERE q.category_id = c.id AND q.status = 'approved'
       ORDER BY RANDOM()
       LIMIT $2
     ) s ON true
     WHERE c.id = ANY($1)`,
    [categoryIds, SAMPLES_PER_CATEGORY, locale]
  );
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'fragen' });
  const categories = await getActiveCategories(locale);
  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);
  // Round down for a stable, non-overpromising number in meta text
  const roundedCount = Math.floor(totalCount / 50) * 50;

  const title = t('indexMetaTitle');
  const description = t('indexMetaDescription', {
    count: roundedCount,
    categoryCount: categories.length,
  });

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/fragen`,
      languages: localeAlternates('/fragen'),
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/fragen`,
    },
  };
}

export default async function FragenIndexPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'fragen' });
  const categories = await getActiveCategories(locale);
  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);
  const roundedCount = Math.floor(totalCount / 50) * 50;
  const samples = await getSampleQuestions(
    categories.map((c) => c.id),
    locale
  );
  const samplesByCategory = new Map<string, SampleQuestion[]>();
  for (const s of samples) {
    const list = samplesByCategory.get(s.category_slug) ?? [];
    list.push(s);
    samplesByCategory.set(s.category_slug, list);
  }

  const collectionPage = {
    '@type': 'CollectionPage',
    name: t('indexMetaTitle'),
    description: t('indexMetaDescription', {
      count: roundedCount,
      categoryCount: categories.length,
    }),
    url: `${BASE_URL}/${locale}/fragen`,
    inLanguage: locale,
    isPartOf: { '@id': `${BASE_URL}/#website` },
    mainEntity: itemListSchema(
      categories.map((cat) => ({
        name: cat.name_de,
        url: `${BASE_URL}/${locale}/fragen/${cat.slug}`,
        numberOfItems: cat.count,
      }))
    ),
  };

  const breadcrumb = breadcrumbSchema([
    { name: t('breadcrumbHome'), url: `${BASE_URL}/${locale}` },
    { name: t('breadcrumbQuestions'), url: `${BASE_URL}/${locale}/fragen` },
  ]);

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <JsonLd data={[breadcrumb, collectionPage]} />

      <h1 className="mb-6 font-display text-4xl font-extrabold tracking-[-0.02em] text-[var(--text-strong)] md:text-5xl">
        {t('indexTitle')}
      </h1>

      {/* Substantial intro */}
      <div className="mb-6 max-w-3xl space-y-4 text-lg leading-relaxed text-[var(--text-body)]">
        <p>{t('indexIntro1', { count: roundedCount })}</p>
        <p>{t('indexIntro2', { categoryCount: categories.length })}</p>
        <p>{t('indexIntro3')}</p>
      </div>

      <p className="mb-6 font-mono text-sm text-[var(--text-muted)]">
        {t('countLine', { count: totalCount, categoryCount: categories.length })}
      </p>

      {/* Category navigation */}
      <nav
        className="mb-12 flex flex-wrap gap-2"
        aria-label={t('categoriesAria')}
      >
        {categories.map((cat) => {
          const Icon = categoryIcon(cat.slug);
          return (
            <Link
              key={cat.slug}
              href={`/${locale}/fragen/${cat.slug}`}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] border-[var(--border-strong)] bg-[var(--surface-card)] px-4 py-2 text-sm font-medium text-[var(--text-body)] transition-colors hover:bg-[var(--surface-inset)] hover:text-[var(--text-strong)]"
            >
              <Icon className="h-4 w-4" aria-hidden /> {cat.name_de}
            </Link>
          );
        })}
      </nav>

      {/* Category grid */}
      <h2 className="mb-6 font-display text-2xl font-extrabold tracking-[-0.02em] text-[var(--text-strong)] md:text-3xl">
        {t('gridHeading')}
      </h2>
      <div className="mb-16 grid gap-4 sm:grid-cols-2">
        {categories.map((cat) => (
          <CategoryTile
            key={cat.slug}
            title={cat.name_de}
            subtitle={t('questionsLabel', { count: cat.count })}
            image={categoryVisual(cat.slug)?.background}
            href={`/${locale}/fragen/${cat.slug}`}
            ratio="4 / 3"
          />
        ))}
      </div>

      {/* Sample questions per category */}
      <h2 className="mb-2 font-display text-2xl font-extrabold tracking-[-0.02em] text-[var(--text-strong)] md:text-3xl">
        {t('samplesHeading')}
      </h2>
      <p className="mb-8 text-[var(--text-muted)]">{t('samplesSubline')}</p>
      <div className="mb-16 space-y-10">
        {categories.map((cat) => {
          const catSamples = samplesByCategory.get(cat.slug) ?? [];
          if (catSamples.length === 0) return null;
          const Icon = categoryIcon(cat.slug);
          return (
            <section key={cat.slug}>
              <h3 className="mb-3 flex items-center gap-2.5 font-display text-lg font-bold text-[var(--text-strong)]">
                <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-ds bg-[var(--accent-soft)] text-[var(--accent-text)]">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                {cat.name_de}
              </h3>
              <div className="space-y-2">
                {catSamples.map((q, i) => (
                  <details
                    key={i}
                    className="group overflow-hidden rounded-ds-lg border border-[var(--border-subtle)] bg-[var(--surface-card)]"
                  >
                    <summary className="flex cursor-pointer select-none list-none items-start gap-3 p-4 [&::-webkit-details-marker]:hidden">
                      <span className="flex-1 text-[var(--text-body)]">{q.text_de}</span>
                      <ChevronDown
                        className="mt-1 h-4 w-4 shrink-0 text-[var(--text-faint)] transition-transform group-open:rotate-180"
                        aria-hidden
                      />
                    </summary>
                    <div className="border-t border-[var(--border-subtle)] px-4 pb-4 pt-3">
                      <p className="font-medium text-[var(--accent-text)]">
                        &rarr; {q.answer_de}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
              <Link
                href={`/${locale}/fragen/${cat.slug}`}
                className="mt-3 inline-flex items-center gap-[7px] text-sm font-semibold text-[var(--link)] no-underline transition-colors hover:text-[var(--link-hover)]"
              >
                {t('sampleMoreLink', { count: cat.count, name: cat.name_de })}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </section>
          );
        })}
      </div>

      {/* Create your own quiz */}
      <section
        data-theme="dark"
        className="relative overflow-hidden rounded-ds-xl bg-[var(--night-800)] p-8 text-center"
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 120% at 50% 0%, rgba(217,110,42,0.22), transparent 60%)',
          }}
        />
        <div className="relative">
          <h2 className="mb-3 font-display text-2xl font-extrabold tracking-[-0.02em] text-white">
            {t('createHeading')}
          </h2>
          <p className="mx-auto mb-6 max-w-xl text-[var(--text-body)]">
            {t('createText')}
          </p>
          <Button
            size="lg"
            href={`/${locale}/generator`}
            iconRight={<ArrowRight className="h-5 w-5" aria-hidden />}
          >
            {t('ctaButton')}
          </Button>
        </div>
      </section>
    </main>
  );
}
