import { NextRequest, NextResponse } from 'next/server';
import { buildAnswerSheet } from '@/lib/pdf-builder';
import { logEvent } from '@/lib/events';
import type { AssembledQuiz } from '@/types/quiz';

export async function POST(request: NextRequest) {
  const quiz: AssembledQuiz = await request.json();
  await logEvent('download_answer_sheet', {
    sessionId: request.headers.get('x-quiz-session'),
    meta: { rounds: quiz.rounds.length },
  });
  const pdfBuffer = buildAnswerSheet(quiz);
  const uint8 = new Uint8Array(pdfBuffer);

  return new NextResponse(uint8, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="antwortbogen.pdf"',
    },
  });
}
