import { ImageResponse } from 'next/og';
import { SOURCE_LOCALE, type Locale } from '@/config/locales';

export const alt = 'PubQuizPlanner – Dein Pub Quiz Generator';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// "The Marquee" brand: warm night backdrop, burnt-amber accent.
const NIGHT = '#16110D';
const AMBER = '#E88A45';
const PAPER = '#FBF7F0';
const MUTED = '#B4A488';

const TAGLINES: Partial<Record<Locale, string>> = {
  de: 'Der ganze Quizabend. Nicht nur die Fragen.',
  nl: 'De hele quizavond. Niet alleen de vragen.',
  pl: 'Cały wieczór quizowy. Nie tylko pytania.',
  sv: 'Hela quizkvällen. Inte bara frågorna.',
  fr: 'Toute la soirée quiz. Pas seulement les questions.',
  es: 'Toda la noche de quiz. No solo las preguntas.',
  pt: 'Toda a noite de quiz. Não só as perguntas.',
};

// Satori (next/og) does not support SVG <text>, so the "?" is HTML overlaid
// on the ring SVG.
function Roundel({ size: s }: { size: number }) {
  return (
    <div style={{ position: 'relative', width: s, height: s, display: 'flex' }}>
      <svg width={s} height={s} viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="21" fill="none" stroke={AMBER} strokeWidth="2.5" />
        <circle
          cx="24"
          cy="24"
          r="16.5"
          fill="none"
          stroke={AMBER}
          strokeWidth="1.6"
          strokeDasharray="0.5 3.4"
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: s,
          height: s,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: s * 0.5,
          fontWeight: 800,
          color: AMBER,
        }}
      >
        ?
      </div>
    </div>
  );
}

export default function OpengraphImage({ params }: { params: { locale: string } }) {
  const tagline = TAGLINES[params?.locale as Locale] ?? TAGLINES[SOURCE_LOCALE];
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: NIGHT,
          backgroundImage:
            'radial-gradient(circle at 82% 8%, rgba(217,110,42,0.30), rgba(22,17,13,0) 55%)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <Roundel size={110} />
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              color: PAPER,
              display: 'flex',
              letterSpacing: '-0.03em',
            }}
          >
            PubQuizPlanner
          </div>
        </div>
        <div
          style={{
            fontSize: 42,
            color: AMBER,
            marginTop: 34,
            display: 'flex',
            fontWeight: 600,
          }}
        >
          {tagline}
        </div>
        <div style={{ fontSize: 27, color: MUTED, marginTop: 34, display: 'flex' }}>
          Quizfragen · Präsentation · Antwortbogen · Spickzettel
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: 10,
            background: '#D96E2A',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
