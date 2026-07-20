'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  total: number;
  byStatus: { status: string; count: number }[];
  byCategory: { name: string; icon: string; count: number }[];
  recent: { id: number; text_de: string; answer_de: string; status: string; created_at: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) {
    return <div className="text-[var(--muted)]">Laden...</div>;
  }

  const pending = stats.byStatus.find((s) => s.status === 'pending')?.count ?? 0;
  const flagged = stats.byStatus.find((s) => s.status === 'flagged')?.count ?? 0;
  const approved = stats.byStatus.find((s) => s.status === 'approved')?.count ?? 0;
  const rejected = stats.byStatus.find((s) => s.status === 'rejected')?.count ?? 0;

  return (
    <div className="max-w-6xl space-y-8">
      <h1 className="text-2xl font-bold text-[var(--gold)]">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Gesamt" value={stats.total} />
        <StatCard label="Ausstehend" value={pending} color="text-yellow-400" href="/admin/review" />
        <StatCard label="Markiert" value={flagged} color="text-orange-400" href="/admin/review" />
        <StatCard label="Freigegeben" value={approved} color="text-green-400" />
        <StatCard label="Abgelehnt" value={rejected} color="text-red-400" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* By category */}
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <h2 className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider mb-4">
            Fragen pro Kategorie (nur freigegebene)
          </h2>
          <div className="space-y-2">
            {stats.byCategory.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-sm">
                <span>
                  {cat.icon} {cat.name}
                </span>
                <span className="font-mono text-[var(--muted)]">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent */}
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
          <h2 className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider mb-4">
            Zuletzt hinzugefügt
          </h2>
          <div className="space-y-3">
            {stats.recent.map((q) => (
              <div key={q.id} className="text-sm">
                <p className="text-[var(--foreground)] truncate">{q.text_de}</p>
                <p className="text-xs text-[var(--muted)]">
                  → {q.answer_de} ·{' '}
                  <span className={
                    q.status === 'approved' ? 'text-green-400' :
                    q.status === 'rejected' ? 'text-red-400' :
                    'text-yellow-400'
                  }>{q.status}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      {(pending + flagged) > 0 && (
        <div className="flex gap-4">
          <Link
            href="/admin/review"
            className="px-5 py-3 border border-yellow-500/50 text-yellow-400 rounded-lg font-bold hover:bg-yellow-500/10 transition-colors"
          >
            ✅ {pending + flagged} Fragen reviewen
            {flagged > 0 && <span className="text-orange-400 ml-1">({flagged} markiert)</span>}
          </Link>
        </div>
      )}

      <IndexNowCard />
    </div>
  );
}

// Manual IndexNow submission: push every live URL to Bing/Yandex after
// publishing content, instead of waiting for a recrawl.
function IndexNowCard() {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  const submit = async () => {
    setState('loading');
    setMsg('');
    try {
      const res = await fetch('/api/admin/indexnow', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.ok) {
        setState('done');
        // HTTP 200 = ok, 202 = accepted (key validation pending). Both success.
        setMsg(`${data.submitted} URLs übermittelt · IndexNow antwortete HTTP ${data.status}.`);
      } else {
        setState('error');
        // 403 = key rejected, 422 = URL/host mismatch, 429 = rate limited.
        setMsg(`Fehlgeschlagen · HTTP ${data.status ?? res.status}.`);
      }
    } catch {
      setState('error');
      setMsg('Netzwerkfehler.');
    }
  };

  return (
    <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
      <h2 className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
        SEO · IndexNow
      </h2>
      <p className="text-sm text-[var(--muted)] mb-4">
        Meldet alle Live-URLs an Bing &amp; Co. Nach dem Freigeben oder Ändern von Inhalten anstoßen.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={state === 'loading'}
          className="px-5 py-2.5 rounded-lg font-bold bg-[var(--gold)] text-[var(--background)] hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {state === 'loading' ? 'Übermittle…' : '🔔 URLs an IndexNow senden'}
        </button>
        {msg && (
          <span
            className={`text-sm ${state === 'error' ? 'text-red-400' : 'text-green-400'}`}
          >
            {msg}
          </span>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  href,
}: {
  label: string;
  value: number;
  color?: string;
  href?: string;
}) {
  const content = (
    <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5">
      <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-bold font-mono ${color || 'text-[var(--foreground)]'}`}>
        {value}
      </p>
    </div>
  );
  if (href) return <Link href={href}>{content}</Link>;
  return content;
}
