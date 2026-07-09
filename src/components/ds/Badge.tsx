import type { ReactNode } from 'react';

type Tone = 'neutral' | 'accent' | 'success' | 'danger';

const TONES: Record<Tone, string> = {
  neutral:
    'bg-[var(--surface-inset)] text-[var(--text-muted)] border-[var(--border-subtle)]',
  accent: 'bg-[var(--accent-soft)] text-[var(--accent-text)] border-transparent',
  success: 'bg-[var(--success-soft)] text-[var(--success)] border-transparent',
  danger: 'bg-[var(--danger-soft)] text-[var(--danger)] border-transparent',
};

export default function Badge({
  tone = 'neutral',
  className = '',
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-[5px] whitespace-nowrap rounded-full border px-2.5 py-[3px] font-sans text-xs font-semibold leading-[1.4] tracking-[0.01em] ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
