import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ExampleQuestion } from '@/types/quiz';

export async function GET(request: NextRequest) {
  const categoryId = request.nextUrl.searchParams.get('categoryId');

  if (!categoryId) {
    return NextResponse.json([]);
  }

  const examples = await query<ExampleQuestion>(
    'SELECT * FROM example_questions WHERE category_id = $1 ORDER BY difficulty',
    [parseInt(categoryId)]
  );

  return NextResponse.json(examples);
}
