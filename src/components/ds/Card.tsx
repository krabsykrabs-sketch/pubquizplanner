import type { HTMLAttributes, ReactNode } from 'react';

type Elevation = 'flat' | 'raised' | 'floating';
type Padding = 'none' | 'sm' | 'md' | 'lg';

const PADDINGS: Record<Padding, string> = {
  none: 'p-0',
  sm: 'p-3.5',
  md: 'p-5',
  lg: 'p-7',
};

const ELEVATIONS: Record<Elevation, string> = {
  flat: 'shadow-none',
  raised: 'shadow-warm-md',
  floating: 'shadow-warm-lg',
};

/** Content container. Restraint: hairline border by default, shadow only when raised. */
export default function Card({
  elevation = 'flat',
  padding = 'md',
  interactive = false,
  className = '',
  children,
  ...rest
}: {
  elevation?: Elevation;
  padding?: Padding;
  interactive?: boolean;
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        'rounded-ds-lg border border-[var(--border-subtle)] bg-[var(--surface-card)]',
        PADDINGS[padding],
        ELEVATIONS[elevation],
        'transition-[box-shadow,transform] duration-200 [transition-timing-function:var(--ease-out)]',
        interactive ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-warm-lg' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}
