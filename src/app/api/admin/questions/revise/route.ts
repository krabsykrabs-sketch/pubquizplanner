import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { reviseQuestion } from '@/lib/ai-generate';
import type { Question } from '@/types/quiz';

// POST { questionId, comment }: persist the owner's review comment and return
// an AI-revised draft (text/answer/fun_fact) based on that guidance. The draft
// is NOT saved automatically — the owner reviews and saves it via the PUT route.
export async function POST(request: NextRequest) {
  const { questionId, comment } = await request.json();

  if (!questionId) {
    return NextResponse.json({ error: 'Missing questionId' }, { status: 400 });
  }
  if (!comment || !comment.trim()) {
    return NextResponse.json({ error: 'Missing comment' }, { status: 400 });
  }

  const question = await queryOne<Question & { category_name: string | null }>(
    `SELECT q.*, c.name_de AS category_name
     FROM questions q LEFT JOIN categories c ON c.id = q.category_id
     WHERE q.id = $1`,
    [questionId]
  );

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  // Persist the guidance so it survives even if the owner doesn't save a draft.
  await queryOne(
    'UPDATE questions SET review_comment = $2, updated_at = NOW() WHERE id = $1 RETURNING id',
    [questionId, comment.trim()]
  );

  try {
    const revised = await reviseQuestion(
      {
        text_de: question.text_de,
        answer_de: question.answer_de,
        fun_fact_de: question.fun_fact_de,
        category_name: question.category_name,
      },
      comment.trim()
    );
    return NextResponse.json(revised);
  } catch (err) {
    console.error('Revise question error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Revise failed' },
      { status: 500 }
    );
  }
}
