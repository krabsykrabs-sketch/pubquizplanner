// Build slide backgrounds by compositing a line_art icon onto a dark 16:9
// canvas: amber glow + a few sparks + subtle vignette, object right, empty left.
// Outputs a rich version and a projector version (lifted brightness). No AI
// framing — perfectly consistent with the icon set, free + instant.
import sharp from 'sharp';
const DIR = '/mnt/c/Users/janah/AppData/Local/Temp/claude/--wsl-localhost-ubuntu-home-jan-PubQuiz-pubquizplanner/0de7475e-45a4-4072-b950-1bfe784145a1/scratchpad/design-assets';
const FINAL = `${DIR}/final`;

const W = 1820, H = 1024;
const NIGHT = { r: 22, g: 19, b: 17 };
const ICON = 800, ICX = 1310, ICY = 512;
const GLOW = 1000;

const CATS = ['allgemeinwissen', 'film-tv', 'geschichte', 'geographie', 'sprache',
  'sport', 'musik', 'wissenschaft', 'literatur', 'essen-trinken',
  'kunst-kultur', 'popkultur', 'technik', 'logik-mathe'];

const glowSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${GLOW}" height="${GLOW}">
     <defs><radialGradient id="g" cx="50%" cy="50%" r="50%">
       <stop offset="0%" stop-color="#F09248" stop-opacity="0.55"/>
       <stop offset="42%" stop-color="#D96E2A" stop-opacity="0.18"/>
       <stop offset="100%" stop-color="#D96E2A" stop-opacity="0"/>
     </radialGradient></defs>
     <rect width="${GLOW}" height="${GLOW}" fill="url(#g)"/>
   </svg>`);

// Vignette: darken edges over the whole canvas (subtle).
const vignetteSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
     <defs><radialGradient id="v" cx="50%" cy="50%" r="72%">
       <stop offset="55%" stop-color="#000000" stop-opacity="0"/>
       <stop offset="100%" stop-color="#050403" stop-opacity="0.55"/>
     </radialGradient></defs>
     <rect width="${W}" height="${H}" fill="url(#v)"/>
   </svg>`);

// A few amber sparks scattered on the right, near the object.
const star = (x, y, s) =>
  `M ${x} ${y - s} L ${x + s * 0.28} ${y - s * 0.28} L ${x + s} ${y} L ${x + s * 0.28} ${y + s * 0.28} L ${x} ${y + s} L ${x - s * 0.28} ${y + s * 0.28} L ${x - s} ${y} L ${x - s * 0.28} ${y - s * 0.28} Z`;
const SP = [[1170, 175, 9, .75, 1], [1530, 140, 5, .6, 0], [1670, 330, 8, .55, 1],
  [1075, 415, 5, .5, 0], [1615, 620, 9, .6, 1], [1730, 780, 6, .5, 0],
  [1180, 835, 7, .5, 0], [1470, 890, 6, .45, 1], [1005, 300, 5, .4, 0]];
const sparksSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">` +
  SP.map(([x, y, s, o, isStar]) => isStar
    ? `<path d="${star(x, y, s)}" fill="#F2AE6E" opacity="${o}"/>`
    : `<circle cx="${x}" cy="${y}" r="${s * 0.5}" fill="#F0A867" opacity="${o}"/>`).join('') +
  `</svg>`);

const slugs = process.argv.slice(2).length ? process.argv.slice(2) : CATS;
for (const slug of slugs) {
  const icon = await sharp(`${FINAL}/${slug}.svg`, { density: 400 })
    .resize(ICON, ICON, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  const rich = await sharp({ create: { width: W, height: H, channels: 3, background: NIGHT } })
    .composite([
      { input: vignetteSvg, left: 0, top: 0 },
      { input: glowSvg, left: Math.round(ICX - GLOW / 2), top: Math.round(ICY - GLOW / 2) },
      { input: sparksSvg, left: 0, top: 0 },
      { input: icon, left: Math.round(ICX - ICON / 2), top: Math.round(ICY - ICON / 2) },
    ])
    .png()
    .toBuffer();
  await sharp(rich).toFile(`${DIR}/bgc-${slug}-wide.png`);
  await sharp(rich).modulate({ brightness: 1.16 }).gamma(1.12).png().toFile(`${DIR}/bgc-${slug}-proj.png`);
  console.log(`ok ${slug}  (rich + proj)`);
}
console.log(`done — ${slugs.length} backgrounds`);
