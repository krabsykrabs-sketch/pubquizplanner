import type { Locale } from '@/config/locales';

// SEO name variants used ONLY in <title>/meta description text — not the
// on-page H1, breadcrumb or nav, which keep the clean display name (name_de).
// Maps category slug -> noun phrase that matches how people actually search
// (Bing/Google Search Console terms), e.g. "Mathematik" and "Fernsehen" rather
// than the shorter display forms "Mathe" and "TV". Any slug without an entry
// falls back to the passed-in display name, so this is purely additive.
export const CATEGORY_SEO_NAMES: Partial<Record<Locale, Record<string, string>>> = {
  de: {
    // Display "Logik & Mathe" — but searchers type "mathematik".
    'logik-mathe': 'Mathematik & Logik',
    // Display "Film & TV" — but searchers type "film und fernsehen".
    'film-tv': 'Film & Fernsehen',
  },
};

export function getCategorySeoName(
  locale: string,
  slug: string,
  fallback: string
): string {
  return CATEGORY_SEO_NAMES[locale as Locale]?.[slug] ?? fallback;
}
