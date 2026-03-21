import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { generateCurrentEvents, getCurrentWeek } from '@/lib/ai-generate';
import type { Category } from '@/types/quiz';

export async function POST() {
  // Use allgemeinwissen as default category for current events
  const category = await queryOne<Category>(
    "SELECT * FROM categories WHERE slug = 'allgemeinwissen'"
  );
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 500 });
  }

  const batchId = crypto.randomUUID();
  const week = getCurrentWeek();

  try {
    const questions = await generateCurrentEvents();

    let inserted = 0;
    for (const q of questions) {
      await query(
        `INSERT INTO questions
         (category_id, text_de, answer_de, fun_fact_de, difficulty, wrong_answers_de, tags,
          round_type, status, generation_batch_id, verified,
          is_current_event, current_event_week)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'standard', 'pending', $8, false, true, $9)`,
        [
          category.id,
          q.text_de,
          q.answer_de,
          q.fun_fact_de || null,
          q.difficulty,
          q.wrong_answers_de?.length ? q.wrong_answers_de : null,
          q.tags?.length ? q.tags : null,
          batchId,
          week,
        ]
      );
      inserted++;
    }

    return NextResponse.json({ batchId, inserted, week });
  } catch (err) {
    console.error('Current events generation error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
