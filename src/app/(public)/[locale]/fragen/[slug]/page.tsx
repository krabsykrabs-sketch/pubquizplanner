import { Metadata } from 'next';
import SeasonalTeaser from '@/components/SeasonalTeaser';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import { query, queryOne } from '@/lib/db';
import { getCategoryIntro } from '@/lib/category-intros';
import { getCategorySeoName } from '@/lib/category-seo';
import Button from '@/components/ds/Button';
import FestiveLights from '@/components/FestiveLights';
import { FESTIVE_SLUG } from '@/lib/festive';
import { categoryIcon, categoryLook, categoryVisual } from '@/lib/category-visuals';
import {
  SOURCE_LOCALE,
  LOCALES,
  localeAlternates,
  MIN_QUESTIONS_PER_CATEGORY as MIN_QUESTIONS,
  type Locale,
} from '@/config/locales';
import {
  categoryPath,
  questionsIndexPath,
  questionsSegment,
  localizedCategorySlug,
} from '@/config/slugs';
import type { Category, Question } from '@/types/quiz';
import {
  BASE_URL,
  JsonLd,
  breadcrumbSchema,
  itemListSchema,
  faqPageSchema,
} from '@/lib/structured-data';
import { QuestionList } from './question-list';
import { CategoryPdfLink } from './pdf-link';

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

  // SEO-only name (keyword-matched to search terms); falls back to name_de.
  const seoName = getCategorySeoName(locale, slug, category.name_de);
  const title = t('categoryMetaTitle', { count: category.count, name: seoName });
  const description = t('categoryMetaDescription', {
    count: category.count,
    name: seoName,
  });

  return {
    title,
    description,
    alternates: {
      canonical: categoryPath(locale as Locale, slug),
      languages: localeAlternates(
        (loc) => `/${questionsSegment(loc)}/${localizedCategorySlug(loc, slug)}`,
        availableLocales
      ),
    },
    openGraph: {
      title,
      description,
      url: `https://pubquizplanner.com${categoryPath(locale as Locale, slug)}`,
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

  const categoryUrl = `${BASE_URL}${categoryPath(locale as Locale, slug)}`;

  const HeroIcon = categoryIcon(slug);

  // Mark up exactly the Q&A pairs rendered below (QuestionList shows every
  // question with its answer in an expandable panel) — nothing off-page.
  const breadcrumb = breadcrumbSchema([
    { name: t('breadcrumbHome'), url: `${BASE_URL}/${locale}` },
    { name: t('breadcrumbQuestions'), url: `${BASE_URL}${questionsIndexPath(locale as Locale)}` },
    { name: category.name_de, url: categoryUrl },
  ]);
  const questionItemList = itemListSchema(
    questions.map((q) => ({ name: q.text_de, url: categoryUrl }))
  );
  const faqPage = faqPageSchema(
    questions.map((q) => ({ question: q.text_de, answer: q.answer_de }))
  );

  const heroLook = categoryLook(category.slug);
  const heroArt = categoryVisual(category.slug)?.iconArt;
  // One click to a short quiz made only of this category's questions.
  const quickQuizHref = `/${locale}/generator?quick=1&cat=${slug}`;

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <JsonLd data={[breadcrumb, questionItemList, faqPage]} />
      {slug === FESTIVE_SLUG ? (
        // The seasonal category gets a festive header of its own (all year:
        // this page is about Christmas whenever someone lands on it).
        <section
          data-theme="dark"
          className="relative mb-8 overflow-hidden rounded-ds-xl border-2 border-[var(--warm-900)] bg-[var(--pine)] px-6 pb-7 pt-12 shadow-hard md:px-9 md:pb-9"
          style={{ ['--edge-shadow' as string]: 'var(--warm-900)' }}
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: [
                'radial-gradient(circle at 4% 30%, var(--yellow) 0 3px, transparent 4px)',
                'radial-gradient(circle at 30% 94%, #fff 0 2px, transparent 3px)',
                'radial-gradient(circle at 97% 22%, #fff 0 2px, transparent 3px)',
                'radial-gradient(circle at 93% 84%, var(--yellow) 0 3px, transparent 4px)',
                'radial-gradient(circle at 62% 96%, var(--amber-500) 0 3px, transparent 4px)',
              ].join(', '),
            }}
          />
          <FestiveLights onDark />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:gap-8">
            {heroArt && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroArt} alt="" className="h-32 w-32 shrink-0 -rotate-3 md:h-44 md:w-44" />
            )}
            <div>
              <h1 className="mb-3 font-display text-4xl font-extrabold tracking-[-0.02em] text-white md:text-5xl">
                {t('categoryTitle', { name: category.name_de })}
              </h1>
              <p className="mb-5 text-lg leading-relaxed text-[var(--text-body)]">{intro}</p>
              <Button
                size="lg"
                href={quickQuizHref}
                iconLeft={<Zap className="h-5 w-5" aria-hidden />}
              >
                {locale === SOURCE_LOCALE ? 'Sofort-Weihnachtsquiz' : t('ctaButton')}
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <>
        <h1 className="mb-6 flex items-center gap-3.5 font-display text-4xl font-extrabold tracking-[-0.02em] text-[var(--text-strong)] md:text-5xl">
          <span
            className={`inline-flex h-16 w-16 shrink-0 -rotate-3 items-center justify-center rounded-ds-lg border-2 border-[var(--edge)] shadow-hard-sm ${
              heroLook.onDark ? 'text-[var(--yellow-soft)]' : 'text-[var(--warm-900)]'
            }`}
            style={{ background: heroLook.tint }}
          >
            {heroArt ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroArt} alt="" className="h-[84%] w-[84%] object-contain" />
            ) : (
              <HeroIcon className="h-7 w-7" aria-hidden />
            )}
          </span>
          {t('categoryTitle', { name: category.name_de })}
        </h1>

        <p className="mb-6 text-lg leading-relaxed text-[var(--text-body)]">
          {intro}
        </p>
        </>
      )}

      {/* Seasonal: most visitors enter on a category page, not the hub. */}
      {slug !== FESTIVE_SLUG && (
        <SeasonalTeaser
          locale={locale}
          categories={allCategories}
          variant="compact"
          className="mb-6"
        />
      )}

      {/* Category navigation */}
      <nav
        className="mb-6 flex flex-wrap gap-2"
        aria-label={t('categoriesAria')}
      >
        {allCategories.map((cat) => {
          const isCurrent = cat.slug === slug;
          const Icon = categoryIcon(cat.slug);
          return (
            <Link
              key={cat.slug}
              href={categoryPath(locale as Locale, cat.slug)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] px-4 py-2 text-sm font-medium transition-colors ${
                isCurrent
                  ? 'border-transparent bg-[var(--accent)] text-[var(--text-on-accent)]'
                  : 'border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--text-body)] hover:bg-[var(--surface-inset)] hover:text-[var(--text-strong)]'
              }`}
              aria-current={isCurrent ? 'page' : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden /> {cat.name_de}
            </Link>
          );
        })}
      </nav>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center rounded-ds border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-4 py-2 font-mono text-sm text-[var(--text-muted)]">
          {t('questionsAvailable', { count: category.count })}
        </div>
        <CategoryPdfLink slug={slug} locale={locale} label={t('pdfButton')} />
      </div>
      <p className="mb-8 text-sm text-[var(--text-muted)]">
        {t('pdfHint', { count: category.count })}
      </p>

      <QuestionList questions={questions} locale={locale} />

      {/* Bottom CTA */}
      <section
        data-theme="dark"
        className="relative mb-12 mt-12 overflow-hidden rounded-ds-xl bg-[var(--night-800)] p-8 text-center"
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 120% at 50% 0%, rgba(255,207,74,0.16), transparent 60%)',
          }}
        />
        <div className="relative">
          <h2 className="mb-3 font-display text-2xl font-extrabold tracking-[-0.02em] text-white">
            {t('ctaTitleCategory')}
          </h2>
          <p className="mx-auto mb-6 max-w-xl text-[var(--text-body)]">
            {t('ctaTextCategory')}
          </p>
          <Button
            size="lg"
            href={quickQuizHref}
            iconRight={<ArrowRight className="h-5 w-5" aria-hidden />}
          >
            {t('ctaButton')}
          </Button>
        </div>
      </section>

      {/* Related categories */}
      {allCategories.filter((c) => c.slug !== slug).length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 font-display text-xl font-extrabold tracking-[-0.02em] text-[var(--text-strong)]">
            {t('moreCategories')}
          </h2>
          <div className="flex flex-wrap gap-3">
            {allCategories.filter((c) => c.slug !== slug).map((cat) => {
              const Icon = categoryIcon(cat.slug);
              return (
                <Link
                  key={cat.slug}
                  href={categoryPath(locale as Locale, cat.slug)}
                  className="inline-flex items-center gap-2 rounded-ds border border-[var(--border-strong)] bg-[var(--surface-card)] px-4 py-2 text-sm text-[var(--text-body)] transition-colors hover:bg-[var(--surface-inset)] hover:text-[var(--text-strong)]"
                >
                  <Icon className="h-4 w-4 text-[var(--accent-text)]" aria-hidden />
                  {cat.name_de}
                  <span className="font-mono text-[var(--text-faint)]">({cat.count})</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <Link
        href={questionsIndexPath(locale as Locale)}
        className="inline-flex items-center gap-[7px] text-sm font-semibold text-[var(--link)] no-underline transition-colors hover:text-[var(--link-hover)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {t('allQuestionsAnchor')}
      </Link>
    </main>
  );
}
