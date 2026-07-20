import { NextRequest, NextResponse } from 'next/server';
import { buildCheatSheet } from '@/lib/pdf-builder';
import { query } from '@/lib/db';
import { logEvent } from '@/lib/events';
import { shouldTrackRequest } from '@/lib/track-guard';
import { SOURCE_LOCALE } from '@/config/locales';
import type { AssembledQuiz } from '@/types/quiz';

export async function POST(request: NextRequest) {
  const quiz: AssembledQuiz = await request.json();
  if (shouldTrackRequest(request)) {
    await logEvent('download_cheat_sheet', {
      sessionId: request.headers.get('x-quiz-session'),
      meta: { rounds: quiz.rounds.length },
    });
  }

  const locale = quiz.config?.locale || SOURCE_LOCALE;
  const categories =
    locale === SOURCE_LOCALE
      ? await query<{ id: number; name_de: string }>(
          'SELECT id, name_de FROM categories'
        )
      : await query<{ id: number; name_de: string }>(
          `SELECT c.id, COALESCE(ct.name, c.name_de) AS name_de
           FROM categories c
           LEFT JOIN category_translations ct ON ct.category_id = c.id AND ct.locale = $1`,
          [locale]
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
