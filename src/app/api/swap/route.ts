import { NextRequest, NextResponse } from 'next/server';
import { countShown, countSwap, fetchSwapQuestion } from '@/lib/quiz-assembler';
import { shouldTrackRequest } from '@/lib/track-guard';
import { SOURCE_LOCALE } from '@/config/locales';
import { sanitizeSessionId } from '@/lib/events';
import { SWAPS_COUNTED_PER_VISIT } from '@/lib/generator-events';

// Swaps counted per visit, in memory (one app container; a restart just
// starts fresh, which only makes the cap more lenient for a moment).
const swapsPerVisit = new Map<string, number>();

function withinSwapBudget(sessionId: string | null): boolean {
  if (!sessionId) return false; // old cached clients / scripts: not counted
  const used = swapsPerVisit.get(sessionId) ?? 0;
  if (used >= SWAPS_COUNTED_PER_VISIT) return false;
  if (swapsPerVisit.size > 20000) swapsPerVisit.clear();
  swapsPerVisit.set(sessionId, used + 1);
  return true;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { categoryId, excludeIds, locale, replacedId, sessionId } = body;

  const question = await fetchSwapQuestion(categoryId, excludeIds || [], locale || SOURCE_LOCALE);

  if (!question) {
    return NextResponse.json(null, { status: 404 });
  }

  // Quality signal: the question the visitor swapped out. Only counted when
  // it was actually part of their quiz (it is always in excludeIds), so the
  // endpoint can't be used to inflate arbitrary questions. Only the first
  // SWAPS_COUNTED_PER_VISIT swaps of a visit count.
  if (shouldTrackRequest(request) && withinSwapBudget(sanitizeSessionId(sessionId))) {
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
