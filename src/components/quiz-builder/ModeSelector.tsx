'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { QUIZ_MODE_ORDER, type QuizMode } from '@/lib/quiz-modes';

interface Props {
  value: QuizMode;
  onChange: (mode: QuizMode) => void;
}

// i18n key fragments per mode — keeps this component driven entirely by
// QUIZ_MODE_ORDER, so a new mode needs only its config + strings.
const MODE_LABEL_KEY: Record<QuizMode, string> = {
  pub_quiz: 'modePubQuiz',
  fast: 'modeFast',
};
const MODE_HELP_KEY: Record<QuizMode, string> = {
  pub_quiz: 'modePubQuizHelp',
  fast: 'modeFastHelp',
};
const MODE_TOOLTIP_KEY: Record<QuizMode, string> = {
  pub_quiz: 'modeHelpPubQuiz',
  fast: 'modeHelpFast',
};

export default function ModeSelector({ value, onChange }: Props) {
  const t = useTranslations('generator');
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <label className="block text-sm text-[var(--muted)]">{t('modeLabel')}</label>
        <div className="relative">
          <button
            type="button"
            aria-label={t('modeHelpAria')}
            aria-expanded={showHelp}
            onClick={() => setShowHelp((v) => !v)}
            className="w-5 h-5 rounded-full border border-[var(--dark-border)] text-[var(--muted)] text-xs font-bold flex items-center justify-center hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
          >
            ?
          </button>
          {showHelp && (
            <>
              {/* click-away backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowHelp(false)}
                aria-hidden="true"
              />
              <div
                role="dialog"
                className="absolute left-0 top-7 z-20 w-72 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-4 shadow-xl text-left"
              >
                <p className="font-bold text-sm mb-2 text-[var(--foreground)]">
                  {t('modeHelpTitle')}
                </p>
                {QUIZ_MODE_ORDER.map((mode) => (
                  <p key={mode} className="text-xs text-[var(--muted)] leading-relaxed mb-2 last:mb-0">
                    {t(MODE_TOOLTIP_KEY[mode])}
                  </p>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {QUIZ_MODE_ORDER.map((mode) => {
          const selected = value === mode;
          return (
            <label
              key={mode}
              className={`flex items-start gap-3 cursor-pointer rounded-xl border p-4 transition-colors ${
                selected
                  ? 'border-[var(--gold)] bg-[var(--gold)]/10'
                  : 'border-[var(--dark-border)] hover:border-[var(--gold)]/50'
              }`}
            >
              <input
                type="radio"
                name="quizMode"
                className="mt-1 accent-[var(--gold)]"
                checked={selected}
                onChange={() => onChange(mode)}
              />
              <span>
                <span className="block font-bold text-sm text-[var(--foreground)]">
                  {t(MODE_LABEL_KEY[mode])}
                </span>
                <span className="block text-xs text-[var(--muted)] mt-1 leading-relaxed">
                  {t(MODE_HELP_KEY[mode])}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
