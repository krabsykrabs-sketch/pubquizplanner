// Config-driven localization of the question-page URL slugs.
//
// German (SOURCE_LOCALE) is the canonical URL scheme and MUST NOT change — its
// paths (/de/fragen/wissenschaft, ...) have real rankings. Every other locale
// serves native-language paths (/pl/pytania/nauka, /sv/fragor/musik, ...) that
// map back to the same German category rows. The German slug stored in
// `categories.slug` stays the internal canonical id everywhere in the app; only
// the public URL is localized.
//
// Adding a language: it works immediately with German slugs (graceful fallback).
// To localize it, add its segment to QUESTIONS_SEGMENT and its category map to
// CATEGORY_SLUG_TRANSLATIONS below. No routing/sitemap/hreflang code changes.

import { LOCALES, SOURCE_LOCALE, isLocale, type Locale } from './locales';

// The literal App Router folder for the question pages — the canonical German
// segment. This is the route that every localized path rewrites onto internally.
export const SOURCE_SEGMENT = 'fragen';

// The path segment that replaces "fragen" per locale. German stays "fragen".
// A locale missing here falls back to the German segment.
const QUESTIONS_SEGMENT: Partial<Record<Locale, string>> = {
  de: 'fragen',
  nl: 'vragen',
  pl: 'pytania',
  sv: 'fragor', // ASCII fold of "frågor" — portable, no encoded chars in URLs
  fr: 'questions',
  es: 'preguntas',
  pt: 'perguntas',
};

// Canonical (German) category slug -> localized slug, per non-source locale.
// German is identity (omitted). Slugs are lowercase ASCII (diacritics folded).
// Any canonical slug missing from a locale's map falls back to the German slug.
const CATEGORY_SLUG_TRANSLATIONS: Partial<Record<Locale, Record<string, string>>> = {
  nl: {
    allgemeinwissen: 'algemene-kennis',
    sport: 'sport',
    geschichte: 'geschiedenis',
    geographie: 'geografie',
    'film-tv': 'film-tv',
    musik: 'muziek',
    wissenschaft: 'wetenschap',
    'essen-trinken': 'eten-drinken',
    literatur: 'literatuur',
    'kunst-kultur': 'kunst-cultuur',
    technik: 'techniek',
    popkultur: 'popcultuur',
    sprache: 'taal',
    'logik-mathe': 'logica-wiskunde',
  },
  pl: {
    allgemeinwissen: 'wiedza-ogolna',
    sport: 'sport',
    geschichte: 'historia',
    geographie: 'geografia',
    'film-tv': 'film-tv',
    musik: 'muzyka',
    wissenschaft: 'nauka',
    'essen-trinken': 'jedzenie-napoje',
    literatur: 'literatura',
    'kunst-kultur': 'sztuka-kultura',
    technik: 'technika',
    popkultur: 'popkultura',
    sprache: 'jezyk',
    'logik-mathe': 'logika-matematyka',
  },
  sv: {
    allgemeinwissen: 'allmanbildning',
    sport: 'sport',
    geschichte: 'historia',
    geographie: 'geografi',
    'film-tv': 'film-tv',
    musik: 'musik',
    wissenschaft: 'vetenskap',
    'essen-trinken': 'mat-dryck',
    literatur: 'litteratur',
    'kunst-kultur': 'konst-kultur',
    technik: 'teknik',
    popkultur: 'popkultur',
    sprache: 'sprak',
    'logik-mathe': 'logik-matematik',
  },
  fr: {
    allgemeinwissen: 'culture-generale',
    sport: 'sport',
    geschichte: 'histoire',
    geographie: 'geographie',
    'film-tv': 'film-tv',
    musik: 'musique',
    wissenschaft: 'sciences',
    'essen-trinken': 'cuisine',
    literatur: 'litterature',
    'kunst-kultur': 'art-culture',
    technik: 'technologie',
    popkultur: 'culture-pop',
    sprache: 'langue',
    'logik-mathe': 'logique-maths',
  },
  es: {
    allgemeinwissen: 'cultura-general',
    sport: 'deportes',
    geschichte: 'historia',
    geographie: 'geografia',
    'film-tv': 'cine-tv',
    musik: 'musica',
    wissenschaft: 'ciencia',
    'essen-trinken': 'comida-bebida',
    literatur: 'literatura',
    'kunst-kultur': 'arte-cultura',
    technik: 'tecnologia',
    popkultur: 'cultura-pop',
    sprache: 'lengua',
    'logik-mathe': 'logica-matematicas',
  },
  pt: {
    allgemeinwissen: 'cultura-geral',
    sport: 'desporto',
    geschichte: 'historia',
    geographie: 'geografia',
    'film-tv': 'cinema-tv',
    musik: 'musica',
    wissenschaft: 'ciencia',
    'essen-trinken': 'comida-bebida',
    literatur: 'literatura',
    'kunst-kultur': 'arte-cultura',
    technik: 'tecnologia',
    popkultur: 'cultura-pop',
    sprache: 'lingua',
    'logik-mathe': 'logica-matematica',
  },
};

// Reverse maps (localized slug -> canonical slug), precomputed per locale.
const CANONICAL_BY_LOCALIZED: Partial<Record<Locale, Record<string, string>>> = {};
for (const [locale, map] of Object.entries(CATEGORY_SLUG_TRANSLATIONS)) {
  const reverse: Record<string, string> = {};
  for (const [canonical, localized] of Object.entries(map ?? {})) {
    reverse[localized] = canonical;
  }
  CANONICAL_BY_LOCALIZED[locale as Locale] = reverse;
}

/** The localized path segment ("fragen" / "vragen" / ...) for a locale. */
export function questionsSegment(locale: Locale): string {
  return QUESTIONS_SEGMENT[locale] ?? SOURCE_SEGMENT;
}

/** Canonical German slug -> localized slug (identity for German / unknown slugs). */
export function localizedCategorySlug(locale: Locale, canonicalSlug: string): string {
  if (locale === SOURCE_LOCALE) return canonicalSlug;
  return CATEGORY_SLUG_TRANSLATIONS[locale]?.[canonicalSlug] ?? canonicalSlug;
}

/** Localized slug -> canonical German slug (identity for German / unknown slugs). */
export function canonicalCategorySlug(locale: Locale, localizedSlug: string): string {
  if (locale === SOURCE_LOCALE) return localizedSlug;
  return CANONICAL_BY_LOCALIZED[locale]?.[localizedSlug] ?? localizedSlug;
}

/** Public URL path (locale-prefixed) for the questions index in a locale. */
export function questionsIndexPath(locale: Locale): string {
  return `/${locale}/${questionsSegment(locale)}`;
}

/** Public URL path for a category page, given its CANONICAL German slug. */
export function categoryPath(locale: Locale, canonicalSlug: string): string {
  return `/${locale}/${questionsSegment(locale)}/${localizedCategorySlug(locale, canonicalSlug)}`;
}

type Resolution =
  | { type: 'redirect'; pathname: string }
  | { type: 'rewrite'; pathname: string }
  | null;

// Resolve an incoming pathname against the localized question routes.
//   - Old German-segment URL in a non-German locale -> 301 to the localized URL.
//   - Localized-segment URL -> internal rewrite onto the German /fragen route.
//   - Anything else (German, non-question paths) -> null (caller passes through).
export function resolveQuestionsRoute(pathname: string): Resolution {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length < 2 || parts.length > 3) return null;

  const [maybeLocale, segment, slug] = parts;
  if (!isLocale(maybeLocale)) return null;
  const locale = maybeLocale as Locale;

  const localizedSeg = questionsSegment(locale);
  // German (or any locale that keeps the German segment) is canonical — untouched.
  if (localizedSeg === SOURCE_SEGMENT) return null;

  // Old German-segment URL -> redirect to the localized equivalent.
  if (segment === SOURCE_SEGMENT) {
    const target =
      slug === undefined
        ? `/${locale}/${localizedSeg}`
        : `/${locale}/${localizedSeg}/${localizedCategorySlug(locale, slug)}`;
    return { type: 'redirect', pathname: target };
  }

  // Localized-segment URL -> rewrite onto the internal German /fragen route.
  if (segment === localizedSeg) {
    const target =
      slug === undefined
        ? `/${locale}/${SOURCE_SEGMENT}`
        : `/${locale}/${SOURCE_SEGMENT}/${canonicalCategorySlug(locale, slug)}`;
    return { type: 'rewrite', pathname: target };
  }

  return null;
}

// Exposed for tests / tooling: the full set of localized category slugs a locale
// serves (canonical order preserved via LOCALES-agnostic iteration by caller).
export function allLocalesWithLocalizedSlugs(): Locale[] {
  return LOCALES.filter((l) => l !== SOURCE_LOCALE && !!CATEGORY_SLUG_TRANSLATIONS[l]);
}

// Map a current public pathname to its equivalent in another locale (for the
// language switcher). Question routes are fully re-localized (segment + slug);
// every other path just swaps the locale prefix. Query/hash are not part of
// `usePathname()` output, so they need no handling here.
export function switchLocalePath(pathname: string, nextLocale: Locale): string {
  const parts = pathname.split('/').filter(Boolean);
  const curLocale = parts[0];

  if (isLocale(curLocale) && (parts.length === 2 || parts.length === 3)) {
    const segment = parts[1];
    const slug = parts[2];
    const cur = curLocale as Locale;
    const isQuestionRoute =
      segment === SOURCE_SEGMENT || segment === questionsSegment(cur);
    if (isQuestionRoute) {
      if (slug === undefined) return questionsIndexPath(nextLocale);
      const canonical =
        segment === SOURCE_SEGMENT ? slug : canonicalCategorySlug(cur, slug);
      return categoryPath(nextLocale, canonical);
    }
  }

  // Non-question route (home, generator, legal): just swap the locale segment.
  const raw = pathname.split('/');
  raw[1] = nextLocale;
  return raw.join('/') || `/${nextLocale}`;
}
