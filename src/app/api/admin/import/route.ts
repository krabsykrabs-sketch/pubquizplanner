import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import type { Category } from '@/types/quiz';

interface ImportQuestion {
  text_de: string;
  answer_de: string;
  wrong_answers_de?: string[];
  fun_fact_de?: string;
  difficulty?: number;
  tags?: string[];
  skip?: boolean;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { categoryId, questions } = body as { categoryId: number; questions: ImportQuestion[] };

  if (!categoryId || !Array.isArray(questions)) {
    return NextResponse.json({ error: 'Missing categoryId or questions array' }, { status: 400 });
  }

  const category = await queryOne<Category>('SELECT * FROM categories WHERE id = $1', [categoryId]);
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 400 });
  }

  const batchId = `import-${category.slug}-${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 8)}`;
  let inserted = 0;
  let skipped = 0;
  let skippedFlag = 0;

  for (const q of questions) {
    if (q.skip) {
      skippedFlag++;
      continue;
    }

    if (!q.text_de || !q.answer_de) {
      skipped++;
      continue;
    }

    const existing = await query<{ id: number }>(
      'SELECT id FROM questions WHERE text_de = $1 AND category_id = $2 LIMIT 1',
      [q.text_de, categoryId]
    );
    if (existing.length > 0) {
      skipped++;
      continue;
    }

    const tags = [...(q.tags || [])];
    if (!tags.includes('opentdb')) tags.push('opentdb');

    await query(
      `INSERT INTO questions
       (category_id, text_de, answer_de, wrong_answers_de, fun_fact_de, difficulty,
        tags, round_type, status, generation_batch_id, verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'standard', 'pending', $8, false)`,
      [
        categoryId,
        q.text_de,
        q.answer_de,
        q.wrong_answers_de?.length ? q.wrong_answers_de : null,
        q.fun_fact_de || null,
        q.difficulty || 2,
        tags,
        batchId,
      ]
    );
    inserted++;
  }

  return NextResponse.json({ inserted, skipped, skippedFlag, batchId });
}
