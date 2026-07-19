import sharp from 'sharp';
const DIR = '/mnt/c/Users/janah/AppData/Local/Temp/claude/--wsl-localhost-ubuntu-home-jan-PubQuiz-pubquizplanner/0de7475e-45a4-4072-b950-1bfe784145a1/scratchpad/design-assets';

// Columns: each argv name gets its big render on top and its 16px favicon
// (upscaled nearest-neighbour) below, so true favicon pixels are visible.
const names = process.argv.slice(2);
const COLW = 200, GAP = 40, TOP = 20, BIG = 200, FAV = 72, GAP2 = 34;
const W = GAP + names.length * (COLW + GAP);
const H = TOP + BIG + GAP2 + FAV + 20;

const comps = [];
for (let i = 0; i < names.length; i++) {
  const x = GAP + i * (COLW + GAP);
  comps.push({ input: await sharp(`${DIR}/${names[i]}-200d.png`).toBuffer(), left: x, top: TOP });
  const fav = await sharp(`${DIR}/${names[i]}-16.png`).resize(FAV, FAV, { kernel: 'nearest' }).toBuffer();
  comps.push({ input: fav, left: x + (COLW - FAV) / 2, top: TOP + BIG + GAP2 });
}

await sharp({ create: { width: W, height: H, channels: 3, background: { r: 22, g: 19, b: 17 } } })
  .composite(comps).png().toFile(`${DIR}/logo-compare.png`);
console.log(`logo-compare.png  ${W}x${H}  [${names.join(', ')}]`);
