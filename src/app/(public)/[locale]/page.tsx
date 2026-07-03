import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { query } from '@/lib/db';
import {
  SOURCE_LOCALE,
  OG_LOCALE,
  localeAlternates,
  MIN_QUESTIONS_PER_CATEGORY as MIN_QUESTIONS,
  type Locale,
} from '@/config/locales';
import LandingHero from '@/components/landing/LandingHero';
import CategorySection from '@/components/landing/CategorySection';
import SampleQuestions from '@/components/landing/SampleQuestions';
import HowItWorks from '@/components/landing/HowItWorks';
import type { CategoryChip, SampleQuestion } from '@/components/landing/types';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: `/${locale}`,
      languages: localeAlternates(''),
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `/${locale}`,
      siteName: 'PubQuizPlanner',
      locale: OG_LOCALE[locale as Locale] ?? OG_LOCALE[SOURCE_LOCALE],
      type: 'website',
    },
  };
}

async function getLandingData(locale: string) {
  const translated = locale !== SOURCE_LOCALE;

  const [countResult, categories, sampleQuestions] = await Promise.all([
    translated
      ? query<{ count: string }>(
          `SELECT COUNT(*)::int as count FROM questions q
           JOIN question_translations t ON t.question_id = q.id
             AND t.locale = $1 AND t.status IN ('machine', 'reviewed')
           WHERE q.status = 'approved'`,
          [locale]
        )
      : query<{ count: string }>(
          "SELECT COUNT(*)::int as count FROM questions WHERE status = 'approved'"
        ),
    translated
      ? query<CategoryChip>(
          `SELECT c.slug, ct.name AS name_de, c.icon
           FROM categories c
           JOIN category_translations ct ON ct.category_id = c.id AND ct.locale = $2
           JOIN questions q ON q.category_id = c.id AND q.status = 'approved'
           JOIN question_translations t ON t.question_id = q.id
             AND t.locale = $2 AND t.status IN ('machine', 'reviewed')
           GROUP BY c.id, ct.name
           HAVING COUNT(q.id) >= $1
           ORDER BY c.sort_order`,
          [MIN_QUESTIONS, locale]
        )
      : query<CategoryChip>(
          `SELECT c.slug, c.name_de, c.icon
           FROM categories c
           JOIN questions q ON q.category_id = c.id AND q.status = 'approved'
           GROUP BY c.id
           HAVING COUNT(q.id) >= $1
           ORDER BY c.sort_order`,
          [MIN_QUESTIONS]
        ),
    translated
      ? query<SampleQuestion>(
          `SELECT t.text AS text_de, t.answer AS answer_de, t.fun_fact AS fun_fact_de,
                  ct.name AS category_name_de, c.icon AS category_icon
           FROM questions q
           JOIN question_translations t ON t.question_id = q.id
             AND t.locale = $1 AND t.status IN ('machine', 'reviewed')
           JOIN categories c ON c.id = q.category_id
           JOIN category_translations ct ON ct.category_id = c.id AND ct.locale = $1
           WHERE q.status = 'approved' AND t.fun_fact IS NOT NULL
           ORDER BY q.is_highlight DESC, RANDOM()
           LIMIT 3`,
          [locale]
        )
      : query<SampleQuestion>(
          `SELECT q.text_de, q.answer_de, q.fun_fact_de,
                  c.name_de as category_name_de, c.icon as category_icon
           FROM questions q
           JOIN categories c ON c.id = q.category_id
           WHERE q.status = 'approved' AND q.fun_fact_de IS NOT NULL
           ORDER BY q.is_highlight DESC, RANDOM()
           LIMIT 3`
        ),
  ]);

  const totalCount = parseInt(countResult[0]?.count ?? '0');
  // Round down to nearest 50 for display
  const displayCount = Math.floor(totalCount / 50) * 50;

  return { displayCount, categories, sampleQuestions };
}

export default async function LandingPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  let displayCount = 950;
  let categories: CategoryChip[] = [];
  let sampleQuestions: SampleQuestion[] = [];

  try {
    const data = await getLandingData(locale);
    displayCount = data.displayCount || 950;
    categories = data.categories;
    sampleQuestions = data.sampleQuestions;
  } catch {
    // Fallback to hardcoded values if DB is unavailable
  }

  return (
    <main className="min-h-screen">
      <LandingHero locale={locale} />
      <CategorySection
        locale={locale}
        categories={categories}
        displayCount={displayCount}
      />
      <SampleQuestions questions={sampleQuestions} />
      <HowItWorks />
    </main>
  );
}
