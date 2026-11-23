// "Make your own quiz" QR codes on everything a quiz room sees (final slide,
// answer sheet, printable category PDF). Each points at /<locale>/qr?s=<src>,
// which counts the scan and forwards to the localized homepage — so the
// analytics can tell which projected/printed surface brings people back.
// Kept separate from qr.ts so the admin dashboard can import the labels
// without bundling the QR encoder.
export const QR_SOURCES = { slides: 's', answerSheet: 'a', categoryPdf: 'f' } as const;
export type QrSource = (typeof QR_SOURCES)[keyof typeof QR_SOURCES];
export const QR_SOURCE_LABELS_DE: Record<QrSource, string> = {
  s: 'Präsentation (letzte Folie)',
  a: 'Antwortbogen',
  f: 'Kategorie-PDF',
};
