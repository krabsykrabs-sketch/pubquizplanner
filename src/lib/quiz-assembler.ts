import { query } from './db';
import type { Question } from '@/types/quiz';

// categoryId <= 0 means "Gemischt": draw from all categories.
export async function fetchQuestionsForRound(
  categoryId: number,
  difficulty: number[],
  count: number,
  excludeIds: number[]
): Promise<Question[]> {
  const conditions: string[] = [`status = 'approved'`];
  const params: unknown[] = [count];
  let paramIndex = 2;

  if (categoryId > 0) {
    conditions.push(`category_id = $${paramIndex++}`);
    params.push(categoryId);
  }

  // Difficulty filter — if all 3 selected, no filter needed
  if (difficulty.length > 0 && difficulty.length < 3) {
    const placeholders = difficulty.map(() => `$${paramIndex++}`).join(', ');
    conditions.push(`difficulty IN (${placeholders})`);
    params.push(...difficulty);
  }

  if (excludeIds.length > 0) {
    const placeholders = excludeIds.map(() => `$${paramIndex++}`).join(', ');
    conditions.push(`id NOT IN (${placeholders})`);
    params.push(...excludeIds);
  }

  const rows = await query<Question>(
    `SELECT * FROM questions
     WHERE ${conditions.join(' AND ')}
     ORDER BY times_served ASC, RANDOM()
     LIMIT $1`,
    params
  );

  // Rotate the pool: least-served questions are preferred above, so
  // counting every serve spreads usage across the whole inventory.
  if (rows.length > 0) {
    await query(
      'UPDATE questions SET times_served = times_served + 1 WHERE id = ANY($1)',
      [rows.map((r) => r.id)]
    ).catch(() => {});
  }

  return rows;
}

export async function fetchSwapQuestion(
  categoryId: number,
  difficulty: number[],
  excludeIds: number[]
): Promise<Question | null> {
  const questions = await fetchQuestionsForRound(
    categoryId,
    difficulty,
    1,
    excludeIds
  );
  return questions[0] || null;
}
