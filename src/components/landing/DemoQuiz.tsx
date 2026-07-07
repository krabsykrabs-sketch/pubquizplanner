'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

// Secondary, clearly-labelled entry point to the saved demo deck. Opens the
// real generated presentation (served by /api/demo) in a modal iframe so it is
// fully playable — click/tap or arrow keys navigate, exactly like a downloaded
// deck. Styled as a muted sample so it never competes with the hero generator
// CTA.
export default function DemoQuiz({ locale }: { locale: string }) {
  const t = useTranslations('demo');
  const [open, setOpen] = useState(false);

  return (
    <section className="px-6 py-10 flex justify-center">
      <div className="w-full max-w-2xl bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-6 text-center">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-[var(--gold)] border border-[var(--gold)]/40 rounded-full px-3 py-1 mb-3">
          {t('badge')}
        </span>
        <h2 className="text-xl font-bold mb-2">{t('sectionHeading')}</h2>
        <p className="text-sm text-[var(--muted)] mb-5 max-w-lg mx-auto">
          {t('sectionText')}
        </p>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 border-2 border-[var(--gold)] text-[var(--gold)] px-6 py-3 rounded-xl font-bold hover:bg-[var(--gold)] hover:text-[var(--background)] transition-colors"
        >
          ▶ {t('playButton')}
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={t('sectionHeading')}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full h-full max-w-6xl max-h-[90vh] bg-black rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label={t('close')}
              className="absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-black/60 text-white text-lg font-bold flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              ✕
            </button>
            <iframe
              src={`/api/demo?locale=${locale}`}
              title={t('sectionHeading')}
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}
    </section>
  );
}
