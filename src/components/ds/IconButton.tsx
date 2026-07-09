'use client';

import type { ButtonHTMLAttributes } from 'react';

type Variant = 'ghost' | 'outline' | 'solid';
type Size = 'sm' | 'md' | 'lg';

const SIZES: Record<Size, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-[50px] w-[50px]',
};

const VARIANTS: Record<Variant, string> = {
  ghost:
    'bg-transparent text-[var(--text-muted)] border-transparent hover:bg-[var(--surface-inset)] hover:text-[var(--text-body)]',
  outline:
    'bg-[var(--surface-card)] text-[var(--text-body)] border-[var(--border-strong)] hover:bg-[var(--surface-inset)]',
  solid:
    'bg-[var(--accent)] text-[var(--text-on-accent)] border-transparent hover:bg-[var(--accent-hover)]',
};

export default function IconButton({
  variant = 'ghost',
  size = 'md',
  label,
  className = '',
  children,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
  /** Accessible name — icon-only buttons must always have one. */
  label: string;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={[
        'inline-flex items-center justify-center rounded-ds border-[1.5px] cursor-pointer',
        'transition-colors duration-200 [transition-timing-function:var(--ease-out)]',
        'focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]',
        'disabled:cursor-not-allowed disabled:bg-[var(--surface-inset)] disabled:text-[var(--text-faint)]',
        SIZES[size],
        VARIANTS[variant],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
