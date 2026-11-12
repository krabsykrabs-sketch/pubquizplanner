import { Check, Zap } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Button from '@/components/ds/Button';
import HeroStage from './HeroStage';

/* Hero. The headline names the three rooms the quiz ends up in (classroom,
 * meeting room, pub), each under its own marker colour; the visual shows what
 * you actually get. */
export default async function LandingHero({
  locale,
  displayCount,
}: {
  locale: string;
  displayCount: number;
}) {
  const t = await getTranslations({ locale, namespace: 'landing' });
  const mark = (color: string) => {
    const Marker = (chunks: React.ReactNode) => (
      <span className="marker" style={{ ['--mk' as string]: color }}>
        {chunks}
      </span>
    );
    return Marker;
  };

  return (
    <section id="top" className="relative overflow-x-clip">
      <div className="mx-auto grid max-w-container grid-cols-1 items-center gap-10 px-5 pb-16 pt-10 sm:px-6 nav:grid-cols-[0.94fr_1.06fr] nav:gap-11 nav:pb-[88px] nav:pt-14">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--edge)] bg-[var(--surface-card)] py-[5px] pl-2.5 pr-3.5 text-[0.88rem] font-semibold leading-[1.4] text-[var(--text-strong)]">
            <Check className="h-[17px] w-[17px] text-[var(--green)]" strokeWidth={3} aria-hidden />
            {t('badge')}
          </div>
          <h1 className="mb-5 mt-[22px] font-display text-[clamp(2.4rem,5.1vw,4.1rem)] font-extrabold leading-none tracking-[-0.035em] text-[var(--text-strong)] [hyphens:manual] [text-wrap:balance]">
            {t.rich('heroTitle', {
              a: mark('#BCCBFF'),
              b: mark('#A8E4C9'),
              c: mark('var(--yellow)'),
            })}
          </h1>
          <p className="mb-[30px] mt-0 max-w-[33em] text-[clamp(1.05rem,1.5vw,1.2rem)] leading-[1.55] text-[var(--text-muted)]">
            {t.rich('heroLead', {
              count: displayCount.toLocaleString(locale),
              s: (chunks) => (
                <strong className="font-semibold text-[var(--text-strong)]">{chunks}</strong>
              ),
            })}
          </p>
          <div className="flex flex-wrap items-center gap-3.5">
            <Button
              size="lg"
              href={`/${locale}/generator?quick=1`}
              iconLeft={<Zap className="h-5 w-5" aria-hidden />}
            >
              {t('ctaPrimary')}
            </Button>
            <Button size="lg" variant="secondary" href={`/${locale}/generator`}>
              {t('ctaSecondary')}
            </Button>
          </div>
        </div>

        <HeroStage locale={locale} />
      </div>
    </section>
  );
}
