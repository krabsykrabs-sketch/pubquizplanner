import { ArrowRight, TreePine } from 'lucide-react';
import Button from '@/components/ds/Button';
import { SOURCE_LOCALE } from '@/config/locales';
import { categoryPath } from '@/config/slugs';

// Seasonal call-out for the Weihnachten category on the German home and
// /fragen hub. German-only (the category has no translations), so the copy
// lives here rather than in the message files.
//
// Shows only while it's relevant (1 Nov – 26 Dec: office parties, school
// classes, family evenings) AND once the category is actually live, i.e.
// listed among the caller's active categories (>= MIN_QUESTIONS_PER_CATEGORY
// approved questions). Before that it renders nothing, so it is safe to ship
// ahead of the content.
const SLUG = 'weihnachten';

function inSeason(now: Date): boolean {
  const m = now.getMonth(); // 0-based: 10 = Nov, 11 = Dec
  return m === 10 || (m === 11 && now.getDate() <= 26);
}

export default function SeasonalTeaser({
  locale,
  categories,
  className = '',
}: {
  locale: string;
  categories: { slug: string; count?: number; question_count?: number }[];
  className?: string;
}) {
  if (locale !== SOURCE_LOCALE || !inSeason(new Date())) return null;
  const cat = categories.find((c) => c.slug === SLUG);
  if (!cat) return null;
  const count = cat.count ?? cat.question_count;

  return (
    <section
      data-theme="dark"
      className={`relative overflow-hidden rounded-ds-xl border-2 border-[var(--warm-900)] bg-[var(--pine)] p-6 shadow-hard md:p-8 ${className}`}
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
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-ds-lg bg-[var(--yellow)] text-[var(--warm-900)]">
            <TreePine className="h-6 w-6" aria-hidden />
          </span>
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
        <Button
          size="lg"
          href={categoryPath(SOURCE_LOCALE, SLUG)}
          iconRight={<ArrowRight className="h-5 w-5" aria-hidden />}
          className="shrink-0"
        >
          Zum Weihnachtsquiz
        </Button>
      </div>
    </section>
  );
}
