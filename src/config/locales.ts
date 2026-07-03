// Single source of truth for the app's locales.
//
// Adding a language is a config change HERE plus content (messages/intros/
// strings/translations) — see LOCALES.md. No other code file should hardcode a
// locale list. The one unavoidable exception is `middleware.ts`, whose `config
// .matcher` must be a static literal (Next.js requirement); it uses a
// locale-agnostic catch-all so it still needs no per-locale edit.

// German is the review pipeline and source of truth. Its content lives in the
// questions.*_de / categories.name_de columns; every other locale is a derived
// translation in question_translations / category_translations.
export const SOURCE_LOCALE = 'de';

// All supported locales, source first. Add a new locale code here to enable it
// across routing, static params, sitemap and hreflang.
// NB: Swedish uses the ISO 639-1 language code 'sv' (not 'se', which is Sami).
export const LOCALES = ['de', 'nl', 'pl', 'sv'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = SOURCE_LOCALE;

// Non-source locales serve ONLY translated content (strict no-fallback). Derived
// so it never drifts from LOCALES.
export const EXTRA_LOCALES: Locale[] = LOCALES.filter((l) => l !== SOURCE_LOCALE);

// A category is only visible (chips, /fragen, sitemap, hreflang) once it has at
// least this many approved questions — enforced per locale via a translated join.
export const MIN_QUESTIONS_PER_CATEGORY = 30;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

// og:locale tag per locale. Extend when adding a language.
export const OG_LOCALE: Partial<Record<Locale, string>> = {
  de: 'de_DE',
  nl: 'nl_NL',
  pl: 'pl_PL',
  sv: 'sv_SE',
};

// Human-readable language names (hreflang debugging, a future language switcher).
export const LOCALE_LABELS: Partial<Record<Locale, string>> = {
  de: 'Deutsch',
  nl: 'Nederlands',
  pl: 'Polski',
  sv: 'Svenska',
};

// Build the `alternates.languages` map for a page's hreflang tags.
//
// `pathSuffix` is the part after the locale segment ('' for the home page,
// '/fragen', '/fragen/technik'). Pass `availableLocales` when a page does not
// exist in every locale (e.g. a category that clears the threshold only in some
// languages) so we never advertise a URL that 404s. x-default points at the
// source locale when available, otherwise the first available locale.
export function localeAlternates(
  pathSuffix: string,
  availableLocales: readonly Locale[] = LOCALES
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of availableLocales) {
    languages[locale] = `/${locale}${pathSuffix}`;
  }
  const xDefault = availableLocales.includes(SOURCE_LOCALE)
    ? SOURCE_LOCALE
    : availableLocales[0];
  if (xDefault) languages['x-default'] = `/${xDefault}${pathSuffix}`;
  return languages;
}
