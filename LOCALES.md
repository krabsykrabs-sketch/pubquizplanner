# Adding a locale

PubQuizPlanner is German-first. German (`de`) is the review pipeline and the
**source of truth**: its content lives in `questions.*_de` and `categories.name_de`.
Every other locale is a **derived translation** stored in `question_translations`
and `category_translations`, served by aliasing the translated columns back onto
the `*_de` fields so the rest of the app stays locale-agnostic.

Rollout order (from the i18n plan): `nl` → `es` → `pl` → `it` → `fr`.

There is **one config file** — [`src/config/locales.ts`](src/config/locales.ts) —
that every code path derives its locale list from. Adding a language is a config
change there plus content. You should not need to touch routing, middleware,
sitemap, or hreflang logic.

> **Polish (`pl`) caveat:** jsPDF's built-in Helvetica is Latin-1 only. The PDF
> answer sheet / cheat sheet need a Unicode font embedded before `pl` (or any
> non-Latin-1 locale) renders correctly. Budget for that when you get there.

---

## Checklist

Say you're adding `es` (Spanish).

### 1. Register the locale (code)

In [`src/config/locales.ts`](src/config/locales.ts):

- Add `'es'` to the `LOCALES` tuple.
- Add an `OG_LOCALE` entry: `es: 'es_ES'`.
- Add a `LOCALE_LABELS` entry: `es: 'Español'`.

That's the **only** code change. `EXTRA_LOCALES`, the middleware matcher (a
locale-agnostic catch-all), `generateStaticParams`, the sitemap, and all hreflang
tags derive from `LOCALES` automatically.

### 2. UI message catalog (content, required)

Copy `src/i18n/de.json` → `src/i18n/es.json` and translate every value. Keys must
match `de.json` exactly. This file is **required** — `src/i18n/request.ts` imports
`./${locale}.json` at request time, so a missing file breaks the locale.

### 3. Category names in the DB (content, required)

`category_translations` needs a row per category for the new locale, or category
pages/chips won't resolve localized names. Seed them (mirror how `nl` was seeded
in `scripts/migrate-add-translations.ts`, or insert directly). 14 categories.

### 4. Translate the questions (content, required)

```bash
DATABASE_URL=... ANTHROPIC_API_KEY=... node scripts/translate-questions.mjs es
```

- Add `es` to the `LANGUAGES` map in `scripts/translate-questions.mjs` if it isn't
  already there.
- The script only translates questions whose German `source_hash` is new or
  changed, so it's safe to re-run — it picks up newly-approved / reworded questions.
- **Strict no-fallback + the ≥30 threshold apply per locale.** A category only
  appears for `es` once it has ≥ `MIN_QUESTIONS_PER_CATEGORY` (30) translated
  questions. Until then that category is silently absent for `es` (and its
  hreflang alternate is correctly omitted — see below).

### 5. Output & SEO strings (content, optional but recommended)

These have a German fallback, so the locale won't break without them — but you'll
get German text in a Spanish context until you add them:

- `src/lib/output-strings.ts` — `STRINGS.es` (presentation / PDF / cheat-sheet UI).
- `src/lib/category-intros.ts` — `CATEGORY_INTROS.es` (per-category SEO intros;
  missing entries fall back to a templated message).
- `src/app/(public)/[locale]/opengraph-image.tsx` — `TAGLINES.es` (OG image
  tagline).

The TypeScript types on these registries are keyed to `Locale`, so a typo'd
locale key is a compile error.

### 6. Verify

```bash
npx tsc --noEmit
# then, with the dev server on :3100 and the DB tunnel up:
curl -s http://localhost:3100/es | grep hrefLang        # landing renders + alternates
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/es/fragen
```

Check that hreflang alternates list `es` where content exists, and that a category
below the threshold in `es` returns 404 at `/es/fragen/<slug>` and is **not**
listed as an `es` hreflang alternate on the other locales' pages.

---

## How hreflang works here

`localeAlternates(pathSuffix, availableLocales?)` in `src/config/locales.ts` builds
the `alternates.languages` map:

- **Home** (`page.tsx`) and **`/fragen`** index: exist for every locale → advertise
  all `LOCALES`.
- **Category detail** (`/fragen/[slug]`): only advertises the locales where that
  category clears the threshold (`getCategoryLocales(slug)`), so we never point
  hreflang at a URL that 404s.
- `x-default` points at the source locale (`de`) when available, else the first
  available locale.

## The one static exception: the middleware matcher

`src/middleware.ts` `config.matcher` must be a **static literal** — Next.js reads it
at build time and ignores computed values, so it can't be derived from `LOCALES`.
It's written as a locale-agnostic catch-all (`/((?!api|_next|_vercel|admin|.*\..*).*)`)
that matches any public path regardless of locale prefix, so adding a locale still
needs **no edit here**.

## What is NOT needed

- **No questions-schema migration.** Questions are already locale-scoped via
  `question_translations`; there is deliberately no `locale` column on `questions`.
- No new routes, layouts, or per-locale page files — the `[locale]` segment serves
  them all.
