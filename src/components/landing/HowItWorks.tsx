/* eslint-disable @next/next/no-img-element */
import { getTranslations } from 'next-intl/server';
import Card from '@/components/ds/Card';

// Static "3 steps" explainer; each step illustration sits on its own marker tint.
export default async function HowItWorks() {
  const t = await getTranslations('landing');

  const steps = [
    { num: '01', img: '/marketing/step-choose.svg', tint: 'var(--yellow-soft)', title: t('how1Title'), desc: t('how1Desc') },
    { num: '02', img: '/marketing/step-build.svg', tint: 'var(--blue-soft)', title: t('how2Title'), desc: t('how2Desc') },
    { num: '03', img: '/marketing/step-present.svg', tint: 'var(--green-soft)', title: t('how3Title'), desc: t('how3Desc') },
  ];

  return (
    <section
      id="how"
      className="border-t-2 border-[var(--edge)] bg-[var(--bg-sunken)] py-[60px] nav:py-[92px]"
    >
      <div className="mx-auto max-w-container px-6">
        <div className="max-w-[52ch]">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--accent-text)]">
            {t('kickerHow')}
          </span>
          <h2 className="mb-0 mt-2.5 font-display text-4xl font-extrabold tracking-[-0.02em] text-[var(--text-strong)]">
            {t('howTitle')}
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 nav:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.num} padding="lg" elevation="raised">
              <div
                className="mb-[18px] flex h-[74px] w-[74px] items-center justify-center rounded-ds-lg border-2 border-[var(--edge)] p-1.5"
                style={{ background: step.tint }}
              >
                <img src={step.img} alt="" className="h-full w-full object-contain" />
              </div>
              <div className="mb-1.5 font-mono text-[0.72rem] text-[var(--text-faint)]">
                {step.num}
              </div>
              <h3 className="mb-2 mt-0 font-display text-[1.375rem] font-bold tracking-[-0.01em] text-[var(--text-strong)]">
                {step.title}
              </h3>
              <p className="m-0 text-[0.9375rem] leading-[1.6] text-[var(--text-muted)]">
                {step.desc}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
