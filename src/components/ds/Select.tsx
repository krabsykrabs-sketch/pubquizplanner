'use client';

import { ChevronDown } from 'lucide-react';
import type { SelectHTMLAttributes } from 'react';

/** Styled native select — keeps native behavior (keyboard, mobile pickers). */
export default function Select({
  className = '',
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={`relative inline-flex ${className}`}>
      <select
        {...rest}
        className={
          'w-full cursor-pointer appearance-none rounded-ds border-[1.5px] border-[var(--border-strong)] ' +
          'bg-[var(--surface-card)] py-[9px] pl-3.5 pr-9 font-sans text-[0.9375rem] text-[var(--text-strong)] ' +
          'transition-colors duration-200 hover:bg-[var(--surface-inset)] ' +
          'focus:outline-none focus:border-[var(--border-focus)] focus:[box-shadow:var(--ring)] ' +
          'disabled:cursor-not-allowed disabled:bg-[var(--surface-inset)] disabled:text-[var(--text-faint)]'
        }
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
      />
    </span>
  );
}
