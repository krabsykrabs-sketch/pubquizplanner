import {
  Beer,
  BookOpen,
  Brain,
  Calculator,
  Clapperboard,
  Cpu,
  Dices,
  Globe,
  Landmark,
  Languages,
  Microscope,
  Music,
  Palette,
  Star,
  TreePine,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

/* Category visuals — single source of truth for the quiz subjects' art.
 * Art lives in public/categories/<slug>/ :
 *   icon.svg       — square standalone subject illustration on a transparent
 *                    ground; the art used across the site, set on a tinted
 *                    panel (see categoryLook)
 *   projector.png / background.png — the previous design's pre-composed dark
 *                    backgrounds. Unused by the app now, but decks downloaded
 *                    before the redesign still load projector.png from the
 *                    live site, so the files stay.
 * Slugs match the DB `categories.slug` column.
 */

export interface CategoryVisual {
  /** Lucide glyph — functional icon + last-resort fallback for missing art. */
  icon: LucideIcon;
  /** Square subject illustration with a transparent ground. */
  iconArt: string;
}

const ICONS: Record<string, LucideIcon> = {
  allgemeinwissen: Brain,
  sport: Trophy,
  geschichte: Landmark,
  geographie: Globe,
  'film-tv': Clapperboard,
  musik: Music,
  wissenschaft: Microscope,
  'essen-trinken': Beer,
  literatur: BookOpen,
  'kunst-kultur': Palette,
  technik: Cpu,
  popkultur: Star,
  sprache: Languages,
  'logik-mathe': Calculator,
  // Seasonal category (Nov 2026).
  weihnachten: TreePine,
};

// Slugs registered here without an icon.svg in public/categories/<slug>/. They
// fall back to CategoryTile's large Lucide glyph on the category tint instead
// of pointing at a file that doesn't exist. Add a new category here until its
// illustration is drawn.
const NO_ART = new Set<string>([]);

export const CATEGORY_SLUGS = Object.keys(ICONS);

/** Icon for the synthetic "Gemischt" (mixed) category, id -1. */
export const MixedCategoryIcon = Dices;

export function categoryVisual(slug: string): CategoryVisual | null {
  const icon = ICONS[slug];
  if (!icon || NO_ART.has(slug)) return null;
  const dir = `/categories/${slug}`;
  return {
    icon,
    iconArt: `${dir}/icon.svg`,
  };
}

/** Lucide glyph for a category slug; Dices for the mixed pseudo-category / unknowns. */
export function categoryIcon(slug: string | null | undefined): LucideIcon {
  return (slug && ICONS[slug]) || Dices;
}

/* The tinted panel a category's art sits on. Tints rotate through the marker
 * colours in registry order, so neighbouring tiles differ and a category keeps
 * its colour everywhere. Seasonal categories can override with a full CSS
 * background (and `onDark` when the glyph has to turn light). */
export interface CategoryLook {
  /** Any CSS `background` value. */
  tint: string;
  onDark: boolean;
}

const TINTS = [
  'var(--yellow-soft)',
  'var(--blue-soft)',
  'var(--green-soft)',
  'var(--pink-soft)',
  'var(--peach-soft)',
];

const dot = (x: number, y: number, color: string, r = 3) =>
  `radial-gradient(circle at ${x}% ${y}%, ${color} 0 ${r}px, transparent ${r + 1}px)`;

const LOOK_OVERRIDES: Record<string, CategoryLook> = {
  // Pine green with a scatter of lights.
  weihnachten: {
    tint: [
      dot(18, 24, 'var(--yellow)'),
      dot(80, 18, '#fff', 2),
      dot(86, 62, 'var(--yellow)'),
      dot(12, 74, '#fff', 2),
      dot(62, 86, 'var(--amber-500)'),
      'var(--pine)',
    ].join(', '),
    onDark: true,
  },
};

export function categoryLook(slug: string | null | undefined): CategoryLook {
  if (slug && LOOK_OVERRIDES[slug]) return LOOK_OVERRIDES[slug];
  const i = slug ? CATEGORY_SLUGS.indexOf(slug) : -1;
  return { tint: TINTS[(i < 0 ? 0 : i) % TINTS.length], onDark: false };
}
