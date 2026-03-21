import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { generateQuestions } from '@/lib/ai-generate';
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
    const questions = await generateQuestions({
      categoryName: category.name_de,
      count: count || 10,
      difficulty: difficulty || 'mixed',
      specialInstructions,
    });

    let inserted = 0;
    for (const q of questions) {
      await query(
        `INSERT INTO questions
         (category_id, text_de, answer_de, fun_fact_de, difficulty, wrong_answers_de, tags, round_type, status, generation_batch_id, verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'standard', 'pending', $8, false)`,
        [
          categoryId,
          q.text_de,
          q.answer_de,
          q.fun_fact_de || null,
          q.difficulty,
          q.wrong_answers_de?.length ? q.wrong_answers_de : null,
          q.tags?.length ? q.tags : null,
          batchId,
        ]
      );
      inserted++;
    }

    return NextResponse.json({ batchId, inserted });
  } catch (err) {
    console.error('Generation error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
