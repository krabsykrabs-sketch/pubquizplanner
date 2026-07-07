import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { buildPresentation } from '@/lib/presentation-builder';
import { assembleDemoDeck, ensureDemoDeck } from '@/lib/demo-deck';
import { isLocale, DEFAULT_LOCALE } from '@/config/locales';

// Public: serves the saved demo deck as a full, playable presentation (the same
// HTML the generator produces) in the requested locale. Lazily seeds a random
// deck on first request so the page is never broken.
export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get('locale');
  const locale = isLocale(localeParam) ? localeParam : DEFAULT_LOCALE;

  try {
    const deck = await ensureDemoDeck();
    const t = await getTranslations({ locale, namespace: 'demo' });
    const assembled = await assembleDemoDeck(deck, locale, t('deckTitle'));
    if (!assembled) {
      return new NextResponse(t('unavailable'), {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const html = buildPresentation(assembled);
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Same saved deck for everyone; safe to cache briefly at the edge.
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch {
    // Storage not ready (migration not applied) or transient DB error.
    return new NextResponse('Demo is not available yet.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
