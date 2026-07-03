import { getTranslations } from 'next-intl/server';

// Static "3 steps" explainer. No dynamic data.
export default async function HowItWorks() {
  const t = await getTranslations('landing');

  const steps = [
    { num: '1', icon: '⚙️', title: t('step1Title'), desc: t('step1Desc') },
    { num: '2', icon: '👀', title: t('step2Title'), desc: t('step2Desc') },
    { num: '3', icon: '📥', title: t('step3Title'), desc: t('step3Desc') },
  ];

  return (
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
  );
}
