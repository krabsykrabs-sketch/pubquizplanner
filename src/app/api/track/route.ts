import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/events';
import { shouldTrackRequest } from '@/lib/track-guard';

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

// Coarse device class from the user-agent — enough for a mobile/desktop/tablet
// split, no fingerprinting. Tablets checked before mobile ("iPad"/"Tablet"
// often also carry "Mobile"-ish tokens).
function deviceFromUserAgent(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/mobi|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(ua)) return 'mobile';
  return 'desktop';
}

// Public beacon endpoint for page views. Anything invalid is silently
// dropped — this endpoint never errors toward the client.
export async function POST(request: NextRequest) {
  try {
    // Bots and the admin's own visits (opt-out cookie / live session) don't count.
    if (!shouldTrackRequest(request)) return new NextResponse(null, { status: 204 });

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

    // Prefer the precise country the client resolved (geojs.io geo-IP; no IP
    // reaches or is stored by us), fall back to the Accept-Language region.
    const clientCountry =
      typeof body.country === 'string' && /^[A-Za-z]{2}$/.test(body.country)
        ? body.country.toUpperCase()
        : null;
    const country =
      clientCountry ?? countryFromAcceptLanguage(request.headers.get('accept-language'));

    const device = deviceFromUserAgent(request.headers.get('user-agent') || '');

    const meta: Record<string, string> = { device };
    if (country) meta.country = country;

    await logEvent('page_view', {
      path,
      referrer,
      sessionId: body.sessionId,
      meta,
    });
  } catch {
    // malformed request — drop
  }
  return new NextResponse(null, { status: 204 });
}
