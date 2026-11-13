// The seasonal "festive layer" on top of the brand: fairy lights, a hat on
// the logo, pine-green Christmas slides. Everything seasonal asks this file
// whether it is on, so the whole layer switches itself off after Christmas
// without a deploy (and back on next November).

/** The seasonal category this layer promotes. */
export const FESTIVE_SLUG = 'weihnachten';

/** 1 Nov – 26 Dec: office parties, last school lessons, family evenings. */
export function isFestiveSeason(now: Date = new Date()): boolean {
  const m = now.getMonth(); // 0-based: 10 = Nov, 11 = Dec
  return m === 10 || (m === 11 && now.getDate() <= 26);
}

// ---- Fairy lights -------------------------------------------------------
// One repeating 350 x 30 tile: a drooping wire with five bulbs. Split into
// three layers (wire, even bulbs, odd bulbs) so the two bulb layers can
// twinkle out of phase. Used as CSS background images on the site
// (FestiveLights) and inside the generated slide deck.

const BULBS_ON_PAPER = ['#FFCF4A', '#F26B2A', '#D43F7C', '#1F8F6B', '#3559D6'];
const BULBS_ON_DARK = ['#FFCF4A', '#F88A4D', '#FF8FB8', '#FFFFFF', '#7FD6B4'];

const uri = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
const tile = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="350" height="30" viewBox="0 0 350 30">${body}</svg>`;

export interface LightLayers {
  wire: string;
  bulbsA: string;
  bulbsB: string;
}

export function fairyLights(onDark = false): LightLayers {
  const ink = onDark ? '#FBF6EA' : '#1A2238';
  const colors = onDark ? BULBS_ON_DARK : BULBS_ON_PAPER;
  const bulb = (i: number) => {
    const x = 35 + i * 70;
    return (
      `<rect x="${x - 2.5}" y="9" width="5" height="5" rx="1" fill="${ink}"/>` +
      `<ellipse cx="${x}" cy="20.5" rx="5.5" ry="7.5" fill="${colors[i]}" stroke="${ink}" stroke-width="1.4"/>`
    );
  };
  return {
    wire: uri(
      tile(
        `<path d="M0 3 Q35 16 70 3 T140 3 T210 3 T280 3 T350 3" fill="none" stroke="${ink}" stroke-width="1.6"/>`
      )
    ),
    bulbsA: uri(tile([0, 2, 4].map(bulb).join(''))),
    bulbsB: uri(tile([1, 3].map(bulb).join(''))),
  };
}
