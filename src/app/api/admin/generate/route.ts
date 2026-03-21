import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import {
  generateQuestions,
  webSearchVerify,
  checkDuplicates,
} from '@/lib/ai-generate';
import type { Category } from '@/types/quiz';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { categoryId, count: targetCount, difficulty, specialInstructions } = body;

  const category = await queryOne<Category>(
    'SELECT * FROM categories WHERE id = $1',
    [categoryId]
  );
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 400 });
  }

  const batchId = crypto.randomUUID();
  const count = targetCount || 10;

  try {
    // Step 1: Generate questions (1 API call)
    const questions = await generateQuestions({
      categoryName: category.name_de,
      count,
      difficulty: difficulty || 'mixed',
      specialInstructions,
    });

    // Track per-question issues
    const issues: (string | null)[] = new Array(questions.length).fill(null);

    // Step 2: Web search verification (1 API call)
    try {
      const webResults = await webSearchVerify(questions);
      for (let i = 0; i < questions.length; i++) {
        const r = webResults[i];
        if (r && !r.correct) {
          issues[i] = `Websuche: ${r.issue || 'Problem gefunden'}`;
        }
      }
    } catch (err) {
      console.error('Web search verification failed:', err);
    }

    // Step 3: Duplicate check (1 API call)
    const existingRows = await query<{ text_de: string }>(
      'SELECT text_de FROM questions WHERE category_id = $1 AND status != $2',
      [categoryId, 'rejected']
    );
    const existingTexts = existingRows.map((r) => r.text_de);

    let duplicatesRejected = 0;
    const isDuplicate: boolean[] = new Array(questions.length).fill(false);

    try {
      const dupResults = await checkDuplicates(questions, existingTexts);
      for (let i = 0; i < questions.length; i++) {
        if (dupResults[i]?.is_duplicate) {
          isDuplicate[i] = true;
          duplicatesRejected++;
        }
      }
    } catch (err) {
      console.error('Duplicate check failed:', err);
    }

    // Step 4+5: Insert questions
    let insertedPending = 0;
    let insertedFlagged = 0;

    for (let i = 0; i < questions.length; i++) {
      if (isDuplicate[i]) continue;

      const q = questions[i];
      const issue = issues[i];
      const status = issue ? 'flagged' : 'pending';

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
          issue,
          batchId,
        ]
      );

      if (issue) insertedFlagged++;
      else insertedPending++;
    }

    return NextResponse.json({
      batchId,
      inserted: insertedPending + insertedFlagged,
      pending: insertedPending,
      flagged: insertedFlagged,
      duplicatesRejected,
    });
  } catch (err) {
    console.error('Generation error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
