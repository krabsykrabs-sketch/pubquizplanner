export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Aggregated analytics for the admin dashboard. Protected by the admin
// middleware (all /api/admin routes require the auth cookie).
export async function GET(request: NextRequest) {
  const days = parseInt(request.nextUrl.searchParams.get('days') || '30');
  // days = 0 → all time
  const since = days > 0 ? `NOW() - INTERVAL '${Math.min(days, 3650)} days'` : `'epoch'::timestamptz`;

  const [totals, daily, topPages, entryPages, referrers, transitions, funnel] =
    await Promise.all([
      query<{
        pageviews: string;
        sessions: string;
        generated: string;
        dl_slides: string;
        dl_sheet: string;
        dl_cheat: string;
      }>(
        `SELECT
           count(*) FILTER (WHERE event_type = 'page_view') AS pageviews,
           count(DISTINCT session_id) FILTER (WHERE event_type = 'page_view' AND session_id IS NOT NULL) AS sessions,
           count(*) FILTER (WHERE event_type = 'quiz_generated') AS generated,
           count(*) FILTER (WHERE event_type = 'download_slides') AS dl_slides,
           count(*) FILTER (WHERE event_type = 'download_answer_sheet') AS dl_sheet,
           count(*) FILTER (WHERE event_type = 'download_cheat_sheet') AS dl_cheat
         FROM events WHERE created_at >= ${since}`
      ),
      query<{ day: string; pageviews: string; sessions: string; generated: string; downloads: string }>(
        `SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
                count(*) FILTER (WHERE event_type = 'page_view') AS pageviews,
                count(DISTINCT session_id) FILTER (WHERE event_type = 'page_view' AND session_id IS NOT NULL) AS sessions,
                count(*) FILTER (WHERE event_type = 'quiz_generated') AS generated,
                count(*) FILTER (WHERE event_type LIKE 'download%') AS downloads
         FROM events WHERE created_at >= ${since}
         GROUP BY 1 ORDER BY 1`
      ),
      query<{ path: string; views: string; sessions: string }>(
        `SELECT path, count(*) AS views,
                count(DISTINCT session_id) AS sessions
         FROM events
         WHERE event_type = 'page_view' AND created_at >= ${since}
         GROUP BY path ORDER BY count(*) DESC LIMIT 15`
      ),
      query<{ path: string; entries: string }>(
        `SELECT path, count(*) AS entries FROM (
           SELECT DISTINCT ON (session_id) path
           FROM events
           WHERE event_type = 'page_view' AND session_id IS NOT NULL AND created_at >= ${since}
           ORDER BY session_id, created_at
         ) firsts GROUP BY path ORDER BY count(*) DESC LIMIT 10`
      ),
      query<{ referrer: string; count: string }>(
        `SELECT referrer, count(*) AS count
         FROM events
         WHERE event_type = 'page_view' AND created_at >= ${since}
           AND referrer IS NOT NULL AND referrer <> ''
           AND referrer NOT LIKE '/%'
           AND referrer NOT LIKE '%pubquizplanner%'
         GROUP BY referrer ORDER BY count(*) DESC LIMIT 10`
      ),
      query<{ from_path: string; to_path: string; count: string }>(
        `SELECT from_path, to_path, count(*) AS count FROM (
           SELECT LAG(path) OVER (PARTITION BY session_id ORDER BY created_at) AS from_path,
                  path AS to_path
           FROM events
           WHERE event_type = 'page_view' AND session_id IS NOT NULL AND created_at >= ${since}
         ) t
         WHERE from_path IS NOT NULL AND from_path <> to_path
         GROUP BY from_path, to_path ORDER BY count(*) DESC LIMIT 15`
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
    transitions: transitions.map((tr) => ({ from: tr.from_path, to: tr.to_path, count: n(tr.count) })),
    funnel: {
      sessions: n(f?.sessions),
      generatorSessions: n(f?.generator_sessions),
      generatedSessions: n(f?.generated_sessions),
      downloadSessions: n(f?.download_sessions),
    },
  });
}
