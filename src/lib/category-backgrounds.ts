// Registry of category background art for the HTML slide deck. A category
// with no entry (e.g. the synthetic "Gemischt" round) renders the plain night
// backdrop with the amber glow.
//
// The projector variants (brighter, hold up on washed-out beamers) of the
// brand's category illustrations in public/categories/<slug>/ are used.
// Composition rule: subject sits right-of-center on a night backdrop; the left
// stays clear, which is where the quiz-card / round lockup lives.
//
// Path convention: an absolute path under /public. presentation-builder.ts
// prefixes it with the site's BASE_URL, because the generated slide deck is a
// standalone HTML file that may be opened offline / on another machine — it
// can't rely on a relative path resolving.
export const CATEGORY_BACKGROUNDS: Partial<Record<string, string>> = {
  allgemeinwissen: '/categories/allgemeinwissen/projector.png',
  sport: '/categories/sport/projector.png',
  geographie: '/categories/geographie/projector.png',
  'film-tv': '/categories/film-tv/projector.png',
  musik: '/categories/musik/projector.png',
  wissenschaft: '/categories/wissenschaft/projector.png',
  'essen-trinken': '/categories/essen-trinken/projector.png',
  literatur: '/categories/literatur/projector.png',
  geschichte: '/categories/geschichte/projector.png',
  'kunst-kultur': '/categories/kunst-kultur/projector.png',
  technik: '/categories/technik/projector.png',
  popkultur: '/categories/popkultur/projector.png',
  sprache: '/categories/sprache/projector.png',
  'logik-mathe': '/categories/logik-mathe/projector.png',
};
