import { NextRequest, NextResponse } from 'next/server';
import { fetchSwapQuestion } from '@/lib/quiz-assembler';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { categoryId, difficulty, roundType, excludeIds } = body;

  const question = await fetchSwapQuestion(
    categoryId,
    difficulty,
    roundType || 'standard',
    excludeIds || []
  );

  if (!question) {
    return NextResponse.json(null, { status: 404 });
  }

  return NextResponse.json(question);
}
