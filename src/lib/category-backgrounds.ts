// Registry of category background images for the HTML slide deck. Populated
// once ChatGPT-generated artwork exists — see SLIDE_DESIGN_PROMPTS.md. Empty
// for now: a category with no entry renders the current CSS-only look (solid
// --slide-bg), so this file ships before any images exist and nothing breaks.
//
// Path convention: an absolute path under /public (e.g. after adding
// public/category-backgrounds/sport.jpg, register `sport: '/category-backgrounds/sport.jpg'`).
// presentation-builder.ts prefixes it with the site's BASE_URL, because the
// generated slide deck is a standalone HTML file that may be opened offline /
// on another machine — it can't rely on a relative path resolving.
export const CATEGORY_BACKGROUNDS: Partial<Record<string, string>> = {};
