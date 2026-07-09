// Design tokens for the HTML slide presentation.
//
// The slide markup and layout live in presentation-builder.ts; everything
// *visual* (palette, type, accents) is expressed as these tokens and injected
// as CSS custom properties. To apply a new design you only change token values
// here or pass an alternate theme to buildPresentation(); you do not touch the
// generation logic.

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
  colorSubtle: string; // tertiary text (subtitle)
  colorFaint: string; // faintest text (hints, counters)
  colorAccent: string; // primary brand accent
  colorAccentLight: string; // accent highlight (gradient end)
  colorCorrect: string; // the revealed answer check
  colorWarning: string; // timer running out
  colorPanelText: string; // text inside the fun-fact / badge panel (on dark)
  colorPanelBg: string; // panel background (accent-tinted, on dark)
  colorPanelBorder: string; // panel border (accent-tinted, on dark)

  // The warm "quiz-card" that carries questions & answers (design system's
  // signature slide treatment — a physical card on the night backdrop).
  colorCardBg: string; // card surface (paper)
  colorCardInk: string; // question text on the card
  colorCardMuted: string; // secondary text on the card
  colorCardFaint: string; // faintest text on the card (progress)
  colorCardBorder: string; // hairlines inside the card
  colorChipBg: string; // number chip fill
  colorChipLip: string; // number chip pressed shadow / answer accent
  colorPillBg: string; // category pill fill
  colorNeutralChip: string; // number chip on answer slides (neutral)
}

// "The Marquee" — warm night backdrop, burnt-amber accent, quiz-card slides.
// Archivo (display) / Hanken Grotesk (body) / Spline Sans Mono (numbers).
export const defaultSlideTheme: SlideTheme = {
  name: 'marquee-night',
  fontImportUrl:
    'https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Hanken+Grotesk:wght@400;500;600;700&family=Spline+Sans+Mono:wght@400;500;600&display=swap',
  fontDisplay: "'Archivo', system-ui, sans-serif",
  fontBody: "'Hanken Grotesk', system-ui, sans-serif",
  fontMono: "'Spline Sans Mono', ui-monospace, monospace",

  colorBg: '#16110D', // night-900
  colorText: '#FBF7F0', // warm-50
  colorMuted: '#B4A488',
  colorSubtle: '#8B7B63',
  colorFaint: '#6A5C47',
  colorAccent: '#E88A45', // amber-400 (dark-theme accent)
  colorAccentLight: '#F0A867', // amber-300
  colorCorrect: '#7FA06E', // muted green (dark)
  colorWarning: '#D9694B',
  colorPanelText: '#EADFCF',
  colorPanelBg: 'rgba(217, 110, 42, 0.10)',
  colorPanelBorder: 'rgba(217, 110, 42, 0.30)',

  colorCardBg: '#FBF7F0', // warm-50
  colorCardInk: '#1B1611', // warm-900
  colorCardMuted: '#6A5C47', // warm-600
  colorCardFaint: '#8B7B63', // warm-500
  colorCardBorder: '#E8DCCB', // warm-200
  colorChipBg: '#D96E2A', // amber-500
  colorChipLip: '#984515', // amber-700
  colorPillBg: '#F7E4D2', // accent-soft
  colorNeutralChip: '#B4A488', // warm-400
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
  --card-bg: ${theme.colorCardBg};
  --card-ink: ${theme.colorCardInk};
  --card-muted: ${theme.colorCardMuted};
  --card-faint: ${theme.colorCardFaint};
  --card-border: ${theme.colorCardBorder};
  --chip-bg: ${theme.colorChipBg};
  --chip-lip: ${theme.colorChipLip};
  --pill-bg: ${theme.colorPillBg};
  --chip-neutral: ${theme.colorNeutralChip};
}`;
}
