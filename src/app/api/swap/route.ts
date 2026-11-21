import { NextRequest, NextResponse } from 'next/server';
import { countShown, countSwap, fetchSwapQuestion } from '@/lib/quiz-assembler';
import { shouldTrackRequest } from '@/lib/track-guard';
import { SOURCE_LOCALE } from '@/config/locales';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { categoryId, excludeIds, locale, replacedId } = body;

  const question = await fetchSwapQuestion(categoryId, excludeIds || [], locale || SOURCE_LOCALE);

  if (!question) {
    return NextResponse.json(null, { status: 404 });
  }

  // Quality signal: the question the visitor swapped out. Only counted when
  // it was actually part of their quiz (it is always in excludeIds), so the
  // endpoint can't be used to inflate arbitrary questions.
  if (shouldTrackRequest(request)) {
    await countShown([question.id]);
    const replaced = Number(replacedId);
    if (
      Number.isInteger(replaced) &&
      replaced > 0 &&
      Array.isArray(excludeIds) &&
      excludeIds.includes(replaced)
    ) {
      await countSwap(replaced);
    }
  }

  return NextResponse.json(question);
}
