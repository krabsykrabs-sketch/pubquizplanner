// Registry of category art for the HTML slide deck. A category with no entry
// (e.g. the synthetic "Gemischt" round) renders the plain navy backdrop.
//
// The deck uses the square, transparent subject illustration
// (public/categories/<slug>/icon.svg) and composes it in CSS: subject
// right-of-center on the navy slide with a soft glow behind it, the left kept
// clear for the quiz-card / round lockup. See renderCategoryBackgroundCss in
// presentation-builder.ts.
//
// Path convention: an absolute path under /public. presentation-builder.ts
// prefixes it with the site's BASE_URL, because the generated slide deck is a
// standalone HTML file that may be opened offline / on another machine — it
// can't rely on a relative path resolving.
//
// NB: public/categories/<slug>/projector.png and background.png are the
// previous design's pre-composed dark backgrounds. Nothing in the app uses
// them any more, but decks downloaded before the redesign still load
// projector.png from the live site — do not delete those files.
import { CATEGORY_SLUGS, categoryVisual } from './category-visuals';

export const CATEGORY_BACKGROUNDS: Partial<Record<string, string>> = Object.fromEntries(
  CATEGORY_SLUGS.map((slug) => [slug, categoryVisual(slug)?.iconArt]).filter(
    (entry): entry is [string, string] => Boolean(entry[1])
  )
);
