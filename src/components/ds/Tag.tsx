'use client';

import type { ReactNode } from 'react';

/** Interactive/removable category chip. */
export default function Tag({
  selected = false,
  onClick,
  onRemove,
  className = '',
  children,
}: {
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
  children: ReactNode;
}) {
  const interactive = !!onClick;
  const Comp = interactive ? 'button' : 'span';
  return (
    <Comp
      onClick={onClick}
      type={interactive ? 'button' : undefined}
      aria-pressed={interactive ? selected : undefined}
      className={[
        'inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3 py-[5px] font-sans text-[0.8125rem] font-medium leading-[1.4]',
        'transition-all duration-200 [transition-timing-function:var(--ease-out)]',
        selected
          ? 'border-transparent bg-[var(--accent)] text-[var(--text-on-accent)]'
          : 'border-[var(--border-strong)] bg-[var(--surface-card)] text-[var(--text-body)]',
        interactive && !selected ? 'cursor-pointer hover:bg-[var(--surface-inset)]' : '',
        interactive ? 'focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
      {onRemove && (
        <span
          role="button"
          aria-label="Entfernen"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="-mr-0.5 inline-flex cursor-pointer opacity-70 hover:opacity-100"
        >
          ×
        </span>
      )}
    </Comp>
  );
}
