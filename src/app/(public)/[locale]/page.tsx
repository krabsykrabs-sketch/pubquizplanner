import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function LandingPage() {
  const t = useTranslations('landing');

  const steps = [
    { num: '1', icon: '⚙️', title: t('step1Title'), desc: t('step1Desc') },
    { num: '2', icon: '👀', title: t('step2Title'), desc: t('step2Desc') },
    { num: '3', icon: '📥', title: t('step3Title'), desc: t('step3Desc') },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="text-6xl mb-8">🧠</div>
        <h1 className="text-5xl md:text-7xl font-black text-[var(--gold)] mb-6 text-balance">
          {t('hero')}
        </h1>
        <p className="text-xl md:text-2xl text-[var(--muted)] mb-12 max-w-2xl">
          {t('subtitle')}
        </p>
        <Link
          href="/de/generator"
          className="inline-flex items-center gap-3 bg-[var(--gold)] text-[var(--background)] px-8 py-4 rounded-xl text-lg font-bold hover:bg-[var(--gold-light)] transition-colors"
        >
          {t('cta')} →
        </Link>
      </section>

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
                Schritt {step.num}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-[var(--muted)]">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--dark-border)] py-8 text-center text-sm text-[var(--muted)]">
        <p>© 2026 PubQuizPlanner · Erstellt mit ❤️ für Quizmaster</p>
      </footer>
    </main>
  );
}
