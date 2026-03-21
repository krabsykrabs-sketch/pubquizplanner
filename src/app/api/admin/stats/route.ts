export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const [totalResult, statusResult, categoryResult, recentResult] = await Promise.all([
    query<{ count: string }>('SELECT COUNT(*) as count FROM questions'),
    query<{ status: string; count: string }>(
      'SELECT COALESCE(status, \'approved\') as status, COUNT(*) as count FROM questions GROUP BY status'
    ),
    query<{ name_de: string; icon: string; count: string }>(
      `SELECT c.name_de, c.icon, COUNT(q.id) as count
       FROM categories c LEFT JOIN questions q ON c.id = q.category_id
       GROUP BY c.id, c.name_de, c.icon ORDER BY c.sort_order`
    ),
    query<{ id: number; text_de: string; answer_de: string; status: string; created_at: string }>(
      'SELECT id, text_de, answer_de, status, created_at FROM questions ORDER BY created_at DESC LIMIT 10'
    ),
  ]);

  return NextResponse.json({
    total: parseInt(totalResult[0]?.count ?? '0'),
    byStatus: statusResult.map((r) => ({ status: r.status, count: parseInt(r.count) })),
    byCategory: categoryResult.map((r) => ({ name: r.name_de, icon: r.icon, count: parseInt(r.count) })),
    recent: recentResult,
  });
}
