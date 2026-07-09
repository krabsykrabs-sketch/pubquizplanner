'use client';

import { Volume2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Props {
  seconds: number;
  sound: boolean;
  onChangeSeconds: (seconds: number) => void;
  onChangeSound: (sound: boolean) => void;
}

// Per-question countdown durations offered on the setup step. 0 = off (the
// timer is opt-in). Must stay in sync with the allow-list the deck validates
// against in src/lib/presentation-builder.ts.
const DURATION_OPTIONS = [0, 30, 45, 60, 90];

export default function TimerSelector({
  seconds,
  sound,
  onChangeSeconds,
  onChangeSound,
}: Props) {
  const t = useTranslations('generator');
  const enabled = seconds > 0;

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[var(--text-muted)]">
        {t('timerLabel')}
      </label>
      <p className="mb-3 text-xs leading-relaxed text-[var(--text-muted)]">
        {t('timerHelp')}
      </p>

      <div className="flex flex-wrap gap-2">
        {DURATION_OPTIONS.map((value) => {
          const selected = seconds === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChangeSeconds(value)}
              className={`rounded-full border-[1.5px] px-4 py-2 font-mono text-sm font-semibold transition-colors ${
                selected
                  ? 'border-transparent bg-[var(--accent)] text-[var(--text-on-accent)]'
                  : 'border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:bg-[var(--surface-inset)]'
              }`}
            >
              {value === 0 ? t('timerOff') : `${value}s`}
            </button>
          );
        })}
      </div>

      {enabled && (
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-[var(--text-muted)]">
          <input
            type="checkbox"
            className="accent-[var(--amber-500)]"
            checked={sound}
            onChange={(e) => onChangeSound(e.target.checked)}
          />
          <span className="inline-flex items-center gap-1.5">
            <Volume2 className="h-4 w-4" aria-hidden />
            {t('timerSoundLabel')}
          </span>
        </label>
      )}
    </div>
  );
}
