import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { logEvent, sanitizeSessionId } from '@/lib/events';
import { isQuizPurpose } from '@/lib/quiz-purpose';
import { shouldTrackRequest } from '@/lib/track-guard';
import { isLocale } from '@/config/locales';

// Anonymous one-click poll answer ("Wofür ist dein Quiz?"). Stores only the
// chosen purpose, the page locale and the per-visit session id that every
// analytics event already carries — nothing personal. One answer per visit;
// bots and the admin's own browser are ignored. Never errors toward the client.
export async function POST(request: NextRequest) {
  try {
    if (!shouldTrackRequest(request)) return new NextResponse(null, { status: 204 });

    const body = await request.json();
    const purpose = body?.purpose;
    const sessionId = sanitizeSessionId(body?.sessionId);
    if (!isQuizPurpose(purpose) || !sessionId) return new NextResponse(null, { status: 204 });

    const already = await queryOne<{ id: number }>(
      `SELECT id FROM events WHERE event_type = 'quiz_purpose' AND session_id = $1 LIMIT 1`,
      [sessionId]
    );
    if (already) return new NextResponse(null, { status: 204 });

    const meta: Record<string, string> = { purpose };
    if (isLocale(body?.locale)) meta.locale = body.locale;
    await logEvent('quiz_purpose', { sessionId, meta });
  } catch {
    // malformed — drop
  }
  return new NextResponse(null, { status: 204 });
}
