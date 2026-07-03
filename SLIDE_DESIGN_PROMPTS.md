# Slide design — ChatGPT handoff prompts

**Task 4, stage 1.** The slide generator now has a theming layer
(`src/lib/slide-theme.ts`): all visual choices are design tokens injected as CSS
custom properties, and the markup/layout in `presentation-builder.ts` never
hardcodes a colour or font again. So a returned design is applied by **editing the
token values** in `defaultSlideTheme` (or adding a new `SlideTheme` and passing it
to `buildPresentation`). Nothing about the generation logic changes.

Below are ready-to-paste prompts for ChatGPT. Prompt 1 is the master brief; 2–4
drill into specific slide groups; 5 converts any returned design into our token
block. Paste the **shared context** first (or paste it inline — each prompt
assumes it).

---

## Shared context (paste this once, or prepend to any prompt)

```
I run a German-language pub quiz generator (pubquizplanner.com). It outputs a
self-contained HTML slide deck a quizmaster projects on a screen/beamer in a pub.
I need a polished visual design for these slides. Hard constraints:

- OUTPUT MEDIUM: a single self-contained HTML file, rendered full-screen at
  1920×1080 (16:9), one slide visible at a time. It must work OFFLINE once opened.
  The ONLY allowed remote resource is one Google Fonts @import; everything else
  (no external images, no JS libraries, no CDN CSS) must be inline CSS. No licensed
  or stock imagery — decoration must be pure CSS (gradients, shapes, typography,
  Unicode/emoji).
- VIEWING CONDITIONS: projected in a dim, sometimes noisy pub, read from up to
  ~15 m away. Maximum legibility: large type, high contrast, generous spacing.
  Assume mediocre projector colour and contrast — avoid subtle low-contrast greys
  for anything that must be read.
- LANGUAGE: German text (long compound words happen; ß, ä, ö, ü must render). The
  same deck is also generated in Dutch, so the design must be language-neutral.
- CONTENT IS VARIABLE LENGTH: question text ranges from ~15 to ~220 characters;
  answers ~1 to ~60 characters; a "fun fact" box up to ~240 characters. The layout
  must stay balanced whether the text is short or long — never overflow, never
  require scrolling. Do not assume a fixed text length.
- TONE: clever, warm, a bit premium — the differentiator is that we look cleaner
  and more designed than typical cluttered quiz-night slides. Not corporate, not
  childish.
- CATEGORIES (each round has one): Allgemeinwissen, Sport, Geschichte, Geographie,
  Film & TV, Musik, Wissenschaft, Essen & Trinken, Literatur, Kunst & Kultur,
  Technik, Popkultur, Sprache, Logik & Mathe. Each has an emoji icon already. The
  design must feel right across all of them (don't theme it to one topic).

SLIDE TYPES the deck contains (design ALL of them as a coherent system):
1. Title slide — quiz title, optional date + venue, a "good luck" subtitle, a faint
   keyboard-hint line.
2. Round-title slide — "RUNDE 3", a big category emoji, the category name, and a
   "N Fragen" line.
3. Question slide — a small meta line (round · question number) and the question
   text, centred. (Occasionally a pill badge for "estimation" questions.)
4. Answer slide — meta line, the question repeated small, the answer BIG and in a
   distinct "correct" colour, and an optional fun-fact panel.
5. Halftime slide — a 🍺 icon, "Halbzeit!", a short subline.
6. Section-title slide — e.g. "Auflösung" with a subline (used before the answers).
7. Final slide — 🏆, a closing headline, a subline, faint branding.

There is also chrome shared across slides: a bottom progress bar, a slide counter
(bottom-right), and a large countdown timer (top-right) that turns a warning colour
in its last 5 seconds.
```

---

## Prompt 1 — Master brief (full slide system + our token set)

```
[Paste the shared context above first.]

Design a complete, coherent visual system for this slide deck. Deliver:

1. A short design rationale (2–3 sentences): the mood, and why it fits a premium
   pub quiz projected in a dim room.
2. A colour palette and typography choice expressed EXACTLY as this token set (give
   me concrete values for every token — I paste them straight into my code):

   - fontImportUrl: one Google Fonts CSS2 URL bundling all weights you use
   - fontDisplay: font-family for headings (with a generic fallback)
   - fontBody: font-family for body copy
   - fontMono: font-family for meta/counter/timer
   - colorBg: slide background
   - colorText: primary text
   - colorMuted: secondary text
   - colorSubtle: tertiary text (italic subtitle)
   - colorFaint: faintest text (hints, counter)
   - colorAccent: primary brand accent
   - colorAccentLight: accent highlight (used as a gradient end)
   - colorCorrect: the revealed-answer colour (must read as "correct/positive")
   - colorWarning: timer-running-out colour
   - colorPanelText: text inside the fun-fact / badge panel
   - colorPanelBg: panel background (should be an accent-tinted translucent colour)
   - colorPanelBorder: panel border (accent-tinted translucent)

   Every colour pair that sits together must meet WCAG AA for large text at
   projector-quality contrast. Note any pair that's borderline.

3. A single self-contained HTML file that renders ALL seven slide types plus the
   progress bar / counter / timer chrome, using CSS custom properties named exactly
   --slide-bg, --slide-text, --slide-muted, --slide-subtle, --slide-faint,
   --slide-accent, --slide-accent-light, --slide-correct, --slide-warning,
   --slide-panel-text, --slide-panel-bg, --slide-panel-border, --slide-font-display,
   --slide-font-body, --slide-font-mono — so it maps 1:1 to my token set. Fill each
   slide with realistic long-and-short German placeholder text so I can see how the
   layout copes with both. Decoration must be pure CSS (no images).

Keep the markup class names generic (title-slide, round-title-slide, question-slide,
answer-slide, halftime-slide, section-title-slide, final-slide, plus #progress,
#counter, #timer) so I can lift the styling directly.
```

---

## Prompt 2 — Question & answer slides (the 80% case)

```
[Paste the shared context first.]

Focus only on the two slides shown most of the night: the QUESTION slide and the
ANSWER slide. These make or break readability. Give me 2 distinct treatments, each
as a self-contained HTML+CSS snippet using the CSS-variable names from my token set
(--slide-accent, --slide-correct, --slide-panel-bg, etc.).

For each treatment show the question slide with THREE question lengths (very short,
medium, and a ~220-character monster) so I can see the type scaling / balance
strategy. Then show the matching answer slide with the answer large and unmistakably
"correct", the question repeated small above it, and the fun-fact panel present.
Tell me the exact font-size strategy (fixed vs. clamp/viewport-based) you'd use so
long questions never overflow and short ones never look lost. Prioritise legibility
from across a room over cleverness.
```

---

## Prompt 3 — Title, round-title, section & final slides (the "moments")

```
[Paste the shared context first.]

Design the punctuation slides that set the atmosphere: the TITLE slide, the
ROUND-TITLE slide (big category emoji + name + "N Fragen"), the SECTION-TITLE slide
("Auflösung"), the HALFTIME slide (🍺), and the FINAL slide (🏆). These should feel
like a title sequence — a notch more dramatic than the question slides, but from the
same visual family (same palette/type tokens).

Deliver one self-contained HTML file showing all five, using my CSS-variable token
names. Show the round-title slide with two different category emojis (e.g. 🎬 and 🔬)
to prove it feels right regardless of topic. Suggest ONE tasteful motion idea per
slide type that is achievable with pure CSS animation (no JS), degrades gracefully,
and won't distract from reading — describe it in a comment; keep it optional.
```

---

## Prompt 4 — Three alternative directions to choose from

```
[Paste the shared context first.]

Propose THREE distinctly different design directions for this deck, so I can pick
one. For example (feel free to replace with better ideas): (A) "Elegant pub" —
warm, editorial, serif-led, candlelit; (B) "Retro game-show" — bold, high-energy,
saturated, chunky display type; (C) "Modern minimal" — restrained, lots of negative
space, one confident accent. For EACH direction give me: a one-line rationale, the
full token set (all the colour + font tokens listed in Prompt 1 with concrete
values), and ONE rendered example slide (the answer slide, as self-contained
HTML+CSS using my --slide-* variable names) so I can compare them side by side.
Make the three genuinely different in mood, not palette swaps of one idea.
```

---

## Prompt 5 — Convert a design you already like into our tokens

```
I have a slide design (pasted below / attached as an image). Convert it into this
exact token set so I can drop it into my generator. Output ONLY a JSON-like block
with concrete values for: fontImportUrl, fontDisplay, fontBody, fontMono, colorBg,
colorText, colorMuted, colorSubtle, colorFaint, colorAccent, colorAccentLight,
colorCorrect, colorWarning, colorPanelText, colorPanelBg, colorPanelBorder.

Rules: fontImportUrl must be a single valid Google Fonts CSS2 URL bundling every
weight the fonts use. colorPanelBg/colorPanelBorder should be accent-tinted
translucent rgba() values. Flag any text/background pair that fails WCAG AA for
large text. If the design relies on a font that isn't on Google Fonts, substitute
the closest Google Fonts alternative and say so.

[paste design / attach screenshot here]
```

---

## Applying a returned design

1. Open `src/lib/slide-theme.ts`.
2. Paste the returned token values into `defaultSlideTheme` (to replace the current
   look) **or** add a second `export const funTheme: SlideTheme = { … }` and pass it
   to `buildPresentation(quiz, funTheme)` if you want to A/B it.
3. If the design supplied custom slide CSS/markup beyond palette+type (e.g. new
   layout, a CSS animation), fold that into `presentation-builder.ts` — the class
   names in the prompts match the ones there.
4. `npx tsc --noEmit`, generate a deck from the app, eyeball all slide types with a
   short AND a very long question.
```
