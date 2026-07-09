import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';

/**
 * CategoryTile — the brand's signature image frame.
 * A big, stylized image owns the tile; a consistent vignette + amber grade
 * + type lockup ties every category image (generic or specific) into one
 * family. Falls back to a warm gradient wash + icon watermark when no image
 * is set.
 */
export default function CategoryTile({
  title,
  subtitle,
  image,
  icon,
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
  image?: string | null;
  icon?: ReactNode;
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
  const titleSize = { sm: 'text-[1.125rem]', md: 'text-2xl', lg: 'text-[2rem]' }[size];

  const inner = (
    <>
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 860px) 100vw, 400px"
          className={`object-cover transition-transform duration-[340ms] [transition-timing-function:var(--ease-out)] ${
            interactive ? 'group-hover:scale-[1.04]' : ''
          }`}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 120% at 30% 20%, var(--amber-500), var(--amber-700) 70%, var(--night-900))',
          }}
        />
      )}
      <div aria-hidden className="absolute inset-0" style={{ background: 'var(--image-grade)' }} />
      <div aria-hidden className="absolute inset-0" style={{ background: 'var(--image-vignette)' }} />
      {!image && icon && (
        <div aria-hidden className="absolute right-[18px] top-4 text-white/55">
          {icon}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-[3px] px-5 py-[18px] text-left">
        {subtitle && (
          <span className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-[var(--amber-300)]">
            {subtitle}
          </span>
        )}
        {title && (
          <span
            className={`font-display font-extrabold leading-[1.05] tracking-[-0.02em] text-white ${titleSize}`}
          >
            {title}
          </span>
        )}
        {children}
      </div>
    </>
  );

  const cls = [
    'group relative block w-full overflow-hidden rounded-ds-xl bg-[var(--night-800)]',
    selected ? 'border-[2.5px] border-[var(--accent)]' : 'border-[2.5px] border-transparent',
    interactive
      ? 'cursor-pointer shadow-warm-sm hover:-translate-y-[3px] hover:shadow-warm-lg focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]'
      : 'shadow-warm-sm',
    'transition-[transform,box-shadow] duration-200 [transition-timing-function:var(--ease-out)]',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const styles: CSSProperties = { aspectRatio: ratio, ...style };

  if (href) {
    return (
      <a href={href} className={cls} style={styles}>
        {inner}
      </a>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls} style={styles}>
        {inner}
      </button>
    );
  }
  return (
    <div className={cls} style={styles}>
      {inner}
    </div>
  );
}
