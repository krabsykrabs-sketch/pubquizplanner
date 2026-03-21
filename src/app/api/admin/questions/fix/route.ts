import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { fixQuestion } from '@/lib/ai-generate';
import type { Question } from '@/types/quiz';

export async function POST(request: NextRequest) {
  const { questionId } = await request.json();

  if (!questionId) {
    return NextResponse.json({ error: 'Missing questionId' }, { status: 400 });
  }

  const question = await queryOne<Question>(
    'SELECT * FROM questions WHERE id = $1',
    [questionId]
  );

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  if (!question.verification_note) {
    return NextResponse.json({ error: 'No verification note to fix' }, { status: 400 });
  }

  try {
    const fixed = await fixQuestion(
      {
        text_de: question.text_de,
        answer_de: question.answer_de,
        fun_fact_de: question.fun_fact_de,
        wrong_answers_de: question.wrong_answers_de,
      },
      question.verification_note
    );

    return NextResponse.json(fixed);
  } catch (err) {
    console.error('Fix question error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Fix failed' },
      { status: 500 }
    );
  }
}
