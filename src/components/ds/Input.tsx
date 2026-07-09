'use client';

import type { InputHTMLAttributes } from 'react';

export default function Input({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      className={
        'w-full rounded-ds border-[1.5px] border-[var(--border-strong)] bg-[var(--surface-card)] ' +
        'px-3.5 py-[9px] font-sans text-[0.9375rem] text-[var(--text-strong)] placeholder:text-[var(--text-faint)] ' +
        'transition-colors duration-200 ' +
        'focus:outline-none focus:border-[var(--border-focus)] focus:[box-shadow:var(--ring)] ' +
        'disabled:cursor-not-allowed disabled:bg-[var(--surface-inset)] disabled:text-[var(--text-faint)] ' +
        className
      }
    />
  );
}
