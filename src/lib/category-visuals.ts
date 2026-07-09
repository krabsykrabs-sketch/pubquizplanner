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
  Trophy,
  type LucideIcon,
} from 'lucide-react';

/* Category visuals — single source of truth for the 14 quiz subjects' art.
 * Art lives in public/categories/<slug>/ :
 *   background.png — app/marketing composition (subject right-of-center on a
 *                    night backdrop with warm glow; left kept clear for text)
 *   projector.png  — brighter variant for projected slides
 *   icon.svg       — square standalone subject illustration (hero tiles, pickers)
 * Slugs match the DB `categories.slug` column.
 */

export interface CategoryVisual {
  /** Lucide glyph — functional icon + last-resort fallback for missing art. */
  icon: LucideIcon;
  background: string;
  projector: string;
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
};

export const CATEGORY_SLUGS = Object.keys(ICONS);

/** Icon for the synthetic "Gemischt" (mixed) category, id -1. */
export const MixedCategoryIcon = Dices;

export function categoryVisual(slug: string): CategoryVisual | null {
  const icon = ICONS[slug];
  if (!icon) return null;
  const dir = `/categories/${slug}`;
  return {
    icon,
    background: `${dir}/background.png`,
    projector: `${dir}/projector.png`,
    iconArt: `${dir}/icon.svg`,
  };
}

/** Lucide glyph for a category slug; Dices for the mixed pseudo-category / unknowns. */
export function categoryIcon(slug: string | null | undefined): LucideIcon {
  return (slug && ICONS[slug]) || Dices;
}
