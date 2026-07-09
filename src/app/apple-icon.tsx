import { ImageResponse } from 'next/og';

// PNG icon (apple-touch-icon + robust favicon fallback for crawlers that
// don't process SVG favicons reliably). "The Marquee" brand: amber "?"
// roundel on warm night.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

const NIGHT = '#16110D';
const AMBER = '#E88A45';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: NIGHT,
          borderRadius: 36,
        }}
      >
        {/* Satori does not support SVG <text>; the "?" is HTML overlaid on the rings. */}
        <div style={{ position: 'relative', width: 150, height: 150, display: 'flex' }}>
          <svg width="150" height="150" viewBox="0 0 48 48">
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
              width: 150,
              height: 150,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 75,
              fontWeight: 800,
              color: AMBER,
            }}
          >
            ?
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
