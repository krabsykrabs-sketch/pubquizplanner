import { Archivo, Hanken_Grotesk, Spline_Sans_Mono } from 'next/font/google';

/* PubQuizPlanner design system — "The Marquee".
 * Display: Archivo (confident, slightly condensed at heavy weights, German-friendly)
 * Body/UI: Hanken Grotesk (warm humanist grotesque)
 * Mono:    Spline Sans Mono (question numbers, scores, tabular data)
 * All three carry Latin-Extended coverage (DE ß/ü, PL ł/ą/ę, SV å/ä/ö, NL).
 */

export const fontDisplay = Archivo({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
});

export const fontBody = Hanken_Grotesk({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
});

export const fontMono = Spline_Sans_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-mono',
  display: 'swap',
});

export const fontVariables = `${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`;
