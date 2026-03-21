import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { generateQuestions, verifyQuestions } from '@/lib/ai-generate';
import type { Category } from '@/types/quiz';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { categoryId, count, difficulty, specialInstructions } = body;

  const category = await queryOne<Category>(
    'SELECT * FROM categories WHERE id = $1',
    [categoryId]
  );
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 400 });
  }

  const batchId = crypto.randomUUID();

  try {
    // Step 1: Generate questions
    const questions = await generateQuestions({
      categoryName: category.name_de,
      count: count || 10,
      difficulty: difficulty || 'mixed',
      specialInstructions,
    });

    // Step 2: Verify questions with a second API call
    let verificationResults;
    try {
      verificationResults = await verifyQuestions(questions);
    } catch (verifyErr) {
      console.error('Verification failed, inserting all as pending:', verifyErr);
      verificationResults = null;
    }

    // Step 3: Insert with status based on verification
    let inserted = 0;
    let flagged = 0;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const verification = verificationResults?.[i];
      const passed = verification?.passed ?? true;
      const status = passed ? 'pending' : 'flagged';
      const verificationNote = !passed && verification
        ? `Claude antwortete: "${verification.claudeAnswer}"`
        : null;

      if (!passed) flagged++;

      await query(
        `INSERT INTO questions
         (category_id, text_de, answer_de, fun_fact_de, difficulty, wrong_answers_de, tags,
          round_type, status, verification_note, generation_batch_id, verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'standard', $8, $9, $10, false)`,
        [
          categoryId,
          q.text_de,
          q.answer_de,
          q.fun_fact_de || null,
          q.difficulty,
          q.wrong_answers_de?.length ? q.wrong_answers_de : null,
          q.tags?.length ? q.tags : null,
          status,
          verificationNote,
          batchId,
        ]
      );
      inserted++;
    }

    return NextResponse.json({ batchId, inserted, flagged });
  } catch (err) {
    console.error('Generation error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
