// Rasterize the Recraft SVGs to PNGs (via sharp/librsvg, no network) so they
// can be eyeballed. Renders each at 300px and 32px on a neutral background.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const DIR = '/mnt/c/Users/janah/AppData/Local/Temp/claude/--wsl-localhost-ubuntu-home-jan-PubQuiz-pubquizplanner/0de7475e-45a4-4072-b950-1bfe784145a1/scratchpad/design-assets';
const names = process.argv.slice(2);

for (const name of names) {
  const svg = readFileSync(`${DIR}/${name}.svg`);
  for (const size of [300, 32]) {
    await sharp(svg, { density: 200 })
      .resize(size, size, { fit: 'contain', background: { r: 22, g: 19, b: 17 } })
      .png()
      .toFile(`${DIR}/${name}-${size}.png`);
  }
  console.log(`rasterized ${name}`);
}
