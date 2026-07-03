export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Category } from '@/types/quiz';
import { SOURCE_LOCALE, MIN_QUESTIONS_PER_CATEGORY as MIN_QUESTIONS } from '@/config/locales';

// Only categories with enough approved (and, for non-German locales,
// translated) questions to fill a round. The localized name is aliased
// onto name_de so clients stay locale-agnostic.
export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get('locale') || SOURCE_LOCALE;

  const categories =
    locale === SOURCE_LOCALE
      ? await query<Category & { question_count: number }>(
          `SELECT c.*, COUNT(q.id)::int AS question_count
           FROM categories c
           JOIN questions q ON q.category_id = c.id AND q.status = 'approved'
           GROUP BY c.id
           HAVING COUNT(q.id) >= $1
           ORDER BY c.sort_order, c.name_de`,
          [MIN_QUESTIONS]
        )
      : await query<Category & { question_count: number }>(
          `SELECT c.id, c.slug, ct.name AS name_de, c.icon, c.sort_order,
                  COUNT(q.id)::int AS question_count
           FROM categories c
           JOIN category_translations ct ON ct.category_id = c.id AND ct.locale = $2
           JOIN questions q ON q.category_id = c.id AND q.status = 'approved'
           JOIN question_translations t
             ON t.question_id = q.id AND t.locale = $2 AND t.status IN ('machine', 'reviewed')
           GROUP BY c.id, ct.name
           HAVING COUNT(q.id) >= $1
           ORDER BY c.sort_order, ct.name`,
          [MIN_QUESTIONS, locale]
        );

  return NextResponse.json(categories);
}
