// Design tokens for the HTML slide presentation.
//
// The slide markup and layout live in presentation-builder.ts; everything
// *visual* (palette, type, accents) is expressed as these tokens and injected
// as CSS custom properties. To apply a new design (e.g. one returned from the
// ChatGPT design handoff — see SLIDE_DESIGN_PROMPTS.md), you only change token
// values here or pass an alternate theme to buildPresentation(); you do not
// touch the generation logic.

export interface SlideTheme {
  name: string;
  // A single Google Fonts (or other) stylesheet URL, imported at the top of the
  // slide CSS. Must be self-contained; the deck has to work offline once opened,
  // but the font import is the one allowed remote fetch (falls back to the
  // generic families below if the network is unavailable).
  fontImportUrl: string;
  fontDisplay: string; // headings
  fontBody: string; // body copy
  fontMono: string; // meta / counters / timer

  colorBg: string;
  colorText: string;
  colorMuted: string; // secondary text
  colorSubtle: string; // tertiary text (italic subtitle)
  colorFaint: string; // faintest text (hints, counters)
  colorAccent: string; // primary brand accent (gold)
  colorAccentLight: string; // accent highlight (gradient end)
  colorCorrect: string; // the revealed answer
  colorWarning: string; // timer running out
  colorPanelText: string; // text inside the fun-fact / badge panel
  colorPanelBg: string; // panel background (accent-tinted)
  colorPanelBorder: string; // panel border (accent-tinted)
}

// The current production look: dark background, gold accent, Playfair/DM Sans.
export const defaultSlideTheme: SlideTheme = {
  name: 'classic-dark-gold',
  fontImportUrl:
    'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap',
  fontDisplay: "'Playfair Display', serif",
  fontBody: "'DM Sans', sans-serif",
  fontMono: "'JetBrains Mono', monospace",

  colorBg: '#0a0a0f',
  colorText: '#e8e4dc',
  colorMuted: '#a09888',
  colorSubtle: '#706858',
  colorFaint: '#504838',
  colorAccent: '#d4a843',
  colorAccentLight: '#e8c468',
  colorCorrect: '#4ade80',
  colorWarning: '#ef4444',
  colorPanelText: '#c8b888',
  colorPanelBg: 'rgba(212, 168, 67, 0.1)',
  colorPanelBorder: 'rgba(212, 168, 67, 0.3)',
};

// Renders the font import + the :root custom-property block for a theme. The
// slide CSS references these via var(--slide-*), so swapping the theme reskins
// the whole deck.
export function renderThemeCss(theme: SlideTheme): string {
  return `@import url('${theme.fontImportUrl}');

:root {
  --slide-font-display: ${theme.fontDisplay};
  --slide-font-body: ${theme.fontBody};
  --slide-font-mono: ${theme.fontMono};
  --slide-bg: ${theme.colorBg};
  --slide-text: ${theme.colorText};
  --slide-muted: ${theme.colorMuted};
  --slide-subtle: ${theme.colorSubtle};
  --slide-faint: ${theme.colorFaint};
  --slide-accent: ${theme.colorAccent};
  --slide-accent-light: ${theme.colorAccentLight};
  --slide-correct: ${theme.colorCorrect};
  --slide-warning: ${theme.colorWarning};
  --slide-panel-text: ${theme.colorPanelText};
  --slide-panel-bg: ${theme.colorPanelBg};
  --slide-panel-border: ${theme.colorPanelBorder};
}`;
}
