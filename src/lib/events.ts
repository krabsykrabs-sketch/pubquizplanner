import { query } from './db';

export type EventType =
  | 'page_view'
  | 'quiz_generated'
  | 'download_slides'
  | 'download_answer_sheet'
  | 'download_cheat_sheet'
  | 'download_category_pdf'
  | 'question_report';

export const EVENT_TYPES: EventType[] = [
  'page_view',
  'quiz_generated',
  'download_slides',
  'download_answer_sheet',
  'download_cheat_sheet',
  'download_category_pdf',
  'question_report',
];

const SESSION_ID_RE = /^[a-zA-Z0-9-]{8,40}$/;

export function sanitizeSessionId(value: unknown): string | null {
  return typeof value === 'string' && SESSION_ID_RE.test(value) ? value : null;
}

/**
 * Insert an analytics event. Never throws — analytics must not break the
 * feature that emits it.
 */
export async function logEvent(
  type: EventType,
  fields: {
    path?: string | null;
    referrer?: string | null;
    sessionId?: string | null;
    meta?: Record<string, unknown> | null;
  } = {}
): Promise<void> {
  try {
    await query(
      `INSERT INTO events (event_type, path, referrer, session_id, meta)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        type,
        fields.path?.slice(0, 500) ?? null,
        fields.referrer?.slice(0, 500) ?? null,
        sanitizeSessionId(fields.sessionId),
        fields.meta ? JSON.stringify(fields.meta) : null,
      ]
    );
  } catch {
    // swallow — see docstring
  }
}
