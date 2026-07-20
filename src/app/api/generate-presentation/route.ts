import { NextRequest, NextResponse } from 'next/server';
import { buildPresentation } from '@/lib/presentation-builder';
import { logEvent } from '@/lib/events';
import { shouldTrackRequest } from '@/lib/track-guard';
import type { AssembledQuiz } from '@/types/quiz';

export async function POST(request: NextRequest) {
  const quiz: AssembledQuiz = await request.json();
  if (shouldTrackRequest(request)) {
    await logEvent('download_slides', {
      sessionId: request.headers.get('x-quiz-session'),
      meta: { rounds: quiz.rounds.length },
    });
  }
  const html = buildPresentation(quiz);

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': 'attachment; filename="quiz_praesentation.html"',
    },
  });
}
