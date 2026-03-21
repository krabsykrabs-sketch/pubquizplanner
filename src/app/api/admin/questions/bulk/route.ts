import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, ids, batchId } = body;

  if (!action || (!ids?.length && !batchId)) {
    return NextResponse.json({ error: 'Missing action or target' }, { status: 400 });
  }

  const statusMap: Record<string, { status: string; verified: boolean }> = {
    approve: { status: 'approved', verified: true },
    reject: { status: 'rejected', verified: false },
  };

  const target = statusMap[action];
  if (!target) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  let affected: { count: string }[];

  if (batchId) {
    affected = await query<{ count: string }>(
      `UPDATE questions SET status = $1, verified = $2, updated_at = NOW()
       WHERE generation_batch_id = $3 AND status = 'pending'
       RETURNING id`,
      [target.status, target.verified, batchId]
    );
  } else {
    const placeholders = ids.map((_: number, i: number) => `$${i + 3}`).join(', ');
    affected = await query<{ count: string }>(
      `UPDATE questions SET status = $1, verified = $2, updated_at = NOW()
       WHERE id IN (${placeholders})
       RETURNING id`,
      [target.status, target.verified, ...ids]
    );
  }

  return NextResponse.json({ updated: affected.length });
}
