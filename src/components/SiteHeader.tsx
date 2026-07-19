'use client';

import { Globe, ChevronDown, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import Button from '@/components/ds/Button';
import Wordmark from '@/components/ds/Wordmark';
import { LOCALES, LOCALE_LABELS, type Locale } from '@/config/locales';
import { questionsIndexPath, switchLocalePath } from '@/config/slugs';

/* Language dropdown. Self-contained (own state + ref) because the header
 * renders it twice (desktop nav + mobile bar). Outside-close listens on
 * 'click', NOT 'mousedown' — a mousedown listener would unmount the menu's
 * links before their own click event fires and swallow the navigation. */
function LanguageSwitcher({ locale }: { locale: Locale }) {
  const t = useTranslations('nav');
  const pathname = usePathname() || `/${locale}`;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('language')}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-ds border-[1.5px] border-[var(--border-strong)] px-[11px] py-1.5 text-[0.85rem] font-semibold text-[var(--text-body)] transition-colors hover:bg-[var(--surface-inset)] focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]"
      >
        <Globe aria-hidden className="h-[15px] w-[15px]" />
        {locale.toUpperCase()}
        <ChevronDown aria-hidden className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[160px] overflow-hidden rounded-ds-lg border border-[var(--border-subtle)] bg-[var(--surface-card)] py-1 shadow-warm-lg"
        >
          {LOCALES.map((l) => (
            <a
              key={l}
              href={switchLocalePath(pathname, l)}
              role="option"
              aria-selected={l === locale}
              className={`block px-3.5 py-2 text-[0.9rem] no-underline transition-colors hover:bg-[var(--surface-inset)] ${
                l === locale
                  ? 'font-semibold text-[var(--accent-text)]'
                  : 'text-[var(--text-body)]'
              }`}
            >
              {LOCALE_LABELS[l] ?? l.toUpperCase()}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SiteHeader({ locale }: { locale: Locale }) {
  const t = useTranslations('nav');
  const pathname = usePathname() || `/${locale}`;
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const links = [
    { href: `/${locale}#how`, label: t('how') },
    { href: `/${locale}#kategorien`, label: t('categories') },
    { href: questionsIndexPath(locale), label: t('questions') },
  ];

  return (
    <header
      className="sticky top-0 z-50 border-b border-[var(--border-subtle)]"
      style={{ background: 'rgba(251,247,240,0.82)', backdropFilter: 'blur(12px)' }}
    >
      <div className="mx-auto flex h-[70px] max-w-container items-center justify-between px-6">
        <Link href={`/${locale}`} className="no-underline">
          <Wordmark />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-[30px] nav:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[0.9375rem] font-medium text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--text-strong)]"
            >
              {l.label}
            </Link>
          ))}
          <LanguageSwitcher locale={locale} />
          <Button size="sm" href={`/${locale}/generator`}>
            {t('cta')}
          </Button>
        </nav>

        {/* Mobile: language + burger */}
        <div className="flex items-center gap-3 nav:hidden">
          <LanguageSwitcher locale={locale} />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={t('menu')}
            className="inline-flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-ds border-[1.5px] border-[var(--border-strong)] text-[var(--text-body)] transition-colors hover:bg-[var(--surface-inset)]"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <nav className="border-t border-[var(--border-subtle)] bg-[var(--bg-page)] px-6 py-4 nav:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-ds px-3 py-2.5 text-[1rem] font-medium text-[var(--text-body)] no-underline transition-colors hover:bg-[var(--surface-inset)]"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2">
              <Button size="md" fullWidth href={`/${locale}/generator`}>
                {t('cta')}
              </Button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
