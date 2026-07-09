import { Dices, SlidersHorizontal, Zap } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Badge from '@/components/ds/Badge';
import Button from '@/components/ds/Button';
import { LOCALE_LABELS, LOCALES } from '@/config/locales';
import HeroTileDeck, { type HeroTileCat } from './HeroTileDeck';
import type { CategoryChip } from './types';

// Four subjects staged as rounds of a night; the square standalone
// illustrations read best on the square hero tiles. Falls back to the first
// available categories when a pick doesn't clear the visibility threshold.
const HERO_PICKS = ['kunst-kultur', 'essen-trinken', 'logik-mathe', 'geschichte'];

/** Decorative pub ambience: string lights across the top. */
function StringLights() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1400 200"
      preserveAspectRatio="none"
      className="absolute left-0 top-0 h-[190px] w-full text-[var(--amber-400)] opacity-[0.09]"
    >
      <path
        d="M0 26 Q175 96 350 40 T700 40 T1050 40 T1400 30"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <g fill="currentColor">
        <circle cx="88" cy="66" r="4" />
        <circle cx="262" cy="70" r="4" />
        <circle cx="436" cy="44" r="4" />
        <circle cx="610" cy="66" r="4" />
        <circle cx="786" cy="44" r="4" />
        <circle cx="960" cy="66" r="4" />
        <circle cx="1136" cy="44" r="4" />
        <circle cx="1310" cy="52" r="4" />
      </g>
    </svg>
  );
}

export default async function LandingHero({
  locale,
  categories,
}: {
  locale: string;
  categories: CategoryChip[];
}) {
  const t = await getTranslations({ locale, namespace: 'landing' });

  // The tile pool: the four picks lead, every other visible category follows —
  // the client deck flips through all of them over time.
  const bySlug = new Map(categories.map((c) => [c.slug, c]));
  const picks = HERO_PICKS.map((slug) => bySlug.get(slug)).filter(
    (c): c is CategoryChip => !!c
  );
  for (const c of categories) {
    if (!picks.includes(c)) picks.push(c);
  }
  const pool: HeroTileCat[] = picks.map((c) => ({ slug: c.slug, name: c.name_de }));

  return (
    <section
      id="top"
      data-theme="dark"
      className="relative overflow-hidden bg-[var(--night-900)] text-[var(--text-strong)]"
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(78% 88% at 82% 8%, rgba(217,110,42,0.28), transparent 58%)',
        }}
      />
      <StringLights />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 h-[3px] w-[46%] opacity-50"
        style={{ background: 'linear-gradient(90deg, rgba(217,110,42,0.12), transparent)' }}
      />

      <div className="relative mx-auto grid max-w-container grid-cols-1 items-center gap-10 px-6 py-[60px] nav:grid-cols-[1.05fr_0.95fr] nav:gap-14 nav:py-[92px]">
        <div>
          <div className="mb-[22px] inline-flex">
            <Badge tone="accent">{t('badge')}</Badge>
          </div>
          <h1 className="m-0 font-display text-[clamp(3rem,6vw+1rem,4.75rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-white">
            {t('heroTitle1')}
            <br />
            {t('heroTitle2')}
          </h1>
          <p className="mb-[34px] mt-6 max-w-[47ch] text-[1.1875rem] leading-[1.6] text-[var(--text-body)]">
            {t('heroLead')}
          </p>
          <div className="flex flex-wrap items-center gap-3.5">
            <Button
              size="lg"
              href={`/${locale}/generator?quick=1`}
              iconLeft={<Dices className="h-5 w-5" aria-hidden />}
            >
              {t('ctaPrimary')}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              href={`/${locale}/generator`}
              iconLeft={<SlidersHorizontal className="h-5 w-5" aria-hidden />}
            >
              {t('ctaSecondary')}
            </Button>
          </div>
          <div className="mt-[18px] flex items-center gap-2 text-[0.9rem] text-[var(--text-muted)]">
            <Zap className="h-4 w-4 text-[var(--accent)]" aria-hidden />
            {t('reassurance')}
          </div>
          <div className="mt-[34px] flex flex-wrap gap-4">
            {LOCALES.map((l) => (
              <span
                key={l}
                className="font-mono text-[0.72rem] tracking-[0.06em] text-[var(--text-muted)]"
              >
                {LOCALE_LABELS[l] ?? l}
              </span>
            ))}
          </div>
        </div>

        {pool.length >= 4 && (
          <HeroTileDeck
            pool={pool}
            labels={[1, 2, 3, 4].map((n) => t('roundLabel', { n }))}
          />
        )}
      </div>
    </section>
  );
}
