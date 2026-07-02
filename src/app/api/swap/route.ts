import { NextRequest, NextResponse } from 'next/server';
import { fetchSwapQuestion } from '@/lib/quiz-assembler';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { categoryId, excludeIds, locale } = body;

  const question = await fetchSwapQuestion(categoryId, excludeIds || [], locale || 'de');

  if (!question) {
    return NextResponse.json(null, { status: 404 });
  }

  return NextResponse.json(question);
}
