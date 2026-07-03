import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { HERO_BACKGROUND_IMAGE } from '@/config/hero-background';

// Hero: value prop + the two primary CTAs into the generator. No dynamic data.
export default async function LandingHero({ locale }: { locale: string }) {
  const t = await getTranslations('landing');

  // Dark overlay baked into the style so the background artwork doesn't need to
  // guarantee text contrast itself — see LANDING_DESIGN_PROMPTS.md.
  const heroStyle = HERO_BACKGROUND_IMAGE
    ? {
        backgroundImage: `linear-gradient(rgba(6, 6, 10, 0.72), rgba(6, 6, 10, 0.72)), url(${HERO_BACKGROUND_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;

  return (
    <section
      style={heroStyle}
      className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
    >
      <div className="text-6xl mb-8">🧠</div>
      <h1 className="text-5xl md:text-7xl font-black text-[var(--gold)] mb-6 text-balance">
        {t('hero')}
      </h1>
      <p className="text-xl md:text-2xl text-[var(--muted)] mb-10 max-w-2xl">
        {t('subtitle')}
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link
          href={`/${locale}/generator`}
          className="inline-flex items-center gap-3 bg-[var(--gold)] text-[var(--background)] px-8 py-4 rounded-xl text-lg font-bold hover:bg-[var(--gold-light)] transition-colors"
        >
          {t('cta')} →
        </Link>
        <Link
          href={`/${locale}/generator?quick=1`}
          className="inline-flex items-center gap-3 border-2 border-[var(--gold)] text-[var(--gold)] px-8 py-4 rounded-xl text-lg font-bold hover:bg-[var(--gold)] hover:text-[var(--background)] transition-colors"
        >
          🎲 {t('quickStart')}
        </Link>
      </div>
    </section>
  );
}
