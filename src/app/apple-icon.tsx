import { ImageResponse } from 'next/og';

// PNG icon (apple-touch-icon + robust favicon fallback for crawlers that
// don't process SVG favicons reliably). "Tageslicht" brand mark: a yellow
// tick in an ink answer box.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

const INK = '#1A2238';
const YELLOW = '#FFCF4A';

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
          background: INK,
        }}
      >
        <svg width="124" height="124" viewBox="0 0 24 24" style={{ transform: 'rotate(-6deg)' }}>
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
    ),
    { ...size }
  );
}
