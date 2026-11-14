import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { logEvent, sanitizeSessionId } from '@/lib/events';
import { cleanGeneratorEvent, MAX_GENERATOR_EVENTS_PER_SESSION } from '@/lib/generator-events';
import { shouldTrackRequest } from '@/lib/track-guard';

// Anonymous generator funnel beacon: which step a visit reached, what it
// changed, whether downloads were clicked/failed, how long it stayed. Only an
// allow-listed action + a few small enums/numbers are stored, tied to the
// per-visit session id every analytics event already carries. Never errors
// toward the client.
export async function POST(request: NextRequest) {
  try {
    if (!shouldTrackRequest(request)) return new NextResponse(null, { status: 204 });
    const body = await request.json();
    const sessionId = sanitizeSessionId(body?.sessionId);
    const ev = cleanGeneratorEvent(body?.action, body?.meta);
    if (!sessionId || !ev) return new NextResponse(null, { status: 204 });

    const row = await queryOne<{ n: number }>(
      `SELECT count(*)::int AS n FROM events
       WHERE event_type = 'generator_action' AND session_id = $1`,
      [sessionId]
    );
    if ((row?.n ?? 0) >= MAX_GENERATOR_EVENTS_PER_SESSION) {
      return new NextResponse(null, { status: 204 });
    }
    await logEvent('generator_action', { sessionId, meta: ev.meta });
  } catch {
    // malformed — drop
  }
  return new NextResponse(null, { status: 204 });
}
