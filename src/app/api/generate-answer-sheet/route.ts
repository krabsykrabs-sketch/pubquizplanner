import { NextRequest, NextResponse } from 'next/server';
import { buildAnswerSheet } from '@/lib/pdf-builder';
import type { AssembledQuiz } from '@/types/quiz';

export async function POST(request: NextRequest) {
  const quiz: AssembledQuiz = await request.json();
  const pdfBuffer = buildAnswerSheet(quiz);
  const uint8 = new Uint8Array(pdfBuffer);

  return new NextResponse(uint8, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="antwortbogen.pdf"',
    },
  });
}
