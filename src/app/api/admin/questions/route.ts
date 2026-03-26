export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import type { Question } from '@/types/quiz';

// GET: List questions with filters, search, pagination
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '50');
  const offset = (page - 1) * limit;
  const categoryId = params.get('categoryId');
  const difficulty = params.get('difficulty');
  const status = params.get('status');
  const verified = params.get('verified');
  const search = params.get('search');
  const batchId = params.get('batchId');
  const currentEvents = params.get('currentEvents');
  const sortBy = params.get('sortBy') || 'created_at';
  const sortOrder = params.get('sortOrder') === 'asc' ? 'ASC' : 'DESC';

  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (categoryId) {
    conditions.push(`q.category_id = $${paramIndex++}`);
    values.push(parseInt(categoryId));
  }
  if (difficulty) {
    conditions.push(`q.difficulty = $${paramIndex++}`);
    values.push(parseInt(difficulty));
  }
  if (status) {
    const statuses = status.split(',').map((s) => s.trim()).filter(Boolean);
    if (statuses.length === 1) {
      conditions.push(`q.status = $${paramIndex++}`);
      values.push(statuses[0]);
    } else {
      const placeholders = statuses.map((_, i) => `$${paramIndex + i}`).join(', ');
      conditions.push(`q.status IN (${placeholders})`);
      values.push(...statuses);
      paramIndex += statuses.length;
    }
  }
  if (verified) {
    conditions.push(`q.verified = $${paramIndex++}`);
    values.push(verified === 'true');
  }
  if (search) {
    conditions.push(`(q.text_de ILIKE $${paramIndex} OR q.answer_de ILIKE $${paramIndex})`);
    values.push(`%${search}%`);
    paramIndex++;
  }
  if (batchId) {
    conditions.push(`q.generation_batch_id = $${paramIndex++}`);
    values.push(batchId);
  }
  if (currentEvents === 'true') {
    conditions.push('q.is_current_event = true');
  }
  const highlight = params.get('highlight');
  if (highlight === 'true') {
    conditions.push('q.is_highlight = true');
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  const allowedSorts = ['created_at', 'difficulty', 'times_served', 'id', 'status'];
  const safeSort = allowedSorts.includes(sortBy) ? sortBy : 'created_at';

  const [rows, countResult] = await Promise.all([
    query<Question & { category_name: string; category_icon: string }>(
      `SELECT q.*, c.name_de as category_name, c.icon as category_icon
       FROM questions q
       LEFT JOIN categories c ON q.category_id = c.id
       ${whereClause}
       ORDER BY q.${safeSort} ${sortOrder}
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...values, limit, offset]
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) as count FROM questions q ${whereClause}`,
      values
    ),
  ]);

  return NextResponse.json({
    questions: rows,
    total: parseInt(countResult[0]?.count ?? '0'),
    page,
    limit,
  });
}

// POST: Create a new question
export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await query<Question>(
    `INSERT INTO questions
     (category_id, text_de, answer_de, fun_fact_de, difficulty, wrong_answers_de, tags, round_type, status, verified)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      body.category_id,
      body.text_de,
      body.answer_de,
      body.fun_fact_de || null,
      body.difficulty,
      body.wrong_answers_de?.length ? body.wrong_answers_de : null,
      body.tags?.length ? body.tags : null,
      body.round_type || 'standard',
      body.status || 'approved',
      body.verified ?? true,
    ]
  );
  return NextResponse.json(result[0], { status: 201 });
}

// PUT: Update a question
export async function PUT(request: NextRequest) {
  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: 'Missing question id' }, { status: 400 });
  }

  const result = await queryOne<Question>(
    `UPDATE questions SET
      category_id = COALESCE($2, category_id),
      text_de = COALESCE($3, text_de),
      answer_de = COALESCE($4, answer_de),
      fun_fact_de = $5,
      difficulty = COALESCE($6, difficulty),
      wrong_answers_de = $7,
      tags = $8,
      status = COALESCE($9, status),
      verified = COALESCE($10, verified),
      round_type = COALESCE($11, round_type),
      is_highlight = COALESCE($12, is_highlight),
      updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      body.id,
      body.category_id,
      body.text_de,
      body.answer_de,
      body.fun_fact_de ?? null,
      body.difficulty,
      body.wrong_answers_de?.length ? body.wrong_answers_de : null,
      body.tags?.length ? body.tags : null,
      body.status,
      body.verified,
      body.round_type,
      body.is_highlight ?? null,
    ]
  );

  if (!result) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }
  return NextResponse.json(result);
}

// DELETE: Delete a question
export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing question id' }, { status: 400 });
  }
  await query('DELETE FROM questions WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
}
