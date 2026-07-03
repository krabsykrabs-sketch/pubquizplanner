import type jsPDF from 'jspdf';
import { DEJAVU_SANS_NORMAL, DEJAVU_SANS_BOLD } from './pdf-fonts-data';

// Locales whose text uses characters outside Latin-1, which jsPDF's built-in
// Helvetica cannot render (it would drop them). Currently only Polish; add
// others (Czech, Hungarian, Turkish, Cyrillic…) here as they're introduced.
const UNICODE_LOCALES = new Set(['pl']);

// Registers an embedded Unicode font (DejaVu Sans, subset to Latin +
// Latin-Extended-A + punctuation) on the doc when the locale needs it, and
// returns the font-family name to pass to doc.setFont(). Latin-1 locales
// (de, nl, sv, en) keep the built-in Helvetica so their output is unchanged.
export function registerPdfFont(doc: jsPDF, locale: string | undefined): string {
  if (!locale || !UNICODE_LOCALES.has(locale)) return 'helvetica';
  doc.addFileToVFS('DejaVuSans.ttf', DEJAVU_SANS_NORMAL);
  doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
  // The subset has no oblique face; reuse the upright for 'italic' so setFont
  // calls don't fail (fun-fact text is simply upright in Polish output).
  doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'italic');
  doc.addFileToVFS('DejaVuSans-Bold.ttf', DEJAVU_SANS_BOLD);
  doc.addFont('DejaVuSans-Bold.ttf', 'DejaVuSans', 'bold');
  return 'DejaVuSans';
}
