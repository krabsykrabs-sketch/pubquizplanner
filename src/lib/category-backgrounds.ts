// Registry of category background images for the HTML slide deck — see
// SLIDE_DESIGN_PROMPTS.md. A category with no entry renders the current
// CSS-only look (solid --slide-bg).
//
// Path convention: an absolute path under /public. presentation-builder.ts
// prefixes it with the site's BASE_URL, because the generated slide deck is a
// standalone HTML file that may be opened offline / on another machine — it
// can't rely on a relative path resolving.
export const CATEGORY_BACKGROUNDS: Partial<Record<string, string>> = {
  allgemeinwissen: '/category-backgrounds/allgemeinwissen.jpg',
  sport: '/category-backgrounds/sport.jpg',
  geographie: '/category-backgrounds/geographie.jpg',
  'film-tv': '/category-backgrounds/film-tv.jpg',
  musik: '/category-backgrounds/musik.jpg',
  wissenschaft: '/category-backgrounds/wissenschaft.jpg',
  'essen-trinken': '/category-backgrounds/essen-trinken.jpg',
  literatur: '/category-backgrounds/literatur.jpg',
  geschichte: '/category-backgrounds/geschichte.jpg',
  'kunst-kultur': '/category-backgrounds/kunst-kultur.jpg',
  technik: '/category-backgrounds/technik.jpg',
  popkultur: '/category-backgrounds/popkultur.jpg',
  sprache: '/category-backgrounds/sprache.jpg',
  'logik-mathe': '/category-backgrounds/logik-mathe.jpg',
};
