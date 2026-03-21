import { NextRequest, NextResponse } from 'next/server';
import { buildPresentation } from '@/lib/presentation-builder';
import type { AssembledQuiz } from '@/types/quiz';

export async function POST(request: NextRequest) {
  const quiz: AssembledQuiz = await request.json();
  const html = buildPresentation(quiz);

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': 'attachment; filename="quiz_praesentation.html"',
    },
  });
}
