# Handoff: PubQuizPlanner Marketing Homepage

## Overview
The public marketing homepage for **PubQuizPlanner** — a tool for semi-professional quizmasters that turns a curated question database into a complete quiz night (presentation slides, printed answer sheets, host cheat sheet). The page's job: communicate the "run the whole night, not just the questions" promise, show the category library, give a taste of real questions, and drive two CTAs (instant quiz / build your own). Copy is German (the product is multilingual: DE, EN, NL, PL, SV).

## About the Design Files
The files in this bundle are **design references created in HTML** — an interactive prototype showing the intended look, copy, and behavior. **They are not production code to ship directly.** The task is to **recreate this design in your real codebase**, using its established framework, component patterns, and conventions (React, Vue, Svelte, Astro, plain templates, etc.). If no frontend environment exists yet, pick the most appropriate framework and implement there.

`Homepage.dc.html` is a "Design Component" — an authoring format for the design tool. Do not port that wrapper or its runtime (`support.js`, `<x-dc>`, `<x-import>`). Read it as a spec for markup structure, styling, and interaction; rebuild with your own components.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, imagery, copy, and interactions. Recreate the UI to match, using the design-system tokens (see `design-system/tokens/`) rather than hardcoding values. Every color/spacing/type value below is a CSS custom property that already exists in `design-system/styles.css`.

## Design System (already exists — use it, don't reinvent)
The full PubQuizPlanner design system is included at `design-system/`:
- `styles.css` — single import; pulls in all tokens + component base styles.
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `effects.css`, `fonts.css`.
- Components (React source in the original DS repo; here as a compiled reference bundle `_ds_bundle.js`): **Button, IconButton, Badge, Tag, Card, CategoryTile, Dialog, Input, Textarea, Select, Checkbox, Radio, Switch, Tabs.** Rebuild these as native components in your codebase; the reference shows their props and behavior.
- Fonts: **Archivo** (display), **Hanken Grotesk** (body/UI), **Spline Sans Mono** (numbers/data) — Google Fonts. Icons: **Lucide** (`<i data-lucide="name">`).

## Category data — single source of truth
`data/categories.js` defines the **14 fixed quiz subjects** (slug, German label, Lucide fallback glyph, and `present` flags for which art assets exist). Load it and read `window.PQP_CATEGORIES` / `window.PQP_category`. The homepage builds all category UI from this list — port the same pattern (a typed constant/config in your codebase).

Art lives in `assets/categories/<slug>/`:
- `background.png` — app/marketing composition (used by the homepage tiles).
- `projector.png` — brighter variant for projected slides (used by the demo slide).
- `icon.svg` — standalone subject illustration.
Composition rule: subject sits **right-of-center** on a night backdrop with a warm glow; the **left is intentionally clear** for text/lockups. Not every subject has every asset yet — fall back to the Lucide glyph watermark when `present.background` is false (this is what `CategoryTile` does).

## Screens / Views
Single scrolling page, max content width **1200px** (`--container`), 24px side padding. Sections in order:

### 1. Header (sticky)
- Height 70px, `position: sticky; top: 0`, translucent warm-white background `rgba(251,247,240,0.82)` + `backdrop-filter: blur(12px)`, 1px `--border-subtle` bottom.
- Left: wordmark — amber "?" roundel SVG (30px) + "PubQuizPlanner" in Archivo 800, `--text-strong`, letter-spacing −0.03em, 1.28rem.
- Right (nav, hidden < 860px behind a hamburger): text links "So funktioniert's", "Kategorien", "Fragen" (`--text-muted`, 0.9375rem, weight 500); a language pill ("DE" with globe + chevron, 1.5px `--border-strong`); a small primary Button "Quiz erstellen".

### 2. Hero (dark)
- `data-theme="dark"`, background `--night-900`, ~92px vertical padding. Amber radial glow top-right: `radial-gradient(78% 88% at 82% 8%, rgba(217,110,42,0.28), transparent 58%)`. Subtle decorative "string lights" SVG across the top at opacity ~0.09.
- Two-column grid `1.05fr 0.95fr`, 56px gap, collapses to one column < 860px.
- **Left:** accent Badge "Kostenlos in der Beta" → H1 (Archivo 800, `--text-4xl` fluid clamp, line-height 1.02, tracking −0.03em, white): "Der ganze Quizabend. / Nicht nur die Fragen." → lead paragraph (1.1875rem, `--text-body`, max 47ch) → two Buttons: primary lg "Sofort-Quiz starten" (dice icon), secondary lg "Selbst zusammenstellen" (sliders icon) → a one-line reassurance with amber zap icon → a row of the 4 language names in mono `--text-faint`.
- **Right:** 2×2 grid of `CategoryTile` (ratio 1/1, 16px gap), alternating tiles offset 28px down (masonry feel). Tiles: Kunst & Kultur (Runde 1), Essen & Trinken (Runde 2), Logik & Mathe (Runde 3), Geschichte (Runde 4) — all four use their `background.png`. Toggleable via the `showHeroImage` flag.

### 3. Demo (light, centered)
- ~92px padding, `--bg-page`. Accent Badge "Live-Demo" → H2 (Archivo 800, `--text-2xl`) "Sieh dir einen fertigen Abend an." → paragraph (`--text-muted`, max 52ch).
- A clickable 16:9 slide preview (max-width 880px, `--radius-xl`, `--shadow-lg`, 1px border) that opens the demo Dialog. It reproduces a real **question slide** using the design system's **quiz-card** treatment: dark `--night-800`, `assets/categories/kunst-kultur/projector.png` bled in from the right, under a left-heavy veil `linear-gradient(90deg, rgba(22,17,13,0.92) 42%, rgba(22,17,13,0.30) 72%, transparent 100%)` that keeps the card side deep.
  - A warm **quiz-card** (`--warm-50`, 22px radius, tilted −1.1deg, deep warm shadow) sits over the clear left side. Head row: amber mono **number chip** "07" (`--amber-500`, `box-shadow: 0 4px 0 --amber-700` pressed lip, 14px radius) + category **pill** "Kunst & Kultur" (mono uppercase 0.14em, `--amber-700` on `#F7E4D2`, pill radius) + right-aligned mono progress "Frage 7 / 20" (`--warm-500`).
  - Question: Archivo 800, `--warm-900`, "Wer malte 1889 das Gemälde „Sternennacht"?"
  - Points chip: mono, `--warm-100` fill, 1.5px `--warm-200` border, "10 Punkte" (`--amber-700`).
  - **No answer on this slide.** A play button (amber circle, white play icon) sits top-right.
- Below: secondary md Button "Demo abspielen".

**Quiz flow (important):** answers are **never** shown on the question slide, nor immediately after it. Players see all questions in a round first; the **answers are revealed together at the end** as their own answer round (then a scoreboard). The question slide and the answer-reveal slide are two distinct slide types — see the Demo Dialog and the design system's `slides/question-slide.html` + `slides/answer-slide.html`.

### 4. Kategorien (sunken)
- `--bg-sunken`, hairline borders top/bottom. Mono kicker "KATEGORIEN".
- H2 (Archivo 800, `--text-2xl`) "Über 1.600 geprüfte Fragen. In 14 Kategorien." — the two numbers set in mono `--accent-text`. Paragraph about starting generic and deepening into subtopics.
- A wrap row of `Tag` chips — **one per category, in `data/categories.js` order**; selecting one sets the active category (highlights the matching chip/tile).
- A 3-col grid (`--cat-tiles`, → 2-col < 860px, 1-col < 480px) of 6 featured `CategoryTile` (ratio 4/3) — the six subjects that ship with `background.png`: Allgemeinwissen, Geschichte, Essen & Trinken, Kunst & Kultur, Technik, Logik & Mathe. Each shows title + question count subtitle.
- "Alle Fragen ansehen →" link.

### 5. Kostprobe (light)
- `--bg-page`. Mono kicker "KOSTPROBE" + H3 "Drei Fragen aus der Datenbank." Right-aligned note "Bei jedem Besuch neu gemischt" (shuffle icon).
- 3-col grid of raised `Card`s, each tilted ±1° for a "physical card" feel. Card = category icon chip (`--accent-soft` bg, `--accent-text`) + mono category label; question in Archivo 700 1.24rem `--text-strong`; footer row (1px top border) with a small circular **answer coaster** (amber ring, dashed inner, short answer in `--amber-700`) + a "Fun Fact" note.
- Sample content used: Musik/Queen, Wissenschaft & Natur/Die Haut, Film & TV/Berlin.

### 6. CTA band (dark)
- `--night-800`, amber radial glow from top. Centered H2 (`--text-3xl`, white) "Dein nächster Quizabend ist 10 Minuten entfernt." + paragraph + two Buttons (primary "Sofort-Quiz starten", secondary "Selbst zusammenstellen").

### 7. Footer (dark)
- `--night-900`. Wordmark + one-line description (max 30ch) on the left; link column (Fragen, Impressum, Datenschutz, Credits) on the right. Bottom bar (1px `--night-600` top): copyright "© 2026 PubQuizPlanner · Ein Abend, professionell gemacht." + mono language list.

### Demo Dialog (modal)
- Opens from the demo preview / "Demo abspielen". Width 840. Header: "Demo-Quiz" (Archivo 800) + accent Badge "Live" + close (×) button. Body: the **answer-reveal slide** (the answer round), matching `slides/answer-slide.html`. Same quiz-card, but: the number chip is neutral (`--warm-400`), the question is echoed **small and muted** (`--warm-600`), a mono kicker "Auflösung · die Antwort lautet" sits above the answer, and the answer "Van Gogh" is shown in Archivo 800 `--amber-700` behind a muted-green (`--green-500`) check. Prev/next nav circles top-right. Footer note makes explicit that answers come gathered at the end of each round, followed by the scoreboard.

## Interactions & Behavior
- **Category selection:** clicking any `Tag` chip or featured `CategoryTile` sets `activeCat` (state); the matching chip/tile shows a selected state (2.5px `--accent` ring on tiles; color shift on tags). Default active: "Kunst & Kultur".
- **Demo modal:** preview / button opens Dialog; close via × or backdrop.
- **Empty-data state:** a `dataState` flag (`populated` | `empty`) switches Kategorien, Kostprobe, and Demo into graceful empty placeholders (dashed-border cards) — implement equivalents for pre-launch / no-data.
- **Hero tiles toggle:** `showHeroImage` flag shows/hides the hero tile grid.
- **Hover:** Buttons darken amber fill and lift 1px; Cards lift 2px with larger shadow; CategoryTiles lift 3px and the image scales 1.04; Tags shift color.
- **Motion:** fades / short slides, `--ease-out`, 120–340ms. No bounce, no infinite loops.
- **Responsive:** section padding 92px → 60px < 860px; hero grid → 1 col; 3-col grids → 1 col; category tiles 3 → 2 → 1 col; nav links → hamburger < 860px.

## State Management
- `activeCat: string` — currently selected category label (default "Kunst & Kultur").
- `demoOpen: boolean` — demo Dialog visibility.
- `dataState: 'populated' | 'empty'` — real vs. empty-data rendering.
- `showHeroImage: boolean` — hero tile grid visibility.
- Category list + counts derive from `data/categories.js` (`window.PQP_CATEGORIES`). Question counts are a fictional per-slug map in the prototype — replace with real counts from your backend. Sample questions ("Kostprobe") should be fetched/randomized server-side in production.

## Design Tokens
All defined in `design-system/tokens/`. Key values:
- **Amber accent:** `--amber-300 #F0A867`, `--amber-400 #E88A45`, `--amber-500 #D96E2A` (primary), `--amber-600 #BE5A1C` (hover), `--amber-700 #984515`.
- **Warm neutrals:** `--warm-50 #FBF7F0` (paper) … `--warm-900 #1B1611` (ink); full ramp in `colors.css`.
- **Night (dark/slides):** `--night-900 #16110D`, `--night-800 #1D1712`, `--night-700 #261E17`, `--night-600 #33291F`.
- **Semantic (muted, warm; never the only signal):** correct `--green-500 #5B7F4E`; incorrect `--red-500 #C24A2E`.
- **Light aliases:** `--bg-page`=warm-50, `--bg-sunken`=warm-100, `--surface-card`=#FFF, `--text-strong`=warm-900, `--text-body`=warm-800, `--text-muted`=warm-600, `--border-subtle`=warm-200, `--accent-soft #F7E4D2`, `--accent-text`=amber-700. Dark theme re-points all aliases via `[data-theme="dark"]`.
- **Type:** display Archivo (700/800, tracking −0.02em), body Hanken Grotesk (400–700), mono Spline Sans Mono. Scale: `--text-base 1rem` … `--text-2xl 2.25rem`, `--text-3xl clamp(2.5rem,4vw+1rem,3.5rem)`, `--text-4xl clamp(3rem,6vw+1rem,4.75rem)`.
- **Radii:** `--radius-md 8px` (buttons/inputs), `--radius-lg 12px` (cards), `--radius-xl 18px` (image frames), `--radius-full` (tags/badges/coasters).
- **Spacing:** 4px base grid (`--space-1`…`--space-10`). `--container 1200px`.
- **Shadows:** warm-tinted (brown, not black), restrained — `--shadow-sm/lg/xl` in `effects.css`. On light surfaces prefer hairline borders; shadow only on genuinely raised/hover elements.
- **Motion:** `--dur`, `--dur-slow`, `--ease-out` in `effects.css`.

## Assets
- `assets/categories/<slug>/` — category art. **All 14 subjects now ship `background.png` + `projector.png` + `icon.svg`** in the flat orange-on-night illustration family. `background.png`/`projector.png` are the wide (1820×1024) atmospheric compositions used by the marketing/featured tiles; `icon.svg` is the square, self-contained subject illustration (subject centered on night, with glow) — used for the square hero tiles and available for pickers/small motifs. The Lucide glyph in `data/categories.js` remains as a last-resort fallback.
- `assets/marketing/` — the three "How it works" step illustrations (`step-choose.svg` = pick rounds, `step-build.svg` = build the night, `step-present.svg` = present), shown on a `--night-900` chip in each step card.
- Wordmark: inline SVG (amber "?" roundel) — **no logo file exists yet**; brand is set in type until one is supplied.
- Icons: Lucide (CDN), `currentColor`, 20–24px, always paired with labels.

## Files
- `Homepage.dc.html` — the design reference (structure, inline styles, interaction logic). Read, don't ship.
- `data/categories.js` — category source of truth.
- `assets/` — imagery.
- `design-system/` — tokens (`tokens/*.css`), `styles.css`, component reference bundle, readme.

## Notes for implementation
- Load `design-system/styles.css` (or port its tokens into your system) and build native Button/Card/Tag/CategoryTile/Dialog components matching the reference's props and states — do not restyle raw HTML to fake them.
- Keep the brand rule: **one amber accent**, warm neutrals (never cold grey), sentence-case copy, mono for all numbers, no emoji, no puns (must survive 5 languages), leave room for German word length.
- Wire real data for category counts and sample questions; keep the empty-data states.
