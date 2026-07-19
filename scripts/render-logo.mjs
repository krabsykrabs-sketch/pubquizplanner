// Render the hand-built logo SVGs at large + favicon sizes on dark and cream
// so we can judge legibility down to 16px.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const DIR = '/mnt/c/Users/janah/AppData/Local/Temp/claude/--wsl-localhost-ubuntu-home-jan-PubQuiz-pubquizplanner/0de7475e-45a4-4072-b950-1bfe784145a1/scratchpad/design-assets';
const DARK = { r: 22, g: 19, b: 17 };
const CREAM = { r: 251, g: 247, b: 240 };

for (const name of process.argv.slice(2)) {
  const svg = readFileSync(`${DIR}/${name}.svg`);
  const jobs = [
    ['200d', 200, DARK], ['200c', 200, CREAM], ['32', 32, DARK], ['16', 16, DARK],
  ];
  for (const [tag, size, bg] of jobs) {
    await sharp(svg, { density: 300 })
      .resize(size, size, { fit: 'contain', background: bg })
      .flatten({ background: bg })
      .png()
      .toFile(`${DIR}/${name}-${tag}.png`);
  }
  console.log(`rendered ${name}`);
}
