import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/events';

const BOT_RE = /bot|crawl|spider|slurp|preview|scrape|fetch|monitor|headless/i;

// Public beacon endpoint for page views. Anything invalid is silently
// dropped — this endpoint never errors toward the client.
export async function POST(request: NextRequest) {
  try {
    const ua = request.headers.get('user-agent') || '';
    if (BOT_RE.test(ua)) return new NextResponse(null, { status: 204 });

    const body = await request.json();
    const path = typeof body.path === 'string' ? body.path : null;

    // Only public page views; ignore admin and malformed paths
    if (!path || !path.startsWith('/') || path.startsWith('/admin')) {
      return new NextResponse(null, { status: 204 });
    }

    await logEvent('page_view', {
      path,
      referrer: typeof body.referrer === 'string' ? body.referrer : null,
      sessionId: body.sessionId,
    });
  } catch {
    // malformed request — drop
  }
  return new NextResponse(null, { status: 204 });
}
