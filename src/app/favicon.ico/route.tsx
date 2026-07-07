import { ImageResponse } from 'next/og';

// Static /favicon.ico fallback for crawlers and browsers that check this
// path directly instead of reading the <link rel="icon"> tag (see icon.svg
// for the primary favicon).
export async function GET() {
  const image = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0f',
          borderRadius: 8,
          border: '3px solid #d4a843',
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 700, color: '#d4a843', display: 'flex' }}>
          ?
        </div>
      </div>
    ),
    { width: 48, height: 48 }
  );

  return new Response(image.body, {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' },
  });
}
