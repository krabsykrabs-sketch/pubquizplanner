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
// NB: 'pt' is European Portuguese (site targets the European market).
export const LOCALES = ['de', 'nl', 'pl', 'sv', 'fr', 'es', 'pt'] as const;

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

// Locales Google may index. Every other locale gets `<meta name="googlebot"
// content="noindex, follow">` (Google-only — Bing/DuckDuckGo/Ecosia ignore it
// and keep ranking those pages) and is dropped from hreflang.
//
// Why (Nov 2026): after 5 machine-translated locales went live in July 2026,
// Google's indexed pages fell 164 → 75 and impressions ~100/day → ~2/day,
// while Bing kept growing. 96 of 116 sitemap URLs were translations of the
// German pages, so Google likely rated the whole site as scaled/thin content.
// Re-add a locale here only once its content is genuinely its own (reviewed,
// locally relevant questions), not a 1:1 translation.
export const GOOGLE_INDEXED_LOCALES: readonly Locale[] = [SOURCE_LOCALE];

export function isGoogleIndexed(locale: string): boolean {
  return (GOOGLE_INDEXED_LOCALES as readonly string[]).includes(locale);
}

// og:locale tag per locale. Extend when adding a language.
export const OG_LOCALE: Partial<Record<Locale, string>> = {
  de: 'de_DE',
  nl: 'nl_NL',
  pl: 'pl_PL',
  sv: 'sv_SE',
  fr: 'fr_FR',
  es: 'es_ES',
  pt: 'pt_PT',
};

// Human-readable language names (hreflang debugging, a future language switcher).
export const LOCALE_LABELS: Partial<Record<Locale, string>> = {
  de: 'Deutsch',
  nl: 'Nederlands',
  pl: 'Polski',
  sv: 'Svenska',
  fr: 'Français',
  es: 'Español',
  pt: 'Português',
};

// Build the `alternates.languages` map for a page's hreflang tags.
//
// `pathSuffix` is the part after the locale segment. Pass a string when it is
// the same for every locale ('' for the home page, '/generator'), or a builder
// `(locale) => suffix` when the path is localized per locale (question slugs:
// '/vragen/wetenschap' for nl, '/pytania/nauka' for pl, ...). Pass
// `availableLocales` when a page does not exist in every locale (e.g. a category
// that clears the threshold only in some languages) so we never advertise a URL
// that 404s. x-default points at the source locale when available, otherwise the
// first available locale. Only GOOGLE_INDEXED_LOCALES are advertised: hreflang
// is a Google signal, and pointing it at googlebot-noindexed pages is
// contradictory (Bing barely uses hreflang, so nothing is lost there).
export function localeAlternates(
  pathSuffix: string | ((locale: Locale) => string),
  availableLocales: readonly Locale[] = LOCALES
): Record<string, string> {
  const suffixFor = typeof pathSuffix === 'function' ? pathSuffix : () => pathSuffix;
  const languages: Record<string, string> = {};
  for (const locale of availableLocales.filter(isGoogleIndexed)) {
    languages[locale] = `/${locale}${suffixFor(locale)}`;
  }
  const xDefault = availableLocales.includes(SOURCE_LOCALE)
    ? SOURCE_LOCALE
    : availableLocales[0];
  if (xDefault) languages['x-default'] = `/${xDefault}${suffixFor(xDefault)}`;
  return languages;
}
