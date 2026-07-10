export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Aggregated analytics for the admin dashboard. Protected by the admin
// middleware (all /api/admin routes require the auth cookie).
export async function GET(request: NextRequest) {
  const rawDays = parseInt(request.nextUrl.searchParams.get('days') || '30');
  // days = 0 → all time; anything malformed falls back to 30.
  const days = Number.isFinite(rawDays) && rawDays >= 0 ? Math.min(rawDays, 3650) : 30;
  const since = days > 0 ? `NOW() - INTERVAL '${days} days'` : `'epoch'::timestamptz`;
  // Continuous day axis for the chart: from the range start (or the first
  // event ever, for all-time) through today, so quiet days appear as zeroes.
  const seriesStart =
    days > 0
      ? `date_trunc('day', ${since})`
      : `date_trunc('day', (SELECT coalesce(min(created_at), now()) FROM events))`;

  const [totals, daily, topPages, entryPages, referrers, countries, transitions, funnel, reports] =
    await Promise.all([
      query<{
        pageviews: string;
        sessions: string;
        generated: string;
        dl_slides: string;
        dl_sheet: string;
        dl_cheat: string;
        dl_category: string;
      }>(
        `SELECT
           count(*) FILTER (WHERE event_type = 'page_view') AS pageviews,
           count(DISTINCT session_id) FILTER (WHERE event_type = 'page_view' AND session_id IS NOT NULL) AS sessions,
           count(*) FILTER (WHERE event_type = 'quiz_generated') AS generated,
           count(*) FILTER (WHERE event_type = 'download_slides') AS dl_slides,
           count(*) FILTER (WHERE event_type = 'download_answer_sheet') AS dl_sheet,
           count(*) FILTER (WHERE event_type = 'download_cheat_sheet') AS dl_cheat,
           count(*) FILTER (WHERE event_type = 'download_category_pdf') AS dl_category
         FROM events WHERE created_at >= ${since}`
      ),
      query<{ day: string; pageviews: string; sessions: string; generated: string; downloads: string }>(
        `WITH agg AS (
           SELECT date_trunc('day', created_at) AS day,
                  count(*) FILTER (WHERE event_type = 'page_view') AS pageviews,
                  count(DISTINCT session_id) FILTER (WHERE event_type = 'page_view' AND session_id IS NOT NULL) AS sessions,
                  count(*) FILTER (WHERE event_type = 'quiz_generated') AS generated,
                  count(*) FILTER (WHERE event_type LIKE 'download%') AS downloads
           FROM events WHERE created_at >= ${since}
           GROUP BY 1
         )
         SELECT to_char(r.day, 'YYYY-MM-DD') AS day,
                coalesce(a.pageviews, 0)::text AS pageviews,
                coalesce(a.sessions, 0)::text AS sessions,
                coalesce(a.generated, 0)::text AS generated,
                coalesce(a.downloads, 0)::text AS downloads
         FROM generate_series(${seriesStart}, date_trunc('day', now()), interval '1 day') AS r(day)
         LEFT JOIN agg a ON a.day = r.day
         ORDER BY 1`
      ),
      query<{ path: string; views: string; sessions: string }>(
        `SELECT path, count(*) AS views,
                count(DISTINCT session_id) AS sessions
         FROM events
         WHERE event_type = 'page_view' AND created_at >= ${since}
         GROUP BY path ORDER BY count(*) DESC LIMIT 200`
      ),
      query<{ path: string; entries: string }>(
        `SELECT path, count(*) AS entries FROM (
           SELECT DISTINCT ON (session_id) path
           FROM events
           WHERE event_type = 'page_view' AND session_id IS NOT NULL AND created_at >= ${since}
           ORDER BY session_id, created_at
         ) firsts GROUP BY path ORDER BY count(*) DESC LIMIT 200`
      ),
      query<{ referrer: string; count: string }>(
        // Grouped by host so google.com doesn't appear once per search URL.
        // Self-traffic (this site, localhost dev environments) is excluded.
        `SELECT coalesce(lower(substring(referrer from '^[a-zA-Z][a-zA-Z0-9+.-]*://([^/]+)')), referrer) AS referrer,
                count(*) AS count
         FROM events
         WHERE event_type = 'page_view' AND created_at >= ${since}
           AND referrer IS NOT NULL AND referrer <> ''
           AND referrer NOT LIKE '/%'
           AND referrer NOT LIKE '%pubquizplanner%'
           AND referrer !~* '//(localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0|\\[::1\\])([:/]|$)'
         GROUP BY 1 ORDER BY count(*) DESC LIMIT 200`
      ),
      // Visitor countries, approximated from the Accept-Language region that
      // /api/track stores in meta. Only events since that deploy carry it.
      query<{ country: string; views: string; sessions: string }>(
        `SELECT upper(meta->>'country') AS country,
                count(*) AS views,
                count(DISTINCT session_id) AS sessions
         FROM events
         WHERE event_type = 'page_view' AND created_at >= ${since}
           AND meta->>'country' ~* '^[a-z]{2}$'
         GROUP BY 1 ORDER BY count(*) DESC LIMIT 200`
      ),
      query<{ from_path: string; to_path: string; count: string }>(
        `SELECT from_path, to_path, count(*) AS count FROM (
           SELECT LAG(path) OVER (PARTITION BY session_id ORDER BY created_at) AS from_path,
                  path AS to_path
           FROM events
           WHERE event_type = 'page_view' AND session_id IS NOT NULL AND created_at >= ${since}
         ) t
         WHERE from_path IS NOT NULL AND from_path <> to_path
         GROUP BY from_path, to_path ORDER BY count(*) DESC LIMIT 200`
      ),
      query<{ sessions: string; generator_sessions: string; generated_sessions: string; download_sessions: string }>(
        `SELECT
           count(DISTINCT session_id) FILTER (WHERE event_type = 'page_view') AS sessions,
           count(DISTINCT session_id) FILTER (WHERE event_type = 'page_view' AND path LIKE '%/generator%') AS generator_sessions,
           count(DISTINCT session_id) FILTER (WHERE event_type = 'quiz_generated') AS generated_sessions,
           count(DISTINCT session_id) FILTER (WHERE event_type LIKE 'download%') AS download_sessions
         FROM events
         WHERE session_id IS NOT NULL AND created_at >= ${since}`
      ),
      query<{ question_id: string; reports: string; last_report: string; text_de: string | null; answer_de: string | null }>(
        `SELECT (e.meta->>'questionId')::int AS question_id,
                count(*) AS reports,
                to_char(max(e.created_at), 'YYYY-MM-DD') AS last_report,
                q.text_de, q.answer_de
         FROM events e
         LEFT JOIN questions q ON q.id = (e.meta->>'questionId')::int
         WHERE e.event_type = 'question_report' AND e.created_at >= ${since}
         GROUP BY 1, q.text_de, q.answer_de
         ORDER BY count(*) DESC, max(e.created_at) DESC
         LIMIT 100`
      ),
    ]);

  const n = (v: string | undefined) => parseInt(v ?? '0');
  const t = totals[0];
  const f = funnel[0];

  return NextResponse.json({
    totals: {
      pageviews: n(t?.pageviews),
      sessions: n(t?.sessions),
      generated: n(t?.generated),
      downloads: {
        slides: n(t?.dl_slides),
        answerSheet: n(t?.dl_sheet),
        cheatSheet: n(t?.dl_cheat),
        categoryPdf: n(t?.dl_category),
      },
    },
    daily: daily.map((d) => ({
      day: d.day,
      pageviews: n(d.pageviews),
      sessions: n(d.sessions),
      generated: n(d.generated),
      downloads: n(d.downloads),
    })),
    topPages: topPages.map((p) => ({ path: p.path, views: n(p.views), sessions: n(p.sessions) })),
    entryPages: entryPages.map((p) => ({ path: p.path, entries: n(p.entries) })),
    referrers: referrers.map((r) => ({ referrer: r.referrer, count: n(r.count) })),
    countries: countries.map((c) => ({
      country: c.country,
      views: n(c.views),
      sessions: n(c.sessions),
    })),
    transitions: transitions.map((tr) => ({ from: tr.from_path, to: tr.to_path, count: n(tr.count) })),
    funnel: {
      sessions: n(f?.sessions),
      generatorSessions: n(f?.generator_sessions),
      generatedSessions: n(f?.generated_sessions),
      downloadSessions: n(f?.download_sessions),
    },
    reportedQuestions: reports.map((r) => ({
      questionId: n(r.question_id),
      reports: n(r.reports),
      lastReport: r.last_report,
      text: r.text_de,
      answer: r.answer_de,
    })),
  });
}
