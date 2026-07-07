import { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { query } from '@/lib/db';
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

      <h1 className="text-4xl md:text-5xl font-bold text-[var(--gold)] mb-6">
        {t('indexTitle')}
      </h1>

      {/* Substantial intro */}
      <div className="space-y-4 text-lg text-[var(--muted)] leading-relaxed max-w-3xl mb-6">
        <p>{t('indexIntro1', { count: roundedCount })}</p>
        <p>{t('indexIntro2', { categoryCount: categories.length })}</p>
        <p>{t('indexIntro3')}</p>
      </div>

      <p className="text-sm text-[var(--muted)] mb-6">
        {t('countLine', { count: totalCount, categoryCount: categories.length })}
      </p>

      {/* Category navigation */}
      <nav
        className="flex gap-2 overflow-x-auto pb-2 mb-12 scrollbar-hide -mx-6 px-6"
        aria-label={t('categoriesAria')}
      >
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${locale}/fragen/${cat.slug}`}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium border bg-[var(--dark-card)] border-[var(--dark-border)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--foreground)] transition-colors shrink-0"
          >
            {cat.icon} {cat.name_de}
          </Link>
        ))}
      </nav>

      {/* Category grid */}
      <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-6">
        {t('gridHeading')}
      </h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-16">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${locale}/fragen/${cat.slug}`}
            className="flex items-center gap-4 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 hover:border-[var(--gold)] transition-colors group"
          >
            <span className="text-3xl">{cat.icon}</span>
            <div className="flex-1">
              <h3 className="text-lg font-bold group-hover:text-[var(--gold)] transition-colors">
                {cat.name_de}
              </h3>
              <p className="text-sm text-[var(--muted)]">
                {t('questionsLabel', { count: cat.count })}
              </p>
            </div>
            <span className="text-[var(--muted)] group-hover:text-[var(--gold)] transition-colors">
              &rarr;
            </span>
          </Link>
        ))}
      </div>

      {/* Sample questions per category */}
      <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-2">
        {t('samplesHeading')}
      </h2>
      <p className="text-[var(--muted)] mb-8">{t('samplesSubline')}</p>
      <div className="space-y-10 mb-16">
        {categories.map((cat) => {
          const catSamples = samplesByCategory.get(cat.slug) ?? [];
          if (catSamples.length === 0) return null;
          return (
            <section key={cat.slug}>
              <h3 className="text-lg font-bold mb-3">
                {cat.icon} {cat.name_de}
              </h3>
              <div className="space-y-2">
                {catSamples.map((q, i) => (
                  <details
                    key={i}
                    className="group bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden"
                  >
                    <summary className="flex items-start gap-3 p-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none">
                      <span className="flex-1 text-[var(--foreground)]">{q.text_de}</span>
                      <span className="shrink-0 text-[var(--muted)] group-open:rotate-180 transition-transform text-xs">
                        ▼
                      </span>
                    </summary>
                    <div className="px-4 pb-4 pt-1 border-t border-[var(--dark-border)]">
                      <p className="text-[var(--gold)] font-medium">&rarr; {q.answer_de}</p>
                    </div>
                  </details>
                ))}
              </div>
              <Link
                href={`/${locale}/fragen/${cat.slug}`}
                className="inline-block mt-3 text-sm text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors"
              >
                {t('sampleMoreLink', { count: cat.count, name: cat.name_de })} &rarr;
              </Link>
            </section>
          );
        })}
      </div>

      {/* Create your own quiz */}
      <section className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-[var(--gold)] mb-3">
          {t('createHeading')}
        </h2>
        <p className="text-[var(--muted)] mb-6 max-w-xl mx-auto">
          {t('createText')}
        </p>
        <Link
          href={`/${locale}/generator`}
          className="inline-flex items-center gap-2 bg-[var(--gold)] text-[var(--background)] px-8 py-4 rounded-xl text-lg font-bold hover:bg-[var(--gold-light)] transition-colors"
        >
          {t('ctaButton')} &rarr;
        </Link>
      </section>
    </main>
  );
}
