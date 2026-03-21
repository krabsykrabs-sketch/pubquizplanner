export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Category } from '@/types/quiz';

export async function GET() {
  const categories = await query<Category>(
    'SELECT * FROM categories ORDER BY sort_order, name_de'
  );
  return NextResponse.json(categories);
}
