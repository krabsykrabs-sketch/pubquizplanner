/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from 'react';

/**
 * CategoryTile — a game card for a quiz subject.
 * The subject illustration (or, when there is no art, a large icon) sits on a
 * tinted panel; name and count sit below on paper. Ink outline + hard shadow.
 * Get `image`, `tint` and `onDark` from categoryVisual()/categoryLook().
 */
export default function CategoryTile({
  title,
  subtitle,
  image,
  icon,
  tint = 'var(--yellow-soft)',
  onDark = false,
  ratio = '4 / 3',
  size = 'md',
  selected = false,
  onClick,
  href,
  className = '',
  style,
  children,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Square illustration with a transparent ground (icon.svg). */
  image?: string | null;
  /** Fallback glyph when there is no illustration. */
  icon?: ReactNode;
  /** CSS background of the art panel. */
  tint?: string;
  /** The tint is dark: the fallback glyph turns light. */
  onDark?: boolean;
  /** Aspect ratio of the art panel. */
  ratio?: string;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const interactive = !!onClick || !!href;
  const titleSize = {
    sm: 'text-[1.05rem]',
    md: 'text-[1.05rem] sm:text-[1.25rem]',
    lg: 'text-[1.5rem]',
  }[size];

  const inner = (
    <>
      <div
        className="relative grid place-items-center border-b-2 border-[var(--edge)]"
        style={{ aspectRatio: ratio, background: tint }}
      >
        {image ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            className={`absolute inset-0 m-auto aspect-square h-[84%] w-auto object-contain transition-transform duration-200 [transition-timing-function:var(--ease-out)] ${
              interactive ? 'group-hover:scale-[1.06] group-hover:-rotate-2' : ''
            }`}
          />
        ) : (
          icon && (
            <div aria-hidden className={onDark ? 'text-[var(--yellow-soft)]' : 'text-[var(--warm-900)]'}>
              {icon}
            </div>
          )
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 px-3.5 pb-3.5 pt-3 text-left sm:px-[18px] sm:pb-[18px] sm:pt-4">
        {title && (
          <span
            className={`font-display font-extrabold leading-[1.15] tracking-[-0.01em] text-[var(--text-strong)] [hyphens:auto] ${titleSize}`}
          >
            {title}
          </span>
        )}
        {subtitle && (
          <span className="font-mono text-[0.78rem] font-medium leading-none text-[var(--text-faint)]">
            {subtitle}
          </span>
        )}
        {children}
      </div>
    </>
  );

  const cls = [
    'group flex w-full flex-col overflow-hidden rounded-ds-xl border-2 bg-[var(--surface-card)]',
    selected
      ? 'border-[var(--edge)] shadow-[4px_4px_0_var(--amber-500)]'
      : 'border-[var(--edge)] shadow-hard',
    interactive
      ? 'cursor-pointer no-underline hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]'
      : '',
    'transition-[transform,box-shadow] duration-[120ms] [transition-timing-function:var(--ease-out)]',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <a href={href} className={cls} style={style}>
        {inner}
      </a>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls} style={style}>
        {inner}
      </button>
    );
  }
  return (
    <div className={cls} style={style}>
      {inner}
    </div>
  );
}
