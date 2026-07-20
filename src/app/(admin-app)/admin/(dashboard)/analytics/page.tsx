'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Analytics {
  totals: {
    pageviews: number;
    sessions: number;
    generated: number;
    downloads: { slides: number; answerSheet: number; cheatSheet: number; categoryPdf: number };
  };
  daily: { day: string; pageviews: number; sessions: number; generated: number; downloads: number }[];
  topPages: { path: string; views: number; sessions: number }[];
  entryPages: { path: string; entries: number }[];
  referrers: { referrer: string; count: number }[];
  countries: { country: string; views: number; sessions: number }[];
  devices: { device: string; views: number; sessions: number }[];
  locales: { locale: string; views: number; sessions: number }[];
  transitions: { from: string; to: string; count: number }[];
  funnel: {
    sessions: number;
    generatorSessions: number;
    generatedSessions: number;
    downloadSessions: number;
  };
  reportedQuestions: {
    questionId: number;
    reports: number;
    lastReport: string;
    text: string | null;
    answer: string | null;
  }[];
}

const RANGES = [
  { days: 7, label: '7 Tage' },
  { days: 30, label: '30 Tage' },
  { days: 90, label: '90 Tage' },
  { days: 0, label: 'Gesamt' },
];

function downloadFile(filename: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function csvBlock(title: string, header: string[], rows: (string | number)[][]): string {
  return [`## ${title}`, ...[header, ...rows].map((r) => r.map(csvCell).join(','))].join('\n');
}

// One flat CSV with a block per dashboard section — made to be handed to a
// human or an LLM instead of screenshots.
function buildCsv(data: Analytics, rangeLabel: string): string {
  const d = data.totals.downloads;
  return [
    `# PubQuizPlanner Analytics · Zeitraum: ${rangeLabel} · exportiert: ${new Date().toISOString().slice(0, 10)}`,
    csvBlock('Totals', ['metric', 'value'], [
      ['sessions', data.totals.sessions],
      ['pageviews', data.totals.pageviews],
      ['quizzes_generated', data.totals.generated],
      ['downloads_slides', d.slides],
      ['downloads_answer_sheet', d.answerSheet],
      ['downloads_cheat_sheet', d.cheatSheet],
      ['downloads_category_pdf', d.categoryPdf ?? 0],
    ]),
    csvBlock('Funnel (Sessions)', ['step', 'sessions'], [
      ['visit', data.funnel.sessions],
      ['generator_opened', data.funnel.generatorSessions],
      ['quiz_generated', data.funnel.generatedSessions],
      ['download', data.funnel.downloadSessions],
    ]),
    csvBlock('Täglich', ['day', 'pageviews', 'sessions', 'quizzes', 'downloads'],
      data.daily.map((r) => [r.day, r.pageviews, r.sessions, r.generated, r.downloads])),
    csvBlock('Meistbesuchte Seiten', ['path', 'views', 'sessions'],
      data.topPages.map((p) => [p.path, p.views, p.sessions])),
    csvBlock('Einstiegsseiten', ['path', 'entries'],
      data.entryPages.map((p) => [p.path, p.entries])),
    csvBlock('Externe Referrer', ['referrer', 'count'],
      data.referrers.map((r) => [r.referrer, r.count])),
    csvBlock('Länder', ['country', 'views', 'sessions'],
      (data.countries ?? []).map((c) => [c.country, c.views, c.sessions])),
    csvBlock('Geräte', ['device', 'views', 'sessions'],
      (data.devices ?? []).map((d) => [d.device, d.views, d.sessions])),
    csvBlock('Sprachen', ['locale', 'views', 'sessions'],
      (data.locales ?? []).map((l) => [l.locale, l.views, l.sessions])),
    csvBlock('Seitenfluss', ['from', 'to', 'count'],
      data.transitions.map((t) => [t.from, t.to, t.count])),
    csvBlock('Gemeldete Fragen', ['question_id', 'reports', 'last_report', 'text', 'answer'],
      (data.reportedQuestions ?? []).map((r) => [
        r.questionId, r.reports, r.lastReport, r.text ?? '', r.answer ?? '',
      ])),
  ].join('\n\n');
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (d: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?days=${d}`);
      setData(await res.json());
    } catch {
      // keep last data
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load(days);
  }, [days, load]);

  const totalDownloads = data
    ? data.totals.downloads.slides +
      data.totals.downloads.answerSheet +
      data.totals.downloads.cheatSheet +
      (data.totals.downloads.categoryPdf ?? 0)
    : 0;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📈 Analytics</h1>
        <div className="flex items-center gap-2">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                days === r.days
                  ? 'bg-[var(--gold)] text-[var(--background)]'
                  : 'bg-[var(--dark-card)] text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              {r.label}
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-[var(--dark-border)]" aria-hidden />
          {(['CSV', 'JSON'] as const).map((fmt) => (
            <button
              key={fmt}
              disabled={!data}
              onClick={() => {
                if (!data) return;
                const rangeLabel = RANGES.find((r) => r.days === days)?.label ?? `${days} Tage`;
                const stamp = new Date().toISOString().slice(0, 10);
                const base = `pubquizplanner_analytics_${rangeLabel.replace(' ', '')}_${stamp}`;
                if (fmt === 'CSV') {
                  downloadFile(`${base}.csv`, buildCsv(data, rangeLabel), 'text/csv;charset=utf-8');
                } else {
                  downloadFile(
                    `${base}.json`,
                    JSON.stringify({ range: rangeLabel, exportedAt: stamp, ...data }, null, 2),
                    'application/json'
                  );
                }
              }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--dark-card)] text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-40 transition-colors"
              title={`Alle Dashboard-Daten als ${fmt} herunterladen`}
            >
              ⬇ {fmt}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <p className="text-[var(--muted)]">Laden…</p>
      ) : data ? (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Kpi label="Besucher (Sessions)" value={data.totals.sessions} />
            <Kpi label="Seitenaufrufe" value={data.totals.pageviews} />
            <Kpi label="Quizze erstellt" value={data.totals.generated} />
            <Kpi label="Downloads" value={totalDownloads} />
            <Kpi
              label="Conversion"
              value={
                data.funnel.sessions > 0
                  ? `${((data.funnel.downloadSessions / data.funnel.sessions) * 100).toFixed(1)}%`
                  : '–'
              }
            />
          </div>

          {/* Time series */}
          <Section title="Verlauf (täglich)">
            {data.daily.length > 1 ? (
              <DailyChart daily={data.daily} />
            ) : (
              <p className="text-sm text-[var(--muted)]">Noch nicht genug Daten für einen Verlauf.</p>
            )}
          </Section>

          {/* Funnel */}
          <Section title="Funnel (Sessions)">
            <FunnelBar label="Besuch" value={data.funnel.sessions} max={data.funnel.sessions} />
            <FunnelBar label="Generator geöffnet" value={data.funnel.generatorSessions} max={data.funnel.sessions} />
            <FunnelBar label="Quiz erstellt" value={data.funnel.generatedSessions} max={data.funnel.sessions} />
            <FunnelBar label="Download" value={data.funnel.downloadSessions} max={data.funnel.sessions} />
          </Section>

          {/* Downloads by format */}
          <Section title="Downloads nach Format">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Kpi label="🖥️ Präsentation" value={data.totals.downloads.slides} />
              <Kpi label="📄 Antwortbogen" value={data.totals.downloads.answerSheet} />
              <Kpi label="🗒️ Spickzettel" value={data.totals.downloads.cheatSheet} />
              <Kpi label="📚 Kategorie-PDF" value={data.totals.downloads.categoryPdf ?? 0} />
            </div>
          </Section>

          <div className="grid md:grid-cols-2 gap-8">
            <ListSection
              title="Meistbesuchte Seiten"
              rows={data.topPages.map((p) => [p.path, `${p.views} Aufrufe`, `${p.sessions} Sessions`])}
              emptyText="Noch keine Seitenaufrufe im Zeitraum."
            />
            <ListSection
              title="Einstiegsseiten"
              rows={data.entryPages.map((p) => [p.path, `${p.entries} Einstiege`])}
              emptyText="Noch keine Einstiege erfasst."
            />
            <ListSection
              title="Externe Referrer"
              rows={data.referrers.map((r) => [r.referrer, String(r.count)])}
              emptyText="Keine externen Referrer im Zeitraum."
            />
            <ListSection
              title="Länder"
              rows={(data.countries ?? []).map((c) => [
                countryLabel(c.country),
                `${c.views} Aufrufe`,
                `${c.sessions} Sessions`,
              ])}
              emptyText="Noch keine Länderdaten — werden seit dem letzten Update erfasst (Land aus IP via geojs.io, ohne IP-Speicherung; Fallback: Browser-Sprache)."
              footnote="Land über geojs.io aus der IP ermittelt (wird nicht gespeichert); Fallback: Browser-Sprache."
            />
            <ListSection
              title="Geräte"
              rows={(data.devices ?? []).map((d) => [
                deviceLabel(d.device),
                `${d.views} Aufrufe`,
                `${d.sessions} Sessions`,
              ])}
              emptyText="Noch keine Gerätedaten — werden seit dem letzten Update erfasst."
            />
            <ListSection
              title="Sprachen (URL)"
              rows={(data.locales ?? []).map((l) => [
                l.locale === '—' ? '— (ohne Präfix)' : l.locale.toUpperCase(),
                `${l.views} Aufrufe`,
                `${l.sessions} Sessions`,
              ])}
              emptyText="Noch keine Daten im Zeitraum."
            />
            <ListSection
              title="Seitenfluss (von → nach)"
              rows={data.transitions.map((t) => [`${t.from} → ${t.to}`, String(t.count)])}
              emptyText="Noch keine Übergänge erfasst."
            />
          </div>

          <ListSection
            title="⚑ Gemeldete Fragen"
            rows={(data.reportedQuestions ?? []).map((r) => [
              r.text ? `#${r.questionId} ${r.text} → ${r.answer ?? ''}` : `#${r.questionId} (Frage gelöscht)`,
              `${r.reports}× · zuletzt ${r.lastReport}`,
            ])}
            emptyText="Keine Meldungen im Zeitraum. 🎉"
          />
        </>
      ) : (
        <p className="text-[var(--muted)]">Keine Daten verfügbar.</p>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-4">
      <p className="text-xs text-[var(--muted)] mb-1">{label}</p>
      <p className="text-2xl font-bold text-[var(--gold)]">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 space-y-3">
      <h2 className="text-sm font-bold text-[var(--muted)] uppercase tracking-wide">{title}</h2>
      {children}
    </section>
  );
}

function FunnelBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-40 shrink-0 text-[var(--muted)]">{label}</span>
      <div className="flex-1 h-6 bg-[var(--background)] rounded overflow-hidden">
        <div className="h-full bg-[var(--gold)] opacity-80" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-28 shrink-0 text-right">
        {value} <span className="text-[var(--muted)]">({pct.toFixed(1)}%)</span>
      </span>
    </div>
  );
}

// ISO country code → flag emoji + German name (client-side, no data needed).
function countryLabel(code: string): string {
  const cc = code.toUpperCase();
  const flag =
    /^[A-Z]{2}$/.test(cc) &&
    String.fromCodePoint(
      0x1f1e6 + cc.charCodeAt(0) - 65,
      0x1f1e6 + cc.charCodeAt(1) - 65
    );
  let name = cc;
  try {
    name = new Intl.DisplayNames(['de'], { type: 'region' }).of(cc) ?? cc;
  } catch {
    // unknown code — show it raw
  }
  return flag ? `${flag} ${name}` : name;
}

function deviceLabel(device: string): string {
  switch (device) {
    case 'mobile':
      return '📱 Mobil';
    case 'desktop':
      return '🖥️ Computer';
    case 'tablet':
      return '📲 Tablet';
    default:
      return '❔ Unbekannt';
  }
}

const LIST_PREVIEW = 10;

// Section with a table capped at LIST_PREVIEW rows; the full list opens in a
// modal so the dashboard stays scannable.
function ListSection({
  title,
  rows,
  emptyText,
  footnote,
}: {
  title: string;
  rows: string[][];
  emptyText: string;
  footnote?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <Section title={title}>
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{emptyText}</p>
      ) : (
        <>
          <SimpleTable rows={rows.slice(0, LIST_PREVIEW)} />
          {footnote && <p className="text-xs text-[var(--muted)] opacity-70">{footnote}</p>}
          {rows.length > LIST_PREVIEW && (
            <button
              onClick={() => setOpen(true)}
              className="mt-1 text-sm text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors"
            >
              Alle {rows.length} anzeigen →
            </button>
          )}
        </>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--dark-border)]">
              <h2 className="text-sm font-bold text-[var(--muted)] uppercase tracking-wide">
                {title} · {rows.length}
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Schließen"
                className="w-8 h-8 rounded-lg border border-[var(--dark-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--gold)] transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-4">
              <SimpleTable rows={rows} />
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

function SimpleTable({ rows }: { rows: string[][] }) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map((cells, i) => (
          <tr key={i} className="border-b border-[var(--dark-border)] last:border-0">
            {cells.map((c, j) => (
              <td
                key={j}
                className={`py-1.5 ${j === 0 ? 'text-[var(--foreground)] break-all' : 'text-[var(--muted)] text-right whitespace-nowrap pl-3'}`}
              >
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type SeriesKey = 'pageviews' | 'sessions' | 'generated' | 'downloads';

const SERIES: { key: SeriesKey; color: string; label: string }[] = [
  { key: 'pageviews', color: '#d4a843', label: 'Seitenaufrufe' },
  { key: 'sessions', color: '#4ade80', label: 'Sessions' },
  { key: 'generated', color: '#60a5fa', label: 'Quizze' },
  { key: 'downloads', color: '#f472b6', label: 'Downloads' },
];

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

function formatDay(iso: string, withWeekday = false) {
  const d = new Date(`${iso}T00:00:00`);
  const short = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.`;
  return withWeekday ? `${WEEKDAYS[d.getDay()]} ${short}${d.getFullYear()}` : short;
}

function DailyChart({ daily }: { daily: Analytics['daily'] }) {
  const W = 900;
  const H = 220;
  const PAD_X = 34;
  const PAD_T = 14;
  const PAD_B = 26;
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const max = Math.max(...daily.map((d) => d.pageviews), 1);
  const x = (i: number) => PAD_X + (i / Math.max(daily.length - 1, 1)) * (W - PAD_X * 2);
  const y = (v: number) => H - PAD_B - (v / max) * (H - PAD_T - PAD_B);
  // The last bucket is the still-running current day — connecting it to the
  // line makes every morning look like a crash, so the lines stop at
  // yesterday and today renders as detached dots.
  const todayIdx = daily.length - 1;
  const line = (key: SeriesKey) =>
    daily
      .slice(0, -1)
      .map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`)
      .join(' ');

  // Nearest day under the cursor, in viewBox coordinates.
  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const vx = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((vx - PAD_X) / (W - PAD_X * 2)) * (daily.length - 1));
    setHover(Math.max(0, Math.min(daily.length - 1, i)));
  };

  // ~6 x-axis ticks, always including first and last day.
  const tickStep = Math.max(1, Math.ceil(daily.length / 6));
  const ticks = daily
    .map((_, i) => i)
    .filter((i) => i % tickStep === 0 || i === daily.length - 1);

  const gridValues = [max, Math.round(max / 2)];
  const h = hover !== null ? daily[hover] : null;
  // Tooltip on the other side of the crosshair when near the right edge.
  const tooltipLeftPct = hover !== null ? (x(hover) / W) * 100 : 0;
  const tooltipFlip = tooltipLeftPct > 62;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full cursor-crosshair"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {/* Grid + y labels */}
        <line x1={PAD_X} y1={H - PAD_B} x2={W - PAD_X} y2={H - PAD_B} stroke="var(--dark-border)" />
        {gridValues.map((v) => (
          <g key={v}>
            <line
              x1={PAD_X}
              y1={y(v)}
              x2={W - PAD_X}
              y2={y(v)}
              stroke="var(--dark-border)"
              strokeDasharray="3 5"
            />
            <text x={PAD_X - 6} y={y(v) + 3} fontSize="10" fill="var(--muted)" textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        {/* X ticks */}
        {ticks.map((i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 8}
            fontSize="10"
            fill="var(--muted)"
            textAnchor={i === 0 ? 'start' : i === daily.length - 1 ? 'end' : 'middle'}
          >
            {formatDay(daily[i].day)}
          </text>
        ))}
        {/* Series (lines end yesterday; today = dots) */}
        {SERIES.map((s) => (
          <path key={s.key} d={line(s.key)} fill="none" stroke={s.color} strokeWidth="2" />
        ))}
        {SERIES.map((s) => (
          <circle
            key={`today-${s.key}`}
            cx={x(todayIdx)}
            cy={y(daily[todayIdx][s.key])}
            r="3"
            fill={s.color}
            opacity="0.9"
          />
        ))}
        {/* Hover crosshair + points */}
        {hover !== null && (
          <g>
            <line
              x1={x(hover)}
              y1={PAD_T}
              x2={x(hover)}
              y2={H - PAD_B}
              stroke="var(--muted)"
              strokeWidth="1"
              strokeDasharray="2 3"
            />
            {SERIES.map((s) => (
              <circle
                key={s.key}
                cx={x(hover)}
                cy={y(daily[hover][s.key])}
                r="3.5"
                fill={s.color}
                stroke="var(--dark-card)"
                strokeWidth="1.5"
              />
            ))}
          </g>
        )}
      </svg>

      {/* Tooltip */}
      {h && (
        <div
          className="pointer-events-none absolute top-1 z-10 rounded-lg border border-[var(--dark-border)] bg-[var(--background)] px-3 py-2 text-xs shadow-xl"
          style={
            tooltipFlip
              ? { right: `${100 - tooltipLeftPct}%`, marginRight: 10 }
              : { left: `${tooltipLeftPct}%`, marginLeft: 10 }
          }
        >
          <p className="mb-1 font-bold text-[var(--foreground)]">{formatDay(h.day, true)}</p>
          {SERIES.map((s) => (
            <p key={s.key} className="flex items-center gap-2 text-[var(--muted)]">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.label}
              <span className="ml-auto pl-4 font-mono text-[var(--foreground)]">{h[s.key]}</span>
            </p>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-4 mt-2 text-xs text-[var(--muted)]">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
        <span className="opacity-70">· heutiger (laufender) Tag als Punkte</span>
      </div>
    </div>
  );
}
