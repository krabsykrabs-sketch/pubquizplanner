# Slide background art — ChatGPT image prompts

**Task 4, revised.** Typography, colour, and layout for the slide deck are handled
directly in code (`src/lib/slide-theme.ts` for tokens, `src/lib/presentation-builder.ts`
for markup/CSS) — no handoff needed for those. The one thing ChatGPT is good for that
isn't: **background artwork**. This doc is only about generating that art.

## What you're generating

**One abstract background image per category — 14 total.** They render behind the
round-title, question, and answer slides for that category (the title, halftime,
section-title, and final slides stay a plain CSS look — no image). I already apply a
dark overlay in code (`linear-gradient(rgba(6,6,10,0.72), rgba(6,6,10,0.72))` over the
image) so **text legibility is handled for you** — the images don't need to guarantee
contrast themselves, keep them however moody/rich you like.

## Shared style guide (paste once, then reuse for every image)

```
I need a set of 14 background images for a German pub quiz slide deck (dark theme,
gold accent, projected on a screen in a pub). Style: abstract and atmospheric — NOT
literal illustration, NOT photography of real people, NOT any readable text, logos,
or watermarks baked in. Think moody gradient/texture/light art: the kind of abstract
background you'd see behind a title card, not a scene with recognisable objects.

Requirements for every image in the set:
- Landscape orientation, as wide as your tool allows (16:9 ideal; square is fine too,
  I'll crop it — just avoid portrait).
- Predominantly DARK (near-black to deep tones) with a warm gold/amber accent glow
  somewhere in the frame, consistent with a premium, moody "pub at night" feel. A
  hint of the category's own colour is welcome, but keep an overall dark family so
  the whole set of 14 reads as one coherent deck, not 14 random palettes.
- No text, no letters, no numbers, no UI elements, no logos anywhere in the image.
- No real/recognisable faces or people.
- Fully abstract or semi-abstract only — evoke the category through colour, texture,
  and motion, not literal objects (a "Sport" image should NOT be a photo of a
  football; think energy/motion streaks instead).

I'll generate these one at a time. For each, keep the exact same rendering style,
technique, and colour family as the previous ones in this set — I'll say "same style,
now for [category]" each time.
```

## The 14 categories (with a motif seed — steer, don't dictate)

Paste one line at a time after the style guide (first one includes the full guide
above; the rest can just say "Same style as before, now for **[Category]**: [motif]"):

1. **Allgemeinwissen** (general knowledge) — abstract starfield / constellation, a
   sense of "everything connected"
2. **Sport** — streaks of motion and energy, warm dynamic light trails
3. **Geschichte** (history) — weathered, aged abstract texture — think worn stone,
   old parchment grain, sepia-tinted depth
4. **Geographie** (geography) — abstract topographic contour lines / map-like
   flowing linework
5. **Film & TV** — cinematic light leaks, soft spotlight glow, subtle film grain
6. **Musik** (music) — abstract soundwave / frequency ribbons flowing across the
   frame
7. **Wissenschaft & Natur** (science & nature) — abstract molecular / particle /
   nebula texture, a sense of scale and structure
8. **Essen & Trinken** (food & drink) — warm bokeh, soft glowing blur like candlelight
   or steam
9. **Literatur** (literature) — abstract flowing ink or paper-grain texture
10. **Kunst & Kultur** (art & culture) — abstract brushstroke / paint-texture
    movement
11. **Technik** (technology) — abstract geometric line-work with a subtle circuit /
    glow feel, restrained not "sci-fi neon"
12. **Popkultur** (pop culture) — abstract glow bursts, a little more vibrant/playful
    energy than the rest, still dark-based
13. **Sprache & Wörter** (language & words) — abstract flowing calligraphic swirl
    motion — **no actual letters or readable characters**, purely the gesture of
    handwriting
14. **Logik & Mathe** (logic & maths) — abstract geometric grid / fractal pattern,
    precise and structured

## After generating

Save each image as `<category-slug>.jpg` using these exact slugs (they must match
the DB): `allgemeinwissen`, `sport`, `geschichte`, `geographie`, `film-tv`, `musik`,
`wissenschaft`, `essen-trinken`, `literatur`, `kunst-kultur`, `technik`, `popkultur`,
`sprache`, `logik-mathe`.

Send me the 14 files (or drop them in `public/category-backgrounds/` yourself) and
I'll register each one in `src/lib/category-backgrounds.ts` — that's the only code
change needed; the CSS/overlay/legibility handling is already built and won't need
touching. You don't have to send all 14 at once — I can wire them in as they're
ready, and a category with no image yet just keeps the current plain look.
