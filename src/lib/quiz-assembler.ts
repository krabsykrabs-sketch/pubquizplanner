import { query } from './db';
import type { Question } from '@/types/quiz';

export async function fetchQuestionsForRound(
  categoryId: number,
  difficulty: number[],
  count: number,
  excludeIds: number[]
): Promise<Question[]> {
  const params: unknown[] = [categoryId, count];
  let paramIndex = 3;

  // Difficulty filter — if all 3 selected, no filter needed
  let difficultyClause = '';
  if (difficulty.length > 0 && difficulty.length < 3) {
    const placeholders = difficulty.map((_, i) => `$${paramIndex + i}`).join(', ');
    difficultyClause = `AND difficulty IN (${placeholders})`;
    params.push(...difficulty);
    paramIndex += difficulty.length;
  }

  // Exclude IDs
  let excludeClause = '';
  if (excludeIds.length > 0) {
    const placeholders = excludeIds.map((_, i) => `$${paramIndex + i}`).join(', ');
    excludeClause = `AND id NOT IN (${placeholders})`;
    params.push(...excludeIds);
  }

  const rows = await query<Question>(
    `SELECT * FROM questions
     WHERE category_id = $1
     AND status = 'approved'
     ${difficultyClause}
     ${excludeClause}
     ORDER BY times_served ASC, RANDOM()
     LIMIT $2`,
    params
  );

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
