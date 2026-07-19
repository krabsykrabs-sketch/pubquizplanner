// Build the final PubQuizPlanner logo: amber coaster + a clean bold sans "?"
// converted from DejaVu Sans Bold to a VECTOR PATH (font-independent, identical
// at every size). Emits logo.svg + favicon.ico (16/32/48) + icon.png (96) plus
// preview renders, all into the design-assets/final folder.
import opentype from 'opentype.js';
import sharp from 'sharp';
import { writeFileSync, readFileSync } from 'node:fs';

const OUT = '/mnt/c/Users/janah/AppData/Local/Temp/claude/--wsl-localhost-ubuntu-home-jan-PubQuiz-pubquizplanner/0de7475e-45a4-4072-b950-1bfe784145a1/scratchpad/design-assets';
const FINAL = `${OUT}/final`;
const FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';

// --- build the "?" glyph path, centered in the 64x64 coaster ---
const f = opentype.parse(new Uint8Array(readFileSync(FONT)).buffer);
const raw = f.getPath('?', 0, 0, 100);
const bb = raw.getBoundingBox();
const gw = bb.x2 - bb.x1, gh = bb.y2 - bb.y1;
const H = 33;                       // target glyph height in viewBox units
const s = H / gh;
const cx = (bb.x1 + bb.x2) / 2 * s, cy = (bb.y1 + bb.y2) / 2 * s;
const tx = 32 - cx, ty = 31.5 - cy; // centre in coaster (slightly above middle)
const d = raw.toPathData(3);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><radialGradient id="c" cx="42%" cy="36%" r="72%">
    <stop offset="0%" stop-color="#F2AE6E"/><stop offset="65%" stop-color="#D96E2A"/><stop offset="100%" stop-color="#BE5A1C"/>
  </radialGradient></defs>
  <circle cx="32" cy="32" r="29" fill="url(#c)" stroke="#4A1E0E" stroke-width="3"/>
  <ellipse cx="24" cy="21" rx="15" ry="9" fill="#FFFFFF" opacity="0.16"/>
  <circle cx="32" cy="32" r="23.5" fill="none" stroke="#4A1E0E" stroke-width="1.4" opacity="0.45"/>
  <path transform="translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})" d="${d}" fill="#3A1608"/>
</svg>
`;
writeFileSync(`${FINAL}/logo.svg`, svg);

// --- rasterize favicon.ico (PNG-in-ICO 16/32/48) + icon.png (96) ---
const png = (size) => sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png().toBuffer();
function buildIco(entries) {
  const header = Buffer.alloc(6); header.writeUInt16LE(1, 2); header.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length); let off = 6 + dir.length; const bodies = [];
  entries.forEach((e, i) => { const b = i * 16;
    dir.writeUInt8(e.size, b); dir.writeUInt8(e.size, b + 1);
    dir.writeUInt16LE(1, b + 4); dir.writeUInt16LE(32, b + 6);
    dir.writeUInt32LE(e.data.length, b + 8); dir.writeUInt32LE(off, b + 12);
    off += e.data.length; bodies.push(e.data); });
  return Buffer.concat([header, dir, ...bodies]);
}
const [p16, p32, p48, p96] = await Promise.all([png(16), png(32), png(48), png(96)]);
writeFileSync(`${FINAL}/favicon.ico`, buildIco([{ size: 16, data: p16 }, { size: 32, data: p32 }, { size: 48, data: p48 }]));
writeFileSync(`${FINAL}/icon.png`, p96);

// --- preview renders ---
const DARK = { r: 22, g: 19, b: 17 };
await sharp(Buffer.from(svg), { density: 384 }).resize(200, 200, { fit: 'contain', background: DARK }).flatten({ background: DARK }).png().toFile(`${OUT}/logo-final-200d.png`);
writeFileSync(`${OUT}/logo-final-16.png`, p16);
console.log('wrote final/logo.svg, final/favicon.ico, final/icon.png (+ previews)');
