# PubQuizPlanner — Design System

A design system for **PubQuizPlanner**, a tool for semi-professional quizmasters that turns a curated question database into a complete, ready-to-run quiz night: **presentation slides, printed answer sheets, and host cheat sheets.** One person can walk into any venue and deliver a night that looks produced, not improvised.

Visual direction: **"The Marquee"** — Warm Contemporary. Cozy and sociable like a good pub night, executed with the restraint and polish of a tool you'd trust with a paying gig. A warm off-white for the app and marketing; a deep warm near-black for the slides, where big stylized images glow on a projector. One burnt-amber accent carries across everything.

> **Sources.** This system was built from a structured brand discovery interview with the founder — no existing codebase, Figma file, or brand assets were provided. All tokens, components, and kits are original to that direction. **There is no logo file**; the brand is set in type as a wordmark (see `foundations/brand-wordmark.html`) until one is supplied.

---

## Positioning

PubQuizPlanner **runs the whole night**, not just the questions. Where the category is cluttered, cobbled-together and amateur, PubQuizPlanner is calm, polished and dependable. **Restraint is the product.** The brand is the stage and the frame: it makes the host and the questions look good, then gets out of the way — the quizmaster keeps their own branding on every slide.

- **Core user:** semi-pro quizmaster running nights across multiple venues.
- **Job to be done:** run the entire event — present a polished show, hand out clean sheets, keep host notes to the side.
- **Where the brand lives:** on a projector in a dark room, and on cheap paper under bad pub lighting. High contrast, big type, and a full black-and-white print mode are therefore requirements, not niceties.
- **Multilingual:** German, English, Dutch, Polish, Swedish. No English wordplay, no German-only references; leave room for German word length.

---

## Content fundamentals

**Voice:** plain, warm, direct, quietly confident. We talk to one person — "you" — and we never shout.

- **Casing:** sentence case for UI and body. Display headlines are sentence case too (not Title Case, not ALL CAPS). Mono eyebrows/kickers are the only ALL CAPS, used sparingly for structure ("ROUND 3", "HOW IT WORKS").
- **Person:** second person ("Build your first quiz", "Your notes stay on the side"). The product is "we" only when describing what it does for you ("We build the night").
- **No hype, no puns, no exclamation spam.** Puns and wordplay break across five languages — avoid them entirely. No "QUIZ TIME!!".
- **Emoji: never.** Not in product, not in marketing.
- **Numbers** (scores, question counts, timers, rounds) are set in the mono typeface for a tabular, "scoreboard" feel.

Examples (do): *"Run the whole quiz night. Not just the questions."* · *"Three steps from empty page to full night."* · *"Prints clean in black & white."*
See `foundations/brand-voice.html`.

---

## Visual foundations

- **Color.** Warm, tightly restrained. A brown-tinted neutral ramp (`--warm-50` paper → `--warm-900` ink) — never cold grey. A single burnt-amber accent (`--amber-500` #D96E2A) is the only brand color; it carries across light and dark. Slides use a deep warm near-black family (`--night-900`…`--night-600`). Semantic colors (muted warm green for correct, warm red for incorrect) are quiet and **never the only signal** — anything that must survive B/W print also uses text, weight, or an icon.
- **Two modes.** Light (app + marketing) is the `:root` default. Dark (slides + dark sections) is applied with `[data-theme="dark"]` on any ancestor, which re-points every semantic alias — components need no changes.
- **Typography.** Display: **Archivo** (800/700, tracking −0.02em) — confident, slightly condensed at heavy weights, German-friendly. Body/UI: **Hanken Grotesk** (400–700), a warm humanist grotesque. Data: **Spline Sans Mono** for numbers, scores, timers. All three carry full Latin-Extended coverage. *(Chosen from Google Fonts — see Caveats.)*
- **Spacing.** 4px base grid (`--space-1`…`--space-10`). Content max width 1200px; narrow column 760px.
- **Corners.** Gentle, ~3/10: `--radius-md` 8px (buttons/inputs), `--radius-lg` 12px (cards), `--radius-xl` 18px (image frames). Pills (`--radius-full`) only for tags/badges/avatars.
- **Backgrounds & imagery.** No decorative gradients as page backgrounds. Imagery is the star: **big, subtle, stylized/illustrative images own the slide**, unified into one family by the signature *image-frame treatment* — a consistent vignette (`--image-vignette`) + amber grade (`--image-grade`) + type lockup. This lets a generic "Sports" image and a specific "Cycling" image feel like the same system, and lets the library grow from generic categories to specific subtopics over time. When no image exists yet, a warm amber radial wash + icon watermark stands in and still looks intentional (see `CategoryTile`).
- **Quiz-card (question & answer slides).** Category art is atmosphere, not a backdrop for text — so on question and answer slides the art bleeds in from one side (a left-to-right dark veil keeps it deep and legible) and the content lives on a **warm quiz-card**: a `--warm-50` surface, `22px` radius, warm drop shadow, and a slight `-1.1deg` tilt so it reads like a physical card on the table. A chunky mono **number chip** (amber, with a pressed `box-shadow` lip) and a category **pill** head the card; the question is Archivo 800 in `--warm-900`; a mono **points chip** closes it. The answer reveal reuses the same card — question echoed small and muted, the answer in `--amber-700` behind a muted-green check. This warms the deck toward "game night" energy while keeping the palette, fonts and glow grown-up, and it gives the question one consistent, high-legibility home regardless of the artwork behind it. **Round-intro dividers stay full-art** (category name overlaid low); scoreboards stay tabular.
- **Shadows.** Warm-tinted (brown, not neutral black) and restrained. On light surfaces we lean on hairline borders (`--border-subtle`); shadow appears only when a surface is genuinely raised or lifted on hover. On dark/slides, depth comes from the amber glow and vignette, not drop shadows.
- **Motion.** Quiet. Fades and short slides, `--ease-out`, 120–340ms. No bounce, no infinite decorative loops.
- **Hover / press.** Buttons darken the fill (amber → `--amber-600`) and lift 1px; cards lift 2px with a larger shadow; tags/tabs shift color. Press states settle back with no shrink gimmick.
- **Transparency & blur.** Sparingly: a translucent blurred bar for the sticky marketing nav and the dialog scrim only.

---

## Iconography

- **System:** [Lucide](https://lucide.dev) — clean, consistent stroke icons that match the warm-but-modern tone. Loaded from CDN (`https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`); call `lucide.createIcons()` after render, and use `<i data-lucide="name"></i>`. This is a **substitution flag**: no icon assets were supplied, so Lucide is the recommended default — swap it if the brand adopts a bespoke set.
- **Usage:** icons are functional and quiet — 20–24px, `currentColor`, paired with labels. Category glyphs (trophy, music, film, globe…) double as image-frame fallback watermarks.
- **Emoji / unicode as icons:** never. The `×` on removable tags and the `▼` on selects are the only glyph exceptions.
- No hand-drawn or AI-generated SVG illustrations live in the system yet — imagery is expected to be dropped into the `CategoryTile` frame.

---

## Index / manifest

**Root**
- `styles.css` — global entry point (import this one file). `@import`s everything below.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `effects.css`.
- `readme.md` — this file. `SKILL.md` — Agent-Skill wrapper.

**Foundations** (`foundations/`) — specimen cards for the Design System tab: color (amber, neutrals, night, semantic), type (display, body, mono, scale), spacing (scale, radii, shadows), brand (wordmark, image frame, voice).

**Components** (`components/`) — reusable primitives. Read via `window.PubQuizPlannerDesignSystem_e327fe`.
- `core/` — **Button**, **IconButton**, **Badge**, **Tag**
- `forms/` — **Input**, **Textarea**, **Select**, **Checkbox**, **Radio**, **Switch**
- `surfaces/` — **Card**, **CategoryTile** *(the signature image frame)*
- `navigation/` — **Tabs**
- `feedback/` — **Dialog**

**UI kits** (`ui_kits/`)
- `marketing/` — homepage recreation (`index.html` + `Home.jsx`)
- `app/` — quiz-builder cockpit recreation (`index.html` + `App.jsx`)

**Slides** (`slides/`) — sample 1280×720 slides: title, round intro, question, answer reveal, scoreboard. Question and answer slides use the **quiz-card** treatment (warm card on the night backdrop, art bleeding in from the side); the round intro is a full-art divider.

**Print** (`print/`) — `answer-sheet.html`, the black-and-white printable answer sheet.

---

## Intentional additions

Since no source defined a component inventory, a standard set was authored, sized to the brand's needs. One brand-specific addition beyond the standard primitives:
- **CategoryTile** — the signature image-frame surface. Central to the product's imagery strategy (big subtle images owning a slide, unified across generic and specific categories), so it earns a first-class component.

---

## Caveats

- **Fonts are Google-hosted via `@import`** (Archivo, Hanken Grotesk, Spline Sans Mono). They render everywhere but are not self-hosted, so the compiler registers zero `@font-face` binaries. For offline/production reliability we should self-host the `.woff2` files — **tell me and I'll copy them in.**
- **No logo.** The wordmark is set in Archivo. Supply a logo file to replace it.
- **No real imagery.** Category tiles and slides use the warm amber fallback wash. Drop real stylized/illustrative images into `CategoryTile`'s `image` prop (and the slide `.img` layers) to see the frame treatment on photography/illustration.
