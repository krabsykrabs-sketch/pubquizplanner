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

  // The "quiz-card" that carries questions & answers (the signature slide
  // treatment — a physical card on the dark backdrop).
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

// "Tageslicht" — navy backdrop (dark holds up best on a projector), cream
// quiz-card with an orange hard shadow, yellow highlights.
// Bricolage Grotesque (display) / Instrument Sans (body) / DM Mono (numbers).
export const defaultSlideTheme: SlideTheme = {
  name: 'tageslicht-navy',
  fontImportUrl:
    'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=DM+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600;700&display=swap',
  fontDisplay: "'Bricolage Grotesque', system-ui, sans-serif",
  fontBody: "'Instrument Sans', system-ui, sans-serif",
  fontMono: "'DM Mono', ui-monospace, monospace",

  colorBg: '#141B2E', // night-900
  colorText: '#FBF6EA', // paper
  colorMuted: '#A9B0C4',
  colorSubtle: '#8088A0',
  colorFaint: '#69718A',
  colorAccent: '#F88A4D', // orange on navy
  colorAccentLight: '#FFCF4A', // yellow
  colorCorrect: '#1F8F6B', // green
  colorWarning: '#F0705F',
  colorPanelText: '#E4E2DA',
  colorPanelBg: 'rgba(255, 207, 74, 0.10)',
  colorPanelBorder: 'rgba(255, 207, 74, 0.30)',

  colorCardBg: '#FFFDF7', // card paper
  colorCardInk: '#1A2238', // ink
  colorCardMuted: '#4B5368',
  colorCardFaint: '#767D92',
  colorCardBorder: '#E6DCC6',
  colorChipBg: '#F26B2A', // orange
  colorChipLip: '#B5430F', // deep orange: chip lip + accent text on the card
  colorPillBg: '#FFE1CE', // peach
  colorNeutralChip: '#C9CCD6',
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
