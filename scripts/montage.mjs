// Composite the 17 stripped icons (already rendered on night-900) into a single
// contact-sheet PNG so the whole set can be viewed in one image.
import sharp from 'sharp';
import { join } from 'node:path';

const DIR = '/mnt/c/Users/janah/AppData/Local/Temp/claude/--wsl-localhost-ubuntu-home-jan-PubQuiz-pubquizplanner/0de7475e-45a4-4072-b950-1bfe784145a1/scratchpad/design-assets';

const ORDER = [
  'allgemeinwissen', 'film-tv', 'geschichte', 'geographie', 'sprache', 'sport',
  'musik', 'wissenschaft', 'literatur', 'essen-trinken', 'kunst-kultur', 'popkultur',
  'technik', 'logik-mathe', 'step-choose', 'step-build', 'step-present',
];

const COLS = 6, CELL = 180, ICON = 160, PAD = (CELL - ICON) / 2;
const rows = Math.ceil(ORDER.length / COLS);
const W = COLS * CELL, H = rows * CELL;

const composites = [];
for (let i = 0; i < ORDER.length; i++) {
  const buf = await sharp(join(DIR, `${ORDER[i]}-dark.png`)).resize(ICON, ICON).toBuffer();
  const c = i % COLS, r = Math.floor(i / COLS);
  composites.push({ input: buf, left: c * CELL + PAD, top: r * CELL + PAD });
}

await sharp({ create: { width: W, height: H, channels: 3, background: { r: 22, g: 19, b: 17 } } })
  .composite(composites)
  .png()
  .toFile(join(DIR, 'montage.png'));
console.log(`montage.png  ${W}x${H}  (${ORDER.length} icons)`);
