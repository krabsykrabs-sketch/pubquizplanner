import { Dices } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Button from '@/components/ds/Button';

// Closing dark CTA band: amber glow from the top, two generator entry points.
export default async function CtaBand({ locale }: { locale: string }) {
  const t = await getTranslations('landing');

  return (
    <section data-theme="dark" className="relative overflow-hidden bg-[var(--night-800)]">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 120% at 50% 0%, rgba(217,110,42,0.22), transparent 60%)',
        }}
      />
      <div className="relative mx-auto max-w-container px-6 py-[84px] text-center">
        <h2 className="mx-auto max-w-[18ch] font-display text-[clamp(2.5rem,4vw+1rem,3.5rem)] font-extrabold tracking-[-0.02em] text-white">
          {t('ctaBandTitle')}
        </h2>
        <p className="mx-auto mb-[30px] mt-4 max-w-[46ch] text-[1.125rem] text-[var(--text-body)]">
          {t('ctaBandText')}
        </p>
        <div className="flex flex-wrap justify-center gap-3.5">
          <Button
            size="lg"
            href={`/${locale}/generator?quick=1`}
            iconLeft={<Dices className="h-5 w-5" aria-hidden />}
          >
            {t('ctaPrimary')}
          </Button>
          <Button size="lg" variant="secondary" href={`/${locale}/generator`}>
            {t('ctaSecondary')}
          </Button>
        </div>
      </div>
    </section>
  );
}
