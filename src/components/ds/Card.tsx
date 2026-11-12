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
  flat: 'border-[1.5px] border-[var(--border-strong)] shadow-none',
  raised: 'border-2 border-[var(--edge)] shadow-hard',
  floating: 'border-2 border-[var(--edge)] shadow-hard-lg',
};

/** Content container. Quiet hairline by default; raised cards get the ink
 * outline + hard shadow of a game card. */
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
        'rounded-ds-xl bg-[var(--surface-card)]',
        PADDINGS[padding],
        ELEVATIONS[elevation],
        'transition-[box-shadow,transform] duration-200 [transition-timing-function:var(--ease-out)]',
        interactive ? 'cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg' : '',
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
