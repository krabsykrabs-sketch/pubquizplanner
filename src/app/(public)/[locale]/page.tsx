import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { query } from '@/lib/db';

const STRONG_CATEGORIES = [
  'geschichte',
  'wissenschaft',
  'geographie',
  'allgemeinwissen',
  'film-tv',
  'musik',
  'sport',
  'literatur',
];

interface CategoryChip {
  slug: string;
  name_de: string;
  name_en: string | null;
  icon: string;
}

interface SampleQuestion {
  text_de: string;
  text_en: string | null;
  answer_de: string;
  answer_en: string | null;
  fun_fact_de: string | null;
  fun_fact_en: string | null;
  category_name_de: string;
  category_name_en: string | null;
  category_icon: string;
}

async function getLandingData() {
  const [countResult, categories, sampleQuestions] = await Promise.all([
    query<{ count: string }>(
      "SELECT COUNT(*)::int as count FROM questions WHERE status = 'approved'"
    ),
    query<CategoryChip>(
      `SELECT c.slug, c.name_de, c.name_en, c.icon
       FROM categories c
       JOIN questions q ON q.category_id = c.id AND q.status = 'approved'
       WHERE c.slug = ANY($1)
       GROUP BY c.id
       HAVING COUNT(q.id) >= 30
       ORDER BY c.sort_order`,
      [STRONG_CATEGORIES]
    ),
    query<SampleQuestion>(
      `SELECT q.text_de, q.text_en, q.answer_de, q.answer_en,
              q.fun_fact_de, q.fun_fact_en,
              c.name_de as category_name_de, c.name_en as category_name_en, c.icon as category_icon
       FROM questions q
       JOIN categories c ON c.id = q.category_id
       WHERE q.status = 'approved' AND q.is_highlight = true
         AND q.fun_fact_de IS NOT NULL
       ORDER BY RANDOM()
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
  const t = await getTranslations('landing');

  let displayCount = 950;
  let categories: CategoryChip[] = [];
  let sampleQuestions: SampleQuestion[] = [];

  try {
    const data = await getLandingData();
    displayCount = data.displayCount || 950;
    categories = data.categories;
    sampleQuestions = data.sampleQuestions;
  } catch {
    // Fallback to hardcoded values if DB is unavailable
  }

  const steps = [
    { num: '1', icon: '⚙️', title: t('step1Title'), desc: t('step1Desc') },
    { num: '2', icon: '👀', title: t('step2Title'), desc: t('step2Desc') },
    { num: '3', icon: '📥', title: t('step3Title'), desc: t('step3Desc') },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="text-6xl mb-8">🧠</div>
        <h1 className="text-5xl md:text-7xl font-black text-[var(--gold)] mb-6 text-balance">
          {t('hero')}
        </h1>
        <p className="text-xl md:text-2xl text-[var(--muted)] mb-10 max-w-2xl">
          {t('subtitle')}
        </p>
        <Link
          href={`/${locale}/generator`}
          className="inline-flex items-center gap-3 bg-[var(--gold)] text-[var(--background)] px-8 py-4 rounded-xl text-lg font-bold hover:bg-[var(--gold-light)] transition-colors"
        >
          {t('cta')} →
        </Link>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
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
                <span>{locale === 'en' && cat.name_en ? cat.name_en : cat.name_de}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Sample Questions */}
      {sampleQuestions.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <h3 className="text-center text-lg font-medium text-[var(--muted)] mb-6">
            {t('sampleQuestionsHeadline')}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {sampleQuestions.map((q, i) => {
              const question = locale === 'en' && q.text_en ? q.text_en : q.text_de;
              const answer = locale === 'en' && q.answer_en ? q.answer_en : q.answer_de;
              const funFact = locale === 'en' && q.fun_fact_en ? q.fun_fact_en : q.fun_fact_de;
              const catName =
                locale === 'en' && q.category_name_en
                  ? q.category_name_en
                  : q.category_name_de;

              return (
                <div
                  key={i}
                  className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 text-left"
                >
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-3">
                    <span>{q.category_icon}</span>
                    <span>{catName}</span>
                  </div>
                  <p className="text-sm font-medium text-[var(--foreground)] mb-2 leading-snug">
                    {question}
                  </p>
                  <p className="text-sm text-[var(--gold)] font-semibold mb-2">
                    {answer}
                  </p>
                  {funFact && (
                    <p className="text-xs text-[var(--muted)] leading-relaxed border-t border-[var(--dark-border)] pt-2 mt-2">
                      <span className="text-[var(--gold-light)] font-medium">
                        {t('funFact')}:
                      </span>{' '}
                      {funFact}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Steps */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-8 text-center"
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <div className="font-mono text-sm text-[var(--gold)] mb-2">
                {t('step')} {step.num}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-[var(--muted)]">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
