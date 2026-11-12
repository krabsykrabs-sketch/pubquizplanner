import { Bricolage_Grotesque, Caveat, DM_Mono, Instrument_Sans } from 'next/font/google';

/* PubQuizPlanner design system — "Tageslicht".
 * Display: Bricolage Grotesque (chunky, friendly, a little quirky at heavy weights)
 * Body/UI: Instrument Sans (clean, neutral, reads well at small sizes)
 * Mono:    DM Mono (question numbers, counts, kickers)
 * Hand:    Caveat (handwriting on the hero's answer sheet only — decoration)
 * All four carry Latin-Extended coverage (DE ß/ü, PL ł/ą/ę, SV å/ä/ö, NL).
 */

export const fontDisplay = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  // Optical-size axis: big headlines get the tighter display cut automatically.
  axes: ['opsz'],
  variable: '--font-display',
  display: 'swap',
});

export const fontBody = Instrument_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
});

export const fontMono = DM_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const fontHand = Caveat({
  subsets: ['latin', 'latin-ext'],
  weight: ['600'],
  variable: '--font-hand',
  display: 'swap',
  preload: false,
});

export const fontVariables = `${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable} ${fontHand.variable}`;
