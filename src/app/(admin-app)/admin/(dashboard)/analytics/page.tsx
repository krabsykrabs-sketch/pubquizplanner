'use client';

import { useCallback, useEffect, useState } from 'react';

interface Analytics {
  totals: {
    pageviews: number;
    sessions: number;
    generated: number;
    downloads: { slides: number; answerSheet: number; cheatSheet: number };
  };
  daily: { day: string; pageviews: number; sessions: number; generated: number; downloads: number }[];
  topPages: { path: string; views: number; sessions: number }[];
  entryPages: { path: string; entries: number }[];
  referrers: { referrer: string; count: number }[];
  transitions: { from: string; to: string; count: number }[];
  funnel: {
    sessions: number;
    generatorSessions: number;
    generatedSessions: number;
    downloadSessions: number;
  };
}

const RANGES = [
  { days: 7, label: '7 Tage' },
  { days: 30, label: '30 Tage' },
  { days: 90, label: '90 Tage' },
  { days: 0, label: 'Gesamt' },
];

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
    ? data.totals.downloads.slides + data.totals.downloads.answerSheet + data.totals.downloads.cheatSheet
    : 0;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📈 Analytics</h1>
        <div className="flex gap-2">
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
            <div className="grid grid-cols-3 gap-4">
              <Kpi label="🖥️ Präsentation" value={data.totals.downloads.slides} />
              <Kpi label="📄 Antwortbogen" value={data.totals.downloads.answerSheet} />
              <Kpi label="🗒️ Spickzettel" value={data.totals.downloads.cheatSheet} />
            </div>
          </Section>

          <div className="grid md:grid-cols-2 gap-8">
            <Section title="Meistbesuchte Seiten">
              <SimpleTable
                rows={data.topPages.map((p) => [p.path, `${p.views} Aufrufe`, `${p.sessions} Sessions`])}
              />
            </Section>
            <Section title="Einstiegsseiten">
              <SimpleTable rows={data.entryPages.map((p) => [p.path, `${p.entries} Einstiege`])} />
            </Section>
            <Section title="Externe Referrer">
              {data.referrers.length ? (
                <SimpleTable rows={data.referrers.map((r) => [r.referrer, String(r.count)])} />
              ) : (
                <p className="text-sm text-[var(--muted)]">Keine externen Referrer im Zeitraum.</p>
              )}
            </Section>
            <Section title="Seitenfluss (von → nach)">
              {data.transitions.length ? (
                <SimpleTable rows={data.transitions.map((t) => [`${t.from} → ${t.to}`, String(t.count)])} />
              ) : (
                <p className="text-sm text-[var(--muted)]">Noch keine Übergänge erfasst.</p>
              )}
            </Section>
          </div>
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

function DailyChart({ daily }: { daily: Analytics['daily'] }) {
  const W = 900;
  const H = 200;
  const PAD = 30;
  const max = Math.max(...daily.map((d) => d.pageviews), 1);
  const x = (i: number) => PAD + (i / Math.max(daily.length - 1, 1)) * (W - PAD * 2);
  const y = (v: number) => H - PAD - (v / max) * (H - PAD * 2);
  const line = (key: 'pageviews' | 'sessions' | 'generated' | 'downloads') =>
    daily.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d[key]).toFixed(1)}`).join(' ');

  const series: { key: 'pageviews' | 'sessions' | 'generated' | 'downloads'; color: string; label: string }[] = [
    { key: 'pageviews', color: '#d4a843', label: 'Seitenaufrufe' },
    { key: 'sessions', color: '#4ade80', label: 'Sessions' },
    { key: 'generated', color: '#60a5fa', label: 'Quizze' },
    { key: 'downloads', color: '#f472b6', label: 'Downloads' },
  ];

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--dark-border)" />
        <text x={PAD} y={12} fontSize="10" fill="var(--muted)">{max}</text>
        {series.map((s) => (
          <path key={s.key} d={line(s.key)} fill="none" stroke={s.color} strokeWidth="2" />
        ))}
        <text x={PAD} y={H - 8} fontSize="10" fill="var(--muted)">{daily[0]?.day}</text>
        <text x={W - PAD} y={H - 8} fontSize="10" fill="var(--muted)" textAnchor="end">
          {daily[daily.length - 1]?.day}
        </text>
      </svg>
      <div className="flex gap-4 mt-2 text-xs text-[var(--muted)]">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
