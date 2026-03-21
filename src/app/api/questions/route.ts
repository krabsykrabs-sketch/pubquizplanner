import { NextRequest, NextResponse } from 'next/server';
import { fetchQuestionsForRound } from '@/lib/quiz-assembler';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { categoryId, difficulty, count, roundType } = body;

  const questions = await fetchQuestionsForRound(
    categoryId,
    difficulty,
    count || 10,
    roundType || 'standard',
    []
  );

  return NextResponse.json(questions);
}
