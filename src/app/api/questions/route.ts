import { NextRequest, NextResponse } from 'next/server';
import { fetchQuestionsForRound } from '@/lib/quiz-assembler';
import { logEvent } from '@/lib/events';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { categoryId, count, excludeIds } = body;

  const questions = await fetchQuestionsForRound(
    categoryId,
    count || 10,
    excludeIds || []
  );

  // The first round of a preview has no exclusions yet — count that as one
  // quiz generation (later rounds of the same preview carry excludeIds).
  if (!excludeIds?.length) {
    await logEvent('quiz_generated', {
      sessionId: request.headers.get('x-quiz-session'),
    });
  }

  return NextResponse.json(questions);
}
