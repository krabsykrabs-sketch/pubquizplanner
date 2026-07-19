// Remove the full-canvas white background rect (always the first path Recraft
// emits) to make a line_art icon transparent, then rasterize it onto BOTH a
// dark and a cream surface so we can see how it behaves on each.
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const DIR = '/mnt/c/Users/janah/AppData/Local/Temp/claude/--wsl-localhost-ubuntu-home-jan-PubQuiz-pubquizplanner/0de7475e-45a4-4072-b950-1bfe784145a1/scratchpad/design-assets';

// Full-canvas rect Recraft emits as the first (background) path — match it by
// geometry (starts at 0 0, spans the 2048 canvas) regardless of fill, since the
// bg colour varies (255,255,255 vs off-white 255,255,254). Non-global = first
// match only, so real full-bleed art shapes later are safe.
const BG_RECT = /<path d="M 0 0 [^"]*2048[^"]*z" fill="[^"]*"[^>]*>\s*<\/path>/;

for (const name of process.argv.slice(2)) {
  const svg = readFileSync(`${DIR}/${name}.svg`, 'utf8');
  const stripped = svg.replace(BG_RECT, '');
  const removed = stripped.length !== svg.length;
  writeFileSync(`${DIR}/${name}-nobg.svg`, stripped);
  const buf = Buffer.from(stripped);
  // transparent render, then composite over each surface
  for (const [label, bg] of [['dark', { r: 22, g: 19, b: 17 }], ['cream', { r: 251, g: 247, b: 240 }]]) {
    await sharp(buf, { density: 200 })
      .resize(220, 220, { fit: 'contain', background: bg })
      .flatten({ background: bg })
      .png()
      .toFile(`${DIR}/${name}-${label}.png`);
  }
  console.log(`${name}: bg ${removed ? 'REMOVED' : 'NOT FOUND'} -> ${name}-nobg.svg`);
}
