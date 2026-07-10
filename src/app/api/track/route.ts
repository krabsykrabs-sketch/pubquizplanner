import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/events';
import { getTokenFromCookies, verifyToken, NOTRACK_COOKIE } from '@/lib/admin-auth';

const BOT_RE = /bot|crawl|spider|slurp|preview|scrape|fetch|monitor|headless/i;
const SELF_REFERRER_RE = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:|\/|$)/i;

// Visitor country, approximated privacy-friendly from the browser's
// Accept-Language region tag (de-DE → DE). No IPs are stored or looked up.
function countryFromAcceptLanguage(header: string | null): string | null {
  if (!header) return null;
  for (const tag of header.split(',')) {
    const m = tag.trim().match(/^[a-zA-Z]{2,3}-([a-zA-Z]{2})(?:-|;|$)/);
    if (m) return m[1].toUpperCase();
  }
  return null;
}

// Public beacon endpoint for page views. Anything invalid is silently
// dropped — this endpoint never errors toward the client.
export async function POST(request: NextRequest) {
  try {
    const ua = request.headers.get('user-agent') || '';
    if (BOT_RE.test(ua)) return new NextResponse(null, { status: 204 });

    // The admin's own visits don't count: drop when the browser carries the
    // long-lived opt-out cookie (set on admin login) or a live admin session.
    if (request.cookies.get(NOTRACK_COOKIE)?.value === '1') {
      return new NextResponse(null, { status: 204 });
    }
    const adminToken = getTokenFromCookies(request.cookies);
    if (adminToken && verifyToken(adminToken)) {
      return new NextResponse(null, { status: 204 });
    }

    const body = await request.json();
    const path = typeof body.path === 'string' ? body.path : null;

    // Only public page views; ignore admin and malformed paths
    if (!path || !path.startsWith('/') || path.startsWith('/admin')) {
      return new NextResponse(null, { status: 204 });
    }

    // A localhost referrer means a dev environment pointed at this DB.
    const referrer = typeof body.referrer === 'string' ? body.referrer : null;
    if (referrer && SELF_REFERRER_RE.test(referrer)) {
      return new NextResponse(null, { status: 204 });
    }

    const country = countryFromAcceptLanguage(request.headers.get('accept-language'));

    await logEvent('page_view', {
      path,
      referrer,
      sessionId: body.sessionId,
      meta: country ? { country } : null,
    });
  } catch {
    // malformed request — drop
  }
  return new NextResponse(null, { status: 204 });
}
