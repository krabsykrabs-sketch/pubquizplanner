import sharp from 'sharp';
const DIR = '/mnt/c/Users/janah/AppData/Local/Temp/claude/--wsl-localhost-ubuntu-home-jan-PubQuiz-pubquizplanner/0de7475e-45a4-4072-b950-1bfe784145a1/scratchpad/design-assets';
import { readFileSync } from 'node:fs';
for (const name of process.argv.slice(2)) {
  await sharp(readFileSync(`${DIR}/${name}.svg`), { density: 150 })
    .resize(960, 540, { fit: 'contain', background: { r: 22, g: 19, b: 17 } })
    .png().toFile(`${DIR}/${name}-wide.png`);
  console.log(`rendered ${name}-wide.png`);
}
