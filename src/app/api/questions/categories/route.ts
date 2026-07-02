export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Category } from '@/types/quiz';

const MIN_QUESTIONS = 30;

// Only categories with enough approved questions to fill a round.
export async function GET() {
  const categories = await query<Category & { question_count: number }>(
    `SELECT c.*, COUNT(q.id)::int AS question_count
     FROM categories c
     JOIN questions q ON q.category_id = c.id AND q.status = 'approved'
     GROUP BY c.id
     HAVING COUNT(q.id) >= $1
     ORDER BY c.sort_order, c.name_de`,
    [MIN_QUESTIONS]
  );
  return NextResponse.json(categories);
}
