import { NextRequest, NextResponse } from 'next/server';
import { logEvent } from '@/lib/events';
import { shouldTrackRequest } from '@/lib/track-guard';
import { LOCALES, SOURCE_LOCALE } from '@/config/locales';
import { QR_SOURCES, type QrSource } from '@/lib/qr';
import { BASE_URL } from '@/lib/content-urls';

const VALID_SRC = new Set<string>(Object.values(QR_SOURCES));

// Landing point of the QR codes on slides and printouts: count the scan,
// then forward to the homepage of that language.
export async function GET(request: NextRequest, { params }: { params: { locale: string } }) {
  const locale = (LOCALES as readonly string[]).includes(params.locale)
    ? params.locale
    : SOURCE_LOCALE;
  const src = request.nextUrl.searchParams.get('s') ?? '';

  if (shouldTrackRequest(request)) {
    await logEvent('qr_scan', {
      path: `/${locale}/qr`,
      meta: { src: VALID_SRC.has(src) ? (src as QrSource) : 'unknown' },
    });
  }

  // Behind the proxy request.url can carry the container's internal host, so
  // production redirects go to the canonical origin.
  const origin = process.env.NODE_ENV === 'production' ? BASE_URL : request.nextUrl.origin;
  const target = new URL(`/${locale}`, origin);
  return NextResponse.redirect(target, 302);
}
