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
      <div className="mb-3 flex items-center gap-2">
        <label className="block text-sm font-medium text-[var(--text-muted)]">
          {t('modeLabel')}
        </label>
        <div className="relative">
          <button
            type="button"
            aria-label={t('modeHelpAria')}
            aria-expanded={showHelp}
            onClick={() => setShowHelp((v) => !v)}
            className="flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border-strong)] text-xs font-bold text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent-text)]"
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
                className="absolute left-0 top-7 z-20 w-72 rounded-ds-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 text-left shadow-warm-lg"
              >
                <p className="mb-2 text-sm font-bold text-[var(--text-strong)]">
                  {t('modeHelpTitle')}
                </p>
                {QUIZ_MODE_ORDER.map((mode) => (
                  <p
                    key={mode}
                    className="mb-2 text-xs leading-relaxed text-[var(--text-muted)] last:mb-0"
                  >
                    {t(MODE_TOOLTIP_KEY[mode])}
                  </p>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {QUIZ_MODE_ORDER.map((mode) => {
          const selected = value === mode;
          return (
            <label
              key={mode}
              className={`flex cursor-pointer items-start gap-3 rounded-ds-lg border-[1.5px] p-4 transition-colors ${
                selected
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
              }`}
            >
              <input
                type="radio"
                name="quizMode"
                className="mt-1 accent-[var(--amber-500)]"
                checked={selected}
                onChange={() => onChange(mode)}
              />
              <span>
                <span className="block text-sm font-bold text-[var(--text-strong)]">
                  {t(MODE_LABEL_KEY[mode])}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-[var(--text-muted)]">
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
