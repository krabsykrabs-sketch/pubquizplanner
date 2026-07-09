// Generates raster favicons from src/app/icon.svg so search engines (Google/
// Bing) actually render a favicon in results — they don't reliably use an
// SVG-only icon, and /favicon.ico must exist (App Router doesn't auto-create
// it). Produces:
//   src/app/favicon.ico  — multi-size PNG-in-ICO (16/32/48), served at /favicon.ico
//   src/app/icon.png     — 96x96 PNG (48px multiple), emitted as <link rel=icon>
// Run: node scripts/gen-favicon.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(join(root, 'src/app/icon.svg'));

async function png(size) {
  return sharp(svg, { density: 384 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

// Wrap a set of PNG buffers into a single .ico (PNG-in-ICO; supported by all
// modern browsers and Google's favicon fetcher).
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);

  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;
  const bodies = [];
  entries.forEach((e, i) => {
    const b = i * 16;
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, b + 0); // width
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, b + 1); // height
    dir.writeUInt8(0, b + 2); // palette
    dir.writeUInt8(0, b + 3); // reserved
    dir.writeUInt16LE(1, b + 4); // color planes
    dir.writeUInt16LE(32, b + 6); // bits per pixel
    dir.writeUInt32LE(e.data.length, b + 8); // size of image data
    dir.writeUInt32LE(offset, b + 12); // offset
    offset += e.data.length;
    bodies.push(e.data);
  });
  return Buffer.concat([header, dir, ...bodies]);
}

const [p16, p32, p48, p96] = await Promise.all([png(16), png(32), png(48), png(96)]);
const ico = buildIco([
  { size: 16, data: p16 },
  { size: 32, data: p32 },
  { size: 48, data: p48 },
]);

writeFileSync(join(root, 'src/app/favicon.ico'), ico);
writeFileSync(join(root, 'src/app/icon.png'), p96);
console.log('wrote src/app/favicon.ico (' + ico.length + ' bytes) and src/app/icon.png (' + p96.length + ' bytes)');
