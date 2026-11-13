import { ArrowRight, Zap } from 'lucide-react';
import Button from '@/components/ds/Button';
import FestiveLights from '@/components/FestiveLights';
import { FESTIVE_SLUG, isFestiveSeason } from '@/lib/festive';
import { SOURCE_LOCALE } from '@/config/locales';
import { categoryPath } from '@/config/slugs';

// Seasonal call-out for the Weihnachten category on the German home,
// /fragen hub (full) and every other German category page (compact). German-only (the category has no translations), so the copy
// lives here rather than in the message files.
//
// Shows only while it's relevant (1 Nov – 26 Dec: office parties, school
// classes, family evenings) AND once the category is actually live, i.e.
// listed among the caller's active categories (>= MIN_QUESTIONS_PER_CATEGORY
// approved questions). Before that it renders nothing, so it is safe to ship
// ahead of the content.
const SLUG = FESTIVE_SLUG;

export default function SeasonalTeaser({
  locale,
  categories,
  className = '',
  variant = 'full',
}: {
  locale: string;
  categories: { slug: string; count?: number; question_count?: number }[];
  className?: string;
  /** 'compact': slim one-row strip for category pages, where the question
   *  list is what visitors came for and must stay near the top. */
  variant?: 'full' | 'compact';
}) {
  if (locale !== SOURCE_LOCALE || !isFestiveSeason()) return null;
  const cat = categories.find((c) => c.slug === SLUG);
  if (!cat) return null;
  const count = cat.count ?? cat.question_count;

  if (variant === 'compact') {
    return (
      <a
        href={categoryPath(SOURCE_LOCALE, SLUG)}
        data-theme="dark"
        className={`group flex items-center gap-3 rounded-ds-lg border-2 border-[var(--warm-900)] bg-[var(--pine)] px-4 py-3 no-underline shadow-hard-sm transition-transform hover:-translate-y-px ${className}`}
        style={{ ['--edge-shadow' as string]: 'var(--warm-900)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/categories/${SLUG}/icon.svg`}
          alt=""
          className="h-11 w-11 shrink-0 -rotate-3 object-contain"
        />
        <span className="min-w-0 flex-1 text-sm leading-snug text-[var(--text-body)]">
          <strong className="font-display text-base font-extrabold text-white">
            Weihnachtsquiz {new Date().getFullYear()}
          </strong>
          <span className="block sm:inline">
            <span className="hidden sm:inline"> · </span>
            {count ? `${count} ` : ''}Fragen mit Antworten, als PDF oder fertige Präsentation
          </span>
        </span>
        <ArrowRight
          className="h-5 w-5 shrink-0 text-[var(--yellow)] transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </a>
    );
  }

  return (
    <section
      data-theme="dark"
      className={`relative overflow-hidden rounded-ds-xl border-2 border-[var(--warm-900)] bg-[var(--pine)] px-6 pb-6 pt-11 shadow-hard md:px-8 md:pb-8 md:pt-12 ${className}`}
      style={{ ['--edge-shadow' as string]: 'var(--warm-900)' }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: [
            'radial-gradient(circle at 6% 18%, var(--yellow) 0 3px, transparent 4px)',
            'radial-gradient(circle at 38% 88%, #fff 0 2px, transparent 3px)',
            'radial-gradient(circle at 58% 12%, #fff 0 2px, transparent 3px)',
            'radial-gradient(circle at 72% 78%, var(--yellow) 0 3px, transparent 4px)',
            'radial-gradient(circle at 96% 30%, var(--amber-500) 0 3px, transparent 4px)',
          ].join(', '),
        }}
      />
      <FestiveLights onDark />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4 md:items-center md:gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/categories/${SLUG}/icon.svg`}
            alt=""
            className="h-16 w-16 shrink-0 -rotate-3 object-contain md:-my-3 md:h-[124px] md:w-[124px]"
          />
          <div>
            <h2 className="mb-1 font-display text-2xl font-extrabold tracking-[-0.02em] text-white">
              Weihnachtsquiz {new Date().getFullYear()}
            </h2>
            <p className="m-0 max-w-xl text-[var(--text-body)]">
              {count ? `${count} ` : ''}Weihnachts-Quizfragen mit Antworten — für die
              Weihnachtsfeier im Büro, in der Schule oder zu Hause. Kostenlos als PDF
              oder fertige Präsentation.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
          <Button
            size="lg"
            href={`/${SOURCE_LOCALE}/generator?quick=1&cat=${SLUG}`}
            iconLeft={<Zap className="h-5 w-5" aria-hidden />}
          >
            Sofort-Weihnachtsquiz
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="!bg-[#FFFDF7] !text-[var(--warm-900)]"
            href={categoryPath(SOURCE_LOCALE, SLUG)}
            iconRight={<ArrowRight className="h-5 w-5" aria-hidden />}
          >
            Fragen ansehen
          </Button>
        </div>
      </div>
    </section>
  );
}
