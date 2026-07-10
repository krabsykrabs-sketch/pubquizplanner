import { query } from './db';
import type { Question } from '@/types/quiz';
import { SOURCE_LOCALE } from '@/config/locales';

// German serves the source columns directly. For other locales the translated
// content is aliased onto the *_de fields so all downstream code stays
// locale-agnostic.

// categoryId <= 0 means "Gemischt": draw from all categories.
export async function fetchQuestionsForRound(
  categoryId: number,
  count: number,
  excludeIds: number[],
  locale: string = SOURCE_LOCALE
): Promise<Question[]> {
  const translated = locale !== SOURCE_LOCALE;
  const conditions: string[] = [`q.status = 'approved'`];
  const params: unknown[] = [count];
  let paramIndex = 2;

  let joinClause = '';
  let selectClause = 'q.*';
  if (translated) {
    joinClause = `JOIN question_translations t
      ON t.question_id = q.id AND t.locale = $${paramIndex++} AND t.status IN ('machine', 'reviewed')`;
    params.push(locale);
    // Aliases after q.* override the source columns in the result object.
    selectClause = 'q.*, t.text AS text_de, t.answer AS answer_de, t.fun_fact AS fun_fact_de';
  }

  if (categoryId > 0) {
    conditions.push(`q.category_id = $${paramIndex++}`);
    params.push(categoryId);
  }

  if (excludeIds.length > 0) {
    const placeholders = excludeIds.map(() => `$${paramIndex++}`).join(', ');
    conditions.push(`q.id NOT IN (${placeholders})`);
    params.push(...excludeIds);
  }

  const rows = await query<Question>(
    `SELECT ${selectClause} FROM questions q
     ${joinClause}
     WHERE ${conditions.join(' AND ')}
     ORDER BY q.times_served / 5 ASC, RANDOM()
     LIMIT $1`,
    params
  );

  // Rotate the pool in coarse buckets of 5 serves: usage still spreads across
  // the whole inventory long-term, but within a bucket selection is uniformly
  // random — so a freshly imported batch (times_served = 0) blends in with
  // everything under 5 serves instead of flooding every new quiz until it
  // catches up (integer division; times_served is an int column).
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
  excludeIds: number[],
  locale?: string
): Promise<Question | null> {
  const questions = await fetchQuestionsForRound(categoryId, 1, excludeIds, locale);
  return questions[0] || null;
}
