import { ImageResponse } from 'next/og';

// PNG icon (apple-touch-icon + robust favicon fallback for crawlers that
// don't process SVG favicons reliably).
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

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
          background: '#0a0a0f',
          borderRadius: 36,
          border: '6px solid #d4a843',
        }}
      >
        <div style={{ fontSize: 110, fontWeight: 700, color: '#d4a843', display: 'flex' }}>
          ?
        </div>
      </div>
    ),
    { ...size }
  );
}
