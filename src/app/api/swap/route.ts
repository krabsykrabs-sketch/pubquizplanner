import { NextRequest, NextResponse } from 'next/server';
import { fetchSwapQuestion } from '@/lib/quiz-assembler';
import { SOURCE_LOCALE } from '@/config/locales';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { categoryId, excludeIds, locale } = body;

  const question = await fetchSwapQuestion(categoryId, excludeIds || [], locale || SOURCE_LOCALE);

  if (!question) {
    return NextResponse.json(null, { status: 404 });
  }

  return NextResponse.json(question);
}
