import qrcode from 'qrcode-generator';
import type jsPDF from 'jspdf';
import type { QrSource } from './qr-sources';

export { QR_SOURCES, QR_SOURCE_LABELS_DE, type QrSource } from './qr-sources';

// Own constant: content-urls.ts pulls in the DB client, this file must stay light.
const BASE_URL = 'https://pubquizplanner.com';

export function qrTargetUrl(locale: string, src: QrSource): string {
  return `${BASE_URL}/${locale}/qr?s=${src}`;
}

function matrix(text: string): boolean[][] {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
}

/** Inline SVG (quiet zone included). `fg`/`bg` accept any CSS colour. */
export function qrSvg(text: string, size: number, fg = '#000', bg = '#fff'): string {
  const m = matrix(text);
  const n = m.length + 8; // 4-module quiet zone each side
  let d = '';
  m.forEach((row, r) =>
    row.forEach((dark, c) => {
      if (dark) d += `M${c + 4} ${r + 4}h1v1h-1z`;
    })
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" width="${size}" height="${size}" shape-rendering="crispEdges" role="img" aria-label="QR"><rect width="${n}" height="${n}" fill="${bg}"/><path d="${d}" fill="${fg}"/></svg>`;
}

/** Draws the QR as vector squares into a jsPDF doc; (x, y) is the top-left of the code, `size` in doc units. */
export function drawQrPdf(doc: jsPDF, text: string, x: number, y: number, size: number): void {
  const m = matrix(text);
  const cell = size / m.length;
  doc.setFillColor(0, 0, 0);
  m.forEach((row, r) => {
    // Merge horizontal runs into one rect: fewer PDF ops, no hairline gaps.
    let c = 0;
    while (c < row.length) {
      if (!row[c]) { c++; continue; }
      const start = c;
      while (c < row.length && row[c]) c++;
      doc.rect(x + start * cell, y + r * cell, (c - start) * cell, cell, 'F');
    }
  });
}
