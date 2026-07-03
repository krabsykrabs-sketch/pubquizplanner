# Landing page background art — ChatGPT image prompt

**Task 5, revised.** The landing page's typography, layout, and colour are handled
directly in code (the components in `src/components/landing/`) — no JSX handoff
needed. The one thing ChatGPT is good for that isn't: **one atmospheric background
image for the hero section.**

## What you're generating

**One background image**, same visual family as the slide-deck art (see
`SLIDE_DESIGN_PROMPTS.md` if you're doing both — reuse the same style so the site
feels consistent). It sits behind the hero section only; the rest of the page (category
chips, sample questions, how-it-works) stays the current card-based look. I already
apply a dark overlay in code, so the image doesn't need to guarantee text contrast.

## Prompt

```
I need one background image for the hero section of a German pub quiz web app
landing page (pubquizplanner.com) — dark theme, gold accent, premium and uncluttered.

Style: abstract and atmospheric — NOT literal illustration, NOT photography of real
people, NOT any readable text, logos, or watermarks baked in. Think a moody
gradient/light/texture backdrop, predominantly dark (near-black to deep tones) with
a warm gold/amber glow somewhere in the frame — the kind of quiet, confident
background you'd put a bold headline over, not a busy scene.

Landscape orientation, as wide as your tool allows (ideally a wide banner-like
aspect ratio, but 16:9 or even square is fine — I'll crop/cover it). No text, no
letters, no UI elements, no people, no logos anywhere in the image.
```

## After generating

Save it as `hero-background.jpg` and send it to me (or drop it in `public/` yourself).
I'll set `HERO_BACKGROUND_IMAGE` in `src/config/hero-background.ts` — the only code
change needed; the overlay/legibility CSS is already built. Until then the hero
keeps its current plain look.
