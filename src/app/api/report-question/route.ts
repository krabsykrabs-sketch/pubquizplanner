import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { logEvent } from '@/lib/events';

// Public "Frage melden" endpoint. Deliberately does NOT change the
// question's status — reports are logged as events and reviewed by the
// admin, so the endpoint can't be abused to empty the question pool.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const questionId = parseInt(body.questionId);
    if (!Number.isInteger(questionId) || questionId <= 0) {
      return NextResponse.json({ error: 'Invalid questionId' }, { status: 400 });
    }

    const exists = await queryOne<{ id: number }>(
      'SELECT id FROM questions WHERE id = $1',
      [questionId]
    );
    if (!exists) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    await logEvent('question_report', {
      sessionId: body.sessionId,
      meta: { questionId },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
