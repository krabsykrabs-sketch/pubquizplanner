import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const SIZES: Record<Size, string> = {
  sm: 'gap-1.5 px-3 py-1.5 text-[0.8125rem] min-h-[32px]',
  md: 'gap-2 px-[18px] py-[9px] text-[0.9375rem] min-h-[40px]',
  lg: 'gap-2.5 px-[26px] py-[13px] text-[1.0625rem] min-h-[50px]',
};

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-[var(--accent)] text-[var(--text-on-accent)] border-transparent hover:bg-[var(--accent-hover)] shadow-warm-sm',
  secondary:
    'bg-[var(--surface-card)] text-[var(--text-strong)] border-[var(--border-strong)] hover:bg-[var(--surface-inset)]',
  ghost:
    'bg-transparent text-[var(--text-body)] border-transparent hover:bg-[var(--surface-inset)]',
  danger: 'bg-[var(--danger)] text-white border-transparent hover:bg-[var(--red-600)]',
};

const BASE =
  'inline-flex items-center justify-center font-sans font-semibold leading-none tracking-[0.01em] ' +
  'rounded-ds border-[1.5px] cursor-pointer no-underline select-none ' +
  'transition-[background,transform] duration-200 [transition-timing-function:var(--ease-out)] ' +
  'hover:-translate-y-px focus-visible:outline-none focus-visible:[box-shadow:var(--ring)] ' +
  'disabled:cursor-not-allowed disabled:bg-[var(--surface-inset)] disabled:text-[var(--text-faint)] disabled:hover:translate-y-0 disabled:shadow-none';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
  children?: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & { href?: undefined };
type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className'> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  iconLeft,
  iconRight,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const cls = [BASE, SIZES[size], VARIANTS[variant], fullWidth ? 'w-full' : '', className]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {iconLeft && (
        <span className="inline-flex" aria-hidden>
          {iconLeft}
        </span>
      )}
      {children}
      {iconRight && (
        <span className="inline-flex" aria-hidden>
          {iconRight}
        </span>
      )}
    </>
  );

  if ('href' in rest && typeof rest.href === 'string') {
    const { href, ...anchorProps } = rest as ButtonAsLink;
    return (
      <Link href={href} className={cls} {...(anchorProps as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </Link>
    );
  }

  return (
    <button className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {content}
    </button>
  );
}
