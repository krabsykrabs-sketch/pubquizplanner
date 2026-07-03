# Landing page design — ChatGPT handoff prompts

**Task 5, stage 1.** The landing page (`src/app/(public)/[locale]/page.tsx`) now
separates data from presentation: `page.tsx` fetches the data and composes four
presentational components in `src/components/landing/`:

- `LandingHero` — value prop + two CTAs into the generator (no data)
- `CategorySection` — dynamic category chips + rounded question count
- `SampleQuestions` — three real sample questions with answers + fun facts
- `HowItWorks` — the static 3-step explainer

A returned design is applied by restyling these components; they keep consuming the
same typed data (`src/components/landing/types.ts`). So the design must preserve the
**dynamic data elements** and the **component seams**, not just look nice.

Prompts below: 1 master brief, then hero and category/sample deep-dives. Paste the
shared context first.

---

## Shared context (paste once, or prepend to any prompt)

```
I'm redesigning the landing page of a German pub quiz generator
(pubquizplanner.com). It's Next.js 14 (App Router, React Server Components) +
Tailwind CSS. I want a clean, modern, premium look — the differentiator is that we
feel less cluttered and more designed than typical quiz-night sites. Constraints:

- TECH: output must be React JSX using Tailwind utility classes (no styled-
  components, no external UI kit). Server components — no client-side state unless
  strictly necessary. Links use next/link's <Link href="…">.
- THEME: the app is dark by default and themed via CSS variables. Use these exact
  Tailwind arbitrary values so it matches the rest of the site:
  text/bg: text-[var(--foreground)], bg-[var(--background)]
  accent: text-[var(--gold)] / bg-[var(--gold)], hover text-[var(--gold-light)]
  muted text: text-[var(--muted)]
  cards: bg-[var(--dark-card)] with border border-[var(--dark-border)]
  Don't introduce new raw hex colours; use these variables so it stays themeable.
- RESPONSIVE: mobile-first, must look great from 360px phones to wide desktop.
- I18N: the site runs in German and Dutch (and more later). All user-facing copy
  comes from a translation system (next-intl) — so DO NOT hardcode visible strings;
  show them as {t('someKey')} placeholders and keep layout robust to longer/shorter
  translations. Category names and the question count are dynamic too.
- LANGUAGE-NEUTRAL VISUALS: no text baked into images; decoration is CSS only. No
  licensed/stock imagery — use CSS gradients/shapes, the existing emoji category
  icons, and typography.

THE PAGE HAS FOUR SECTIONS (keep them as separable components):
1. Hero — a headline value prop {t('hero')}, a subtitle {t('subtitle')}, and TWO
   CTAs: a primary "build a quiz" button → /{locale}/generator, and a secondary
   "surprise me / quick start" → /{locale}/generator?quick=1.
2. Category section — a headline with the dynamic question count
   ({t('categoriesHeadline', { count })}), a subtitle with the category count, then
   a set of category "chips" (each: an emoji icon + localized name, linking to
   /{locale}/fragen/{slug}), and a link to /{locale}/fragen ("all questions"). The
   chips are DATA-DRIVEN: 6–14 of them, variable name lengths.
3. Sample questions — three real question cards, each showing a category
   (icon + name), the question text, the answer (accent colour), and an optional
   "fun fact" line. This is content depth / social proof.
4. How it works — three steps (icon, "Schritt N", title, description).

DATA CONTRACT (the design must consume exactly these shapes):
  CategoryChip  = { slug: string; name_de: string; icon: string }  // name_de is the
                  localized name; icon is an emoji
  SampleQuestion = { text_de: string; answer_de: string;
                     fun_fact_de: string | null;
                     category_name_de: string; category_icon: string }
```

---

## Prompt 1 — Master brief (full landing redesign)

```
[Paste the shared context above first.]

Redesign this landing page end to end. Deliver:

1. A 2–3 sentence design rationale: the visual identity and why it reads as premium
   and uncluttered for a pub quiz audience.
2. Four self-contained React + Tailwind server components — LandingHero,
   CategorySection, SampleQuestions, HowItWorks — matching the four sections and the
   data contract above. Keep {t('…')} placeholders for all copy (use the key names
   from the context) and map the dynamic data via .map() over the given shapes. Use
   the CSS-variable Tailwind classes specified; don't invent new colours.
3. A short note on the overall page composition: section order, vertical rhythm /
   spacing scale, max-width, and how the eye should travel from hero → CTA.

Make the hero confident and spacious, make the category chips feel like an inviting
"menu" rather than a tag cloud, and make the sample cards look editorial. Everything
must degrade gracefully on a 360px phone. Prioritise clarity and a single strong
accent over decoration.
```

---

## Prompt 2 — Hero section (highest-impact)

```
[Paste the shared context first.]

Design ONLY the hero section, and give me 3 distinct variations as React + Tailwind
(server component) snippets. The hero must contain: the headline {t('hero')}, the
subtitle {t('subtitle')}, a primary CTA button linking to /{locale}/generator with
label {t('cta')}, and a secondary CTA to /{locale}/generator?quick=1 with label
{t('quickStart')} (a "surprise me" quick-start). 

For each variation, describe the concept in one line, then the JSX. Explore
different compositions (e.g. centred and airy; left-aligned with a CSS-art panel on
the right; a bold oversized-type treatment). Use only the themed CSS-variable
colours, keep it readable on mobile, and make the primary vs secondary CTA hierarchy
obvious. No images — any visual interest must be pure CSS (gradients, blurred
accent glows, geometric shapes, big type).
```

---

## Prompt 3 — Category chips + sample questions (the dynamic content)

```
[Paste the shared context first.]

Design the two data-driven sections: the CATEGORY chips and the SAMPLE QUESTION
cards. Give me React + Tailwind server-component snippets that .map() over the data
shapes in the contract.

Category section: present 6–14 category chips (emoji icon + localized name, each a
<Link> to /{locale}/fragen/{slug}) in a way that feels like a curated menu and stays
tidy whether there are 6 or 14, with short or long names. Include the dynamic count
headline and the "all questions" link to /{locale}/fragen. Show both a chip/pill
treatment and a small-card/grid treatment so I can compare.

Sample questions: three cards, each with category (icon + name), question text
(variable length ~15–220 chars), the answer in the accent colour, and an optional
fun-fact line (may be null — handle gracefully). Make them look like little
"tasting notes" that make a visitor want to play. Ensure the grid collapses cleanly
to one column on mobile. Themed CSS-variable colours only.
```

---

## Applying a returned design

1. The four components live in `src/components/landing/`. Replace each component's
   JSX with the returned version, keeping the same props (`locale`, `categories`,
   `displayCount`, `questions`) and the `{t('…')}` keys.
2. If the design adds new copy, add the keys to `src/i18n/de.json` and `nl.json`
   (and any other locale files) — never hardcode visible strings.
3. `page.tsx` stays as-is (it fetches data and composes the four components); you
   shouldn't need to touch the DB queries.
4. `npx tsc --noEmit`, then check `/de` and `/nl` on desktop and a 360px phone, with
   a category that has many chips and one with few.
```
