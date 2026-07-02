import { ImageResponse } from 'next/og';

export const alt = 'PubQuizPlanner – Dein Pub Quiz Generator';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const GOLD = '#d4a843';
const BG = '#0a0a0f';
const MUTED = '#a09888';

export default function OpengraphImage() {
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
          background: BG,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 60,
            fontSize: 200,
            color: '#1c1a22',
            fontWeight: 700,
          }}
        >
          ?
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: -40,
            right: 80,
            fontSize: 280,
            color: '#1c1a22',
            fontWeight: 700,
          }}
        >
          ?
        </div>
        <div style={{ fontSize: 92, fontWeight: 700, color: GOLD, display: 'flex' }}>
          PubQuizPlanner
        </div>
        <div style={{ fontSize: 40, color: '#e8e4dc', marginTop: 24, display: 'flex' }}>
          Dein Pub Quiz, perfekt geplant.
        </div>
        <div style={{ fontSize: 28, color: MUTED, marginTop: 40, display: 'flex' }}>
          Quizfragen · Präsentation · Antwortbogen · Spickzettel
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: 10,
            background: GOLD,
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
