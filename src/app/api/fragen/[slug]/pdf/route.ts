import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { query, queryOne } from '@/lib/db';
import { logEvent, sanitizeSessionId } from '@/lib/events';
import { shouldTrackRequest } from '@/lib/track-guard';
import { buildQuestionSheet, type QuestionSheetItem } from '@/lib/pdf-builder';
import {
  SOURCE_LOCALE,
  isLocale,
  MIN_QUESTIONS_PER_CATEGORY as MIN_QUESTIONS,
} from '@/config/locales';

export const dynamic = 'force-dynamic';

// Public "Quizfragen mit Lösungen zum Ausdrucken" download for a category.
// Reuses the same visibility rules as the category page (source locale reads
// the *_de columns; other locales read reviewed/machine translations, and the
// category must clear the min-questions threshold) so we never emit a PDF for
// a page that isn't itself live.
export async function GET(
  request: NextRequest,
  { params: { slug } }: { params: { slug: string } }
) {
  const localeParam = request.nextUrl.searchParams.get('locale');
  const locale = isLocale(localeParam) ? localeParam : SOURCE_LOCALE;

  const category =
    locale === SOURCE_LOCALE
      ? await queryOne<{ name_de: string; count: number }>(
          `SELECT c.name_de, COUNT(q.id)::int AS count
           FROM categories c
           JOIN questions q ON q.category_id = c.id
           WHERE c.slug = $1 AND q.status = 'approved'
           GROUP BY c.id
           HAVING COUNT(q.id) >= $2`,
          [slug, MIN_QUESTIONS]
        )
      : await queryOne<{ name_de: string; count: number }>(
          `SELECT ct.name AS name_de, COUNT(q.id)::int AS count
           FROM categories c
           JOIN category_translations ct ON ct.category_id = c.id AND ct.locale = $3
           JOIN questions q ON q.category_id = c.id AND q.status = 'approved'
           JOIN question_translations t ON t.question_id = q.id
             AND t.locale = $3 AND t.status IN ('machine', 'reviewed')
           WHERE c.slug = $1
           GROUP BY c.id, ct.name
           HAVING COUNT(q.id) >= $2`,
          [slug, MIN_QUESTIONS, locale]
        );

  if (!category) {
    return new NextResponse('Not found', { status: 404 });
  }

  const items =
    locale === SOURCE_LOCALE
      ? await query<QuestionSheetItem>(
          `SELECT q.text_de, q.answer_de, q.fun_fact_de
           FROM questions q
           JOIN categories c ON c.id = q.category_id
           WHERE c.slug = $1 AND q.status = 'approved'
           ORDER BY q.id ASC`,
          [slug]
        )
      : await query<QuestionSheetItem>(
          `SELECT t.text AS text_de, t.answer AS answer_de, t.fun_fact AS fun_fact_de
           FROM questions q
           JOIN categories c ON c.id = q.category_id
           JOIN question_translations t ON t.question_id = q.id
             AND t.locale = $2 AND t.status IN ('machine', 'reviewed')
           WHERE c.slug = $1 AND q.status = 'approved'
           ORDER BY q.id ASC`,
          [slug, locale]
        );

  // This endpoint is a plain <a href> on public pages, so crawlers hit it too
  // and the browser can't send custom headers — the session travels as ?sid=
  // (attached client-side on click) with the header as fallback.
  if (shouldTrackRequest(request)) {
    await logEvent('download_category_pdf', {
      sessionId:
        sanitizeSessionId(request.nextUrl.searchParams.get('sid')) ??
        request.headers.get('x-quiz-session'),
      meta: { slug, locale, count: items.length },
    });
  }

  const t = await getTranslations({ locale, namespace: 'fragen' });
  const pdf = buildQuestionSheet({
    title: t('pdfDocTitle', { name: category.name_de }),
    subtitle: t('pdfDocSubtitle', { count: items.length }),
    items,
    locale,
  });

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${slug}-quizfragen.pdf"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
