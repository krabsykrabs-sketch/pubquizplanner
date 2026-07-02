import { NextRequest, NextResponse } from 'next/server';
import { buildCheatSheet } from '@/lib/pdf-builder';
import { query } from '@/lib/db';
import { logEvent } from '@/lib/events';
import type { AssembledQuiz } from '@/types/quiz';

export async function POST(request: NextRequest) {
  const quiz: AssembledQuiz = await request.json();
  await logEvent('download_cheat_sheet', {
    sessionId: request.headers.get('x-quiz-session'),
    meta: { rounds: quiz.rounds.length },
  });

  const categories = await query<{ id: number; name_de: string }>(
    'SELECT id, name_de FROM categories'
  );
  const categoryNames = Object.fromEntries(
    categories.map((c) => [c.id, c.name_de])
  );

  const pdfBuffer = buildCheatSheet(quiz, categoryNames);
  const uint8 = new Uint8Array(pdfBuffer);

  return new NextResponse(uint8, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="spickzettel.pdf"',
    },
  });
}
