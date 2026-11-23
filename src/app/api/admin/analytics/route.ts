export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { GENERATOR_TRACKING_SINCE, SWAP_TRACKING_SINCE } from '@/lib/generator-events';

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

  const [totals, daily, topPages, entryPages, referrers, countries, devices, locales, transitions, funnel, reports, purposes, qrScans, genFunnel, swapByCat, swapByDiff, swapTop] =
    await Promise.all([
      query<{
        pageviews: string;
        sessions: string;
        generated: string;
        dl_slides: string;
        dl_sheet: string;
        dl_cheat: string;
        dl_category: string;
        dl_unverified: string;
      }>(
        // Downloads only count when they carry a visit (session) id, i.e. were
        // clicked on the site. Session-less hits — direct requests to the PDF
        // URL, mostly scrapers with browser user-agents (e.g. ~3,700 on
        // 11+13 Sep 2026), plus some open-in-new-tab / search-result opens —
        // are reported separately as "unverified", never mixed in.
        `SELECT
           count(*) FILTER (WHERE event_type = 'page_view') AS pageviews,
           count(DISTINCT session_id) FILTER (WHERE event_type = 'page_view' AND session_id IS NOT NULL) AS sessions,
           count(*) FILTER (WHERE event_type = 'quiz_generated') AS generated,
           count(*) FILTER (WHERE event_type = 'download_slides' AND session_id IS NOT NULL) AS dl_slides,
           count(*) FILTER (WHERE event_type = 'download_answer_sheet' AND session_id IS NOT NULL) AS dl_sheet,
           count(*) FILTER (WHERE event_type = 'download_cheat_sheet' AND session_id IS NOT NULL) AS dl_cheat,
           count(*) FILTER (WHERE event_type = 'download_category_pdf' AND session_id IS NOT NULL) AS dl_category,
           count(*) FILTER (WHERE event_type LIKE 'download%' AND session_id IS NULL) AS dl_unverified
         FROM events WHERE created_at >= ${since}`
      ),
      query<{ day: string; pageviews: string; sessions: string; generated: string; downloads: string }>(
        `WITH agg AS (
           SELECT date_trunc('day', created_at) AS day,
                  count(*) FILTER (WHERE event_type = 'page_view') AS pageviews,
                  count(DISTINCT session_id) FILTER (WHERE event_type = 'page_view' AND session_id IS NOT NULL) AS sessions,
                  count(*) FILTER (WHERE event_type = 'quiz_generated') AS generated,
                  count(*) FILTER (WHERE event_type LIKE 'download%' AND session_id IS NOT NULL) AS downloads
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
      // Device split, from the coarse class /api/track stores in meta. Only
      // events since that deploy carry it (older rows group under 'unbekannt').
      query<{ device: string; views: string; sessions: string }>(
        `SELECT coalesce(meta->>'device', 'unbekannt') AS device,
                count(*) AS views,
                count(DISTINCT session_id) AS sessions
         FROM events
         WHERE event_type = 'page_view' AND created_at >= ${since}
         GROUP BY 1 ORDER BY count(*) DESC`
      ),
      // Locale from the first path segment (/de/..., /sv/...). Two-letter
      // prefixes only; anything else groups under '—'.
      query<{ locale: string; views: string; sessions: string }>(
        `SELECT CASE WHEN substring(path from '^/([a-z]{2})(?:/|$)') IS NOT NULL
                     THEN substring(path from '^/([a-z]{2})(?:/|$)')
                     ELSE '—' END AS locale,
                count(*) AS views,
                count(DISTINCT session_id) AS sessions
         FROM events
         WHERE event_type = 'page_view' AND created_at >= ${since}
         GROUP BY 1 ORDER BY count(*) DESC`
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
      // "Wofür ist dein Quiz?" poll — one answer per visit (deduped on insert).
      query<{ purpose: string; count: string }>(
        `SELECT meta->>'purpose' AS purpose, count(*) AS count
         FROM events
         WHERE event_type = 'quiz_purpose' AND created_at >= ${since}
         GROUP BY 1 ORDER BY count(*) DESC`
      ),
      // "Make your own quiz" QR codes on slides/printouts, by surface.
      query<{ src: string; count: string }>(
        `SELECT meta->>'src' AS src, count(*) AS count
         FROM events
         WHERE event_type = 'qr_scan' AND created_at >= ${since}
         GROUP BY 1 ORDER BY count(*) DESC`
      ),
      // Generator journey per visit, only for visits since the funnel
      // instrumentation shipped (older visits have no 'generator_action').
      // Base = visits whose preview loaded ('quiz_generated').
      query<{
        base: string;
        customized: string;
        browsed: string;
        reached_download: string;
        clicked_download: string;
        got_download: string;
        copied: string;
        download_errors: string;
        no_dl_with_exit: string;
        no_dl_under_30s: string;
        no_dl_median_s: string | null;
        dl_median_s: string | null;
      }>(
        `WITH win AS (SELECT GREATEST(${since}, '${GENERATOR_TRACKING_SINCE}'::timestamptz) AS t),
         base AS (
           SELECT DISTINCT session_id FROM events, win
           WHERE event_type = 'quiz_generated' AND session_id IS NOT NULL AND created_at >= win.t
         ),
         acts AS (
           SELECT session_id,
                  bool_or(meta->>'action' = 'customize') AS customized,
                  bool_or(meta->>'action' = 'round_view') AS browsed,
                  bool_or(meta->>'action' = 'to_download') AS reached_download,
                  bool_or(meta->>'action' = 'download_click') AS clicked_download,
                  bool_or(meta->>'action' = 'copy') AS copied,
                  count(*) FILTER (WHERE meta->>'action' = 'download_error') AS errors,
                  max((meta->>'seconds')::int) FILTER (WHERE meta->>'action' = 'exit') AS seconds
           FROM events, win
           WHERE event_type = 'generator_action' AND session_id IS NOT NULL AND created_at >= win.t
           GROUP BY session_id
         ),
         dl AS (
           SELECT DISTINCT session_id FROM events, win
           WHERE event_type IN ('download_slides', 'download_answer_sheet', 'download_cheat_sheet')
             AND session_id IS NOT NULL AND created_at >= win.t
         ),
         j AS (
           SELECT b.session_id, a.*, (dl.session_id IS NOT NULL) AS got_download
           FROM base b
           LEFT JOIN acts a ON a.session_id = b.session_id
           LEFT JOIN dl ON dl.session_id = b.session_id
         )
         SELECT count(*) AS base,
                count(*) FILTER (WHERE customized) AS customized,
                count(*) FILTER (WHERE browsed) AS browsed,
                count(*) FILTER (WHERE reached_download) AS reached_download,
                count(*) FILTER (WHERE clicked_download) AS clicked_download,
                count(*) FILTER (WHERE got_download) AS got_download,
                count(*) FILTER (WHERE copied) AS copied,
                coalesce(sum(errors), 0) AS download_errors,
                count(*) FILTER (WHERE NOT got_download AND seconds IS NOT NULL) AS no_dl_with_exit,
                count(*) FILTER (WHERE NOT got_download AND seconds < 30) AS no_dl_under_30s,
                percentile_cont(0.5) WITHIN GROUP (ORDER BY seconds) FILTER (WHERE NOT got_download) AS no_dl_median_s,
                percentile_cont(0.5) WITHIN GROUP (ORDER BY seconds) FILTER (WHERE got_download) AS dl_median_s
         FROM j`
      ),
      // Question quality: swap rate = swapped out / shown in a generator
      // preview. Cumulative since SWAP_TRACKING_SINCE (not range-filtered),
      // approved questions only.
      query<{ name: string; shown: string; swaps: string }>(
        `SELECT c.name_de AS name, sum(q.shown_count) AS shown, sum(q.swap_count) AS swaps
         FROM questions q JOIN categories c ON c.id = q.category_id
         WHERE q.status = 'approved'
         GROUP BY c.name_de HAVING sum(q.shown_count) > 0
         ORDER BY sum(q.swap_count)::float / sum(q.shown_count) DESC`
      ),
      query<{ difficulty: string; shown: string; swaps: string }>(
        `SELECT difficulty, sum(shown_count) AS shown, sum(swap_count) AS swaps
         FROM questions WHERE status = 'approved' AND shown_count > 0
         GROUP BY difficulty ORDER BY difficulty`
      ),
      query<{ id: string; text_de: string; answer_de: string; category: string; difficulty: string; shown: string; swaps: string }>(
        `SELECT q.id, q.text_de, q.answer_de, c.name_de AS category, q.difficulty,
                q.shown_count AS shown, q.swap_count AS swaps
         FROM questions q JOIN categories c ON c.id = q.category_id
         WHERE q.status = 'approved' AND q.shown_count >= 10 AND q.swap_count >= 2
         ORDER BY q.swap_count::float / q.shown_count DESC, q.swap_count DESC
         LIMIT 25`
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
        unverified: n(t?.dl_unverified),
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
    devices: devices.map((d) => ({ device: d.device, views: n(d.views), sessions: n(d.sessions) })),
    locales: locales.map((l) => ({ locale: l.locale, views: n(l.views), sessions: n(l.sessions) })),
    transitions: transitions.map((tr) => ({ from: tr.from_path, to: tr.to_path, count: n(tr.count) })),
    funnel: {
      sessions: n(f?.sessions),
      generatorSessions: n(f?.generator_sessions),
      generatedSessions: n(f?.generated_sessions),
      downloadSessions: n(f?.download_sessions),
    },
    purposes: purposes.map((p) => ({ purpose: p.purpose, count: n(p.count) })),
    qrScans: qrScans.map((q) => ({ src: q.src, count: n(q.count) })),
    questionSwaps: {
      since: SWAP_TRACKING_SINCE,
      byCategory: swapByCat.map((r) => ({ name: r.name, shown: n(r.shown), swaps: n(r.swaps) })),
      byDifficulty: swapByDiff.map((r) => ({
        difficulty: n(r.difficulty),
        shown: n(r.shown),
        swaps: n(r.swaps),
      })),
      top: swapTop.map((r) => ({
        id: n(r.id),
        text: r.text_de,
        answer: r.answer_de,
        category: r.category,
        difficulty: n(r.difficulty),
        shown: n(r.shown),
        swaps: n(r.swaps),
      })),
    },
    generatorFunnel: (() => {
      const g = genFunnel[0];
      const med = (v: string | null | undefined) => (v == null ? null : Math.round(Number(v)));
      return {
        since: GENERATOR_TRACKING_SINCE,
        base: n(g?.base),
        customized: n(g?.customized),
        browsed: n(g?.browsed),
        reachedDownload: n(g?.reached_download),
        clickedDownload: n(g?.clicked_download),
        gotDownload: n(g?.got_download),
        copied: n(g?.copied),
        downloadErrors: n(g?.download_errors),
        noDownloadWithExit: n(g?.no_dl_with_exit),
        noDownloadUnder30s: n(g?.no_dl_under_30s),
        noDownloadMedianSeconds: med(g?.no_dl_median_s),
        downloadMedianSeconds: med(g?.dl_median_s),
      };
    })(),
    reportedQuestions: reports.map((r) => ({
      questionId: n(r.question_id),
      reports: n(r.reports),
      lastReport: r.last_report,
      text: r.text_de,
      answer: r.answer_de,
    })),
  });
}
