import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { query, queryOne } from '@/lib/db';
import { getCategoryIntro } from '@/lib/category-intros';
import {
  SOURCE_LOCALE,
  LOCALES,
  localeAlternates,
  MIN_QUESTIONS_PER_CATEGORY as MIN_QUESTIONS,
  type Locale,
} from '@/config/locales';
import type { Category, Question } from '@/types/quiz';
import {
  BASE_URL,
  JsonLd,
  breadcrumbSchema,
  itemListSchema,
  faqPageSchema,
} from '@/lib/structured-data';
import { QuestionList } from './question-list';

export const dynamic = 'force-dynamic';

interface CategoryWithCount extends Category {
  count: number;
}

// For non-German locales only translated questions count; localized
// category names and question content are aliased onto the *_de fields.
async function getCategoryWithCount(
  slug: string,
  locale: string
): Promise<CategoryWithCount | null> {
  if (locale === SOURCE_LOCALE) {
    return queryOne<CategoryWithCount>(
      `SELECT c.*, COUNT(q.id)::int as count
       FROM categories c
       JOIN questions q ON q.category_id = c.id
       WHERE c.slug = $1 AND q.status = 'approved'
       GROUP BY c.id
       HAVING COUNT(q.id) >= $2`,
      [slug, MIN_QUESTIONS]
    );
  }
  return queryOne<CategoryWithCount>(
    `SELECT c.id, c.slug, ct.name AS name_de, c.icon, c.sort_order,
            COUNT(q.id)::int as count
     FROM categories c
     JOIN category_translations ct ON ct.category_id = c.id AND ct.locale = $3
     JOIN questions q ON q.category_id = c.id AND q.status = 'approved'
     JOIN question_translations t ON t.question_id = q.id
       AND t.locale = $3 AND t.status IN ('machine', 'reviewed')
     WHERE c.slug = $1
     GROUP BY c.id, ct.name
     HAVING COUNT(q.id) >= $2`,
    [slug, MIN_QUESTIONS, locale]
  );
}

async function getQuestions(categoryId: number, locale: string): Promise<Question[]> {
  if (locale === SOURCE_LOCALE) {
    return query<Question>(
      `SELECT * FROM questions
       WHERE category_id = $1 AND status = 'approved'
       ORDER BY id ASC`,
      [categoryId]
    );
  }
  return query<Question>(
    `SELECT q.*, t.text AS text_de, t.answer AS answer_de, t.fun_fact AS fun_fact_de
     FROM questions q
     JOIN question_translations t ON t.question_id = q.id
       AND t.locale = $2 AND t.status IN ('machine', 'reviewed')
     WHERE q.category_id = $1 AND q.status = 'approved'
     ORDER BY q.id ASC`,
    [categoryId, locale]
  );
}

// Which configured locales serve this category (i.e. clear the threshold) — for
// hreflang alternates, so we never advertise a category URL that 404s.
async function getCategoryLocales(slug: string): Promise<Locale[]> {
  const rows = await query<{ locale: string }>(
    `SELECT loc AS locale FROM (
       SELECT $2::text AS loc, COUNT(q.id) AS c
       FROM categories c
       JOIN questions q ON q.category_id = c.id
       WHERE c.slug = $1 AND q.status = 'approved'
       GROUP BY c.id
       UNION ALL
       SELECT t.locale AS loc, COUNT(q.id) AS c
       FROM categories c
       JOIN questions q ON q.category_id = c.id AND q.status = 'approved'
       JOIN question_translations t ON t.question_id = q.id
         AND t.status IN ('machine', 'reviewed')
       WHERE c.slug = $1
       GROUP BY c.id, t.locale
     ) s WHERE s.c >= $3`,
    [slug, SOURCE_LOCALE, MIN_QUESTIONS]
  );
  const available = new Set(rows.map((r) => r.locale));
  return LOCALES.filter((l) => available.has(l));
}

async function getAllActiveCategories(locale: string): Promise<CategoryWithCount[]> {
  if (locale === SOURCE_LOCALE) {
    return query<CategoryWithCount>(
      `SELECT c.*, COUNT(q.id)::int as count
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
    `SELECT c.id, c.slug, ct.name AS name_de, c.icon, c.sort_order,
            COUNT(q.id)::int as count
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

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const [category, availableLocales] = await Promise.all([
    getCategoryWithCount(slug, locale),
    getCategoryLocales(slug),
  ]);
  if (!category) return {};
  const t = await getTranslations({ locale, namespace: 'fragen' });

  const title = t('categoryMetaTitle', { count: category.count, name: category.name_de });
  const description = t('categoryMetaDescription', {
    count: category.count,
    name: category.name_de,
  });

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/fragen/${slug}`,
      languages: localeAlternates(`/fragen/${slug}`, availableLocales),
    },
    openGraph: {
      title,
      description,
      url: `https://pubquizplanner.com/${locale}/fragen/${slug}`,
    },
  };
}

export default async function CategoryQuestionsPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const category = await getCategoryWithCount(slug, locale);
  if (!category) notFound();
  const t = await getTranslations({ locale, namespace: 'fragen' });

  const [questions, allCategories] = await Promise.all([
    getQuestions(category.id, locale),
    getAllActiveCategories(locale),
  ]);

  const intro =
    getCategoryIntro(locale, slug) ||
    t('categoryFallbackIntro', { count: category.count, name: category.name_de });

  const categoryUrl = `${BASE_URL}/${locale}/fragen/${slug}`;

  // Mark up exactly the Q&A pairs rendered below (QuestionList shows every
  // question with its answer in an expandable panel) — nothing off-page.
  const breadcrumb = breadcrumbSchema([
    { name: t('breadcrumbHome'), url: `${BASE_URL}/${locale}` },
    { name: t('breadcrumbQuestions'), url: `${BASE_URL}/${locale}/fragen` },
    { name: category.name_de, url: categoryUrl },
  ]);
  const questionItemList = itemListSchema(
    questions.map((q) => ({ name: q.text_de, url: categoryUrl }))
  );
  const faqPage = faqPageSchema(
    questions.map((q) => ({ question: q.text_de, answer: q.answer_de }))
  );

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <JsonLd data={[breadcrumb, questionItemList, faqPage]} />
      <h1 className="text-4xl md:text-5xl font-bold text-[var(--gold)] mb-6">
        {category.icon} {t('categoryTitle', { name: category.name_de })}
      </h1>

      <p className="text-lg text-[var(--muted)] mb-6 leading-relaxed">
        {intro}
      </p>

      {/* Category navigation */}
      <nav
        className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide -mx-6 px-6"
        aria-label={t('categoriesAria')}
      >
        {allCategories.map((cat) => {
          const isCurrent = cat.slug === slug;
          return (
            <Link
              key={cat.slug}
              href={`/${locale}/fragen/${cat.slug}`}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium border transition-colors shrink-0 ${
                isCurrent
                  ? 'bg-[var(--gold)] text-[var(--background)] border-[var(--gold)]'
                  : 'bg-[var(--dark-card)] border-[var(--dark-border)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--foreground)]'
              }`}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {cat.icon} {cat.name_de}
            </Link>
          );
        })}
      </nav>

      <div className="inline-block bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-4 py-2 text-sm text-[var(--muted)] mb-8">
        {t('questionsAvailable', { count: category.count })}
      </div>

      <QuestionList questions={questions} locale={locale} />

      {/* Bottom CTA */}
      <section className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-8 text-center mt-12 mb-12">
        <h2 className="text-2xl font-bold text-[var(--gold)] mb-3">
          {t('ctaTitleCategory')}
        </h2>
        <p className="text-[var(--muted)] mb-6 max-w-xl mx-auto">
          {t('ctaTextCategory')}
        </p>
        <Link
          href={`/${locale}/generator`}
          className="inline-flex items-center gap-2 bg-[var(--gold)] text-[var(--background)] px-8 py-4 rounded-xl text-lg font-bold hover:bg-[var(--gold-light)] transition-colors"
        >
          {t('ctaButton')} &rarr;
        </Link>
      </section>

      {/* Related categories */}
      {allCategories.filter((c) => c.slug !== slug).length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
            {t('moreCategories')}
          </h2>
          <div className="flex flex-wrap gap-3">
            {allCategories.filter((c) => c.slug !== slug).map((cat) => (
              <Link
                key={cat.slug}
                href={`/${locale}/fragen/${cat.slug}`}
                className="inline-flex items-center gap-2 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-4 py-2 text-sm hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              >
                {cat.icon} {cat.name_de}
                <span className="text-[var(--muted)]">({cat.count})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Link
        href={`/${locale}/fragen`}
        className="inline-block text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      >
        &larr; {t('allQuestionsAnchor')}
      </Link>
    </main>
  );
}
