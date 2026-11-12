import { ImageResponse } from 'next/og';
import { SOURCE_LOCALE, type Locale } from '@/config/locales';

export const alt = 'PubQuizPlanner – Dein Pub Quiz Generator';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// "Tageslicht" brand: cream paper, navy ink, orange accent, yellow marker.
const PAPER = '#FBF6EA';
const INK = '#1A2238';
const MUTED = '#4B5368';
const ORANGE = '#F26B2A';
const ORANGE_TEXT = '#B5430F';
const YELLOW = '#FFCF4A';

// The homepage headline, per locale (landing.heroTitle without its markup).
const TAGLINES: Partial<Record<Locale, string>> = {
  de: 'Dein Quiz für Klassenzimmer, Konferenzraum und Kneipe.',
  nl: 'Jouw quiz voor klaslokaal, kantoor en kroeg.',
  pl: 'Twój quiz do szkoły, biura i pubu.',
  sv: 'Ditt quiz för klassrummet, kontoret och puben.',
  fr: 'Ton quiz pour la classe, le bureau et le bar.',
  es: 'Tu quiz para el aula, la oficina y el bar.',
  pt: 'O teu quiz para a sala de aula, o escritório e o bar.',
};

function Mark({ size: s }: { size: number }) {
  return (
    <div
      style={{
        width: s,
        height: s,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: INK,
        borderRadius: s * 0.28,
        transform: 'rotate(-6deg)',
      }}
    >
      <svg width={s * 0.62} height={s * 0.62} viewBox="0 0 24 24">
        <path
          d="M20 6 9 17l-5-5"
          fill="none"
          stroke={YELLOW}
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
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
          justifyContent: 'space-between',
          padding: '64px 72px 78px',
          background: PAPER,
          position: 'relative',
        }}
      >
        {/* yellow sun, top right */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            right: -170,
            width: 460,
            height: 460,
            borderRadius: 460,
            background: YELLOW,
            display: 'flex',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <Mark size={76} />
          <div
            style={{
              display: 'flex',
              fontSize: 52,
              fontWeight: 800,
              color: INK,
              letterSpacing: '-0.02em',
            }}
          >
            PubQuiz<span style={{ color: ORANGE_TEXT }}>Planner</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              maxWidth: 980,
              fontSize: 78,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: '-0.03em',
              color: INK,
            }}
          >
            {tagline}
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: MUTED, marginTop: 30 }}>
            Quizfragen · Präsentation · Antwortbogen · Spickzettel
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: 14,
            background: ORANGE,
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
