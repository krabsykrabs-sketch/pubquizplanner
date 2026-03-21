import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import {
  generateQuestions,
  verifyQuestions,
  webSearchVerify,
  checkDuplicates,
  type GeneratedQuestion,
} from '@/lib/ai-generate';
import type { Category } from '@/types/quiz';

const MAX_RETRY_ROUNDS = 3;

interface QueuedQuestion {
  question: GeneratedQuestion;
  verificationNote: string | null;
}

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
    // Fetch existing questions for duplicate check
    const existingRows = await query<{ text_de: string }>(
      'SELECT text_de FROM questions WHERE category_id = $1 AND status != $2',
      [categoryId, 'rejected']
    );
    const existingTexts = existingRows.map((r) => r.text_de);

    const passed: QueuedQuestion[] = [];
    const flagged: QueuedQuestion[] = [];
    let duplicatesRejected = 0;
    let totalGenerated = 0;

    let remaining = count;
    let round = 0;
    const isLastRound = () => round >= MAX_RETRY_ROUNDS;

    while (remaining > 0 && round < MAX_RETRY_ROUNDS) {
      round++;

      // === Step 1: Generate ===
      const batch = await generateQuestions({
        categoryName: category.name_de,
        count: remaining,
        difficulty: difficulty || 'mixed',
        specialInstructions,
      });
      totalGenerated += batch.length;

      // === Step 2: Self-check (Claude answers blind) ===
      let selfCheckOk = batch;
      const selfCheckFail: { question: GeneratedQuestion; note: string }[] = [];

      try {
        const verifications = await verifyQuestions(batch);
        selfCheckOk = [];
        for (let i = 0; i < batch.length; i++) {
          const v = verifications[i];
          if (v.passed) {
            selfCheckOk.push(batch[i]);
          } else {
            selfCheckFail.push({
              question: batch[i],
              note: `Selbstcheck: Claude antwortete "${v.claudeAnswer}"`,
            });
          }
        }
      } catch (err) {
        console.error(`Self-check failed in round ${round}:`, err);
        // If self-check fails entirely, treat all as passed
      }

      // === Step 3: On last round, flag self-check failures ===
      if (isLastRound()) {
        for (const fail of selfCheckFail) {
          flagged.push({ question: fail.question, verificationNote: fail.note });
        }
      }

      if (selfCheckOk.length === 0) {
        remaining = count - passed.length;
        continue;
      }

      // === Step 4: Web search verification ===
      let webSearchOk = selfCheckOk;
      const webSearchFail: { question: GeneratedQuestion; note: string }[] = [];

      try {
        const webResults = await webSearchVerify(selfCheckOk);
        webSearchOk = [];
        for (let i = 0; i < selfCheckOk.length; i++) {
          const r = webResults[i];
          if (!r || r.correct) {
            webSearchOk.push(selfCheckOk[i]);
          } else {
            webSearchFail.push({
              question: selfCheckOk[i],
              note: `Websuche: ${r.issue || 'Problem gefunden'}`,
            });
          }
        }
      } catch (err) {
        console.error(`Web search verification failed in round ${round}:`, err);
        // If web search fails entirely, treat all as passed
      }

      // === Step 5: On last round, flag web search failures ===
      if (isLastRound()) {
        for (const fail of webSearchFail) {
          flagged.push({ question: fail.question, verificationNote: fail.note });
        }
      }

      if (webSearchOk.length === 0) {
        remaining = count - passed.length;
        continue;
      }

      // === Step 6: Duplicate check ===
      try {
        const allExisting = [
          ...existingTexts,
          ...passed.map((p) => p.question.text_de),
        ];
        const dupResults = await checkDuplicates(webSearchOk, allExisting);
        const deduped: GeneratedQuestion[] = [];
        for (let i = 0; i < webSearchOk.length; i++) {
          const dup = dupResults[i];
          if (dup?.is_duplicate) {
            duplicatesRejected++;
          } else {
            deduped.push(webSearchOk[i]);
          }
        }
        webSearchOk = deduped;
      } catch (err) {
        console.error(`Duplicate check failed in round ${round}:`, err);
        // If dup check fails, keep all
      }

      // === Step 7: Add survivors to passed ===
      for (const q of webSearchOk) {
        passed.push({ question: q, verificationNote: null });
      }

      remaining = count - passed.length;
      if (remaining <= 0) break;
    }

    // === Step 8: Insert into database ===
    let insertedPending = 0;
    for (const { question: q, verificationNote } of passed) {
      await query(
        `INSERT INTO questions
         (category_id, text_de, answer_de, fun_fact_de, difficulty, wrong_answers_de, tags,
          round_type, status, verification_note, generation_batch_id, verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'standard', 'pending', $8, $9, false)`,
        [
          categoryId,
          q.text_de,
          q.answer_de,
          q.fun_fact_de || null,
          q.difficulty,
          q.wrong_answers_de?.length ? q.wrong_answers_de : null,
          q.tags?.length ? q.tags : null,
          verificationNote,
          batchId,
        ]
      );
      insertedPending++;
    }

    let insertedFlagged = 0;
    for (const { question: q, verificationNote } of flagged) {
      await query(
        `INSERT INTO questions
         (category_id, text_de, answer_de, fun_fact_de, difficulty, wrong_answers_de, tags,
          round_type, status, verification_note, generation_batch_id, verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'standard', 'flagged', $8, $9, false)`,
        [
          categoryId,
          q.text_de,
          q.answer_de,
          q.fun_fact_de || null,
          q.difficulty,
          q.wrong_answers_de?.length ? q.wrong_answers_de : null,
          q.tags?.length ? q.tags : null,
          verificationNote,
          batchId,
        ]
      );
      insertedFlagged++;
    }

    return NextResponse.json({
      batchId,
      inserted: insertedPending + insertedFlagged,
      pending: insertedPending,
      flagged: insertedFlagged,
      duplicatesRejected,
      retryRounds: round,
      totalGenerated,
    });
  } catch (err) {
    console.error('Generation error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
