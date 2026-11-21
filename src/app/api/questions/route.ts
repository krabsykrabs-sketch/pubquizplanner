import { NextRequest, NextResponse } from 'next/server';
import { countShown, fetchQuestionsForRound } from '@/lib/quiz-assembler';
import { shouldTrackRequest } from '@/lib/track-guard';
import { logEvent } from '@/lib/events';
import { SOURCE_LOCALE } from '@/config/locales';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { categoryId, count, excludeIds, locale } = body;

  const questions = await fetchQuestionsForRound(
    categoryId,
    count || 10,
    excludeIds || [],
    locale || SOURCE_LOCALE
  );

  // The first round of a preview has no exclusions yet — count that as one
  // quiz generation (later rounds of the same preview carry excludeIds).
  if (!excludeIds?.length) {
    await logEvent('quiz_generated', {
      sessionId: request.headers.get('x-quiz-session'),
    });
  }

  if (shouldTrackRequest(request)) {
    await countShown(questions.map((q) => q.id));
  }

  return NextResponse.json(questions);
}
