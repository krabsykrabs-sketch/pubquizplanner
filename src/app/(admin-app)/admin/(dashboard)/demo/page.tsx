'use client';

import { useEffect, useState } from 'react';

interface DeckSummary {
  exists: boolean;
  updatedAt: string | null;
  totalQuestions: number;
  rounds: { categoryName: string; icon: string; questionCount: number }[];
  error?: string;
}

export default function AdminDemoPage() {
  const [summary, setSummary] = useState<DeckSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/demo');
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Fehler beim Laden.');
      else {
        setSummary(data);
        setError(null);
      }
    } catch {
      setError('Netzwerkfehler.');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const regenerate = async () => {
    if (!confirm('Demo-Deck neu generieren? Das aktuelle Deck wird überschrieben.')) return;
    setRegenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/demo', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Fehler beim Generieren.');
      else setSummary(data);
    } catch {
      setError('Netzwerkfehler.');
    }
    setRegenerating(false);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--gold)]">Demo-Quiz</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Das gespeicherte Demo-Deck wird auf der Startseite in allen Sprachen abgespielt.
          Alle Besucher sehen dasselbe Deck, bis du es hier neu generierst. Version&nbsp;1
          wählt zufällige Fragen (mit Übersetzung in allen Sprachen) – später durch
          handverlesene Fragen ersetzbar.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={regenerate}
          disabled={regenerating}
          className="px-5 py-3 bg-[var(--gold)] text-[var(--background)] rounded-lg font-bold hover:bg-[var(--gold-light)] transition-colors disabled:opacity-50"
        >
          {regenerating ? '⏳ Wird generiert…' : '🎲 Demo-Deck neu generieren'}
        </button>
        <a
          href="/api/demo?locale=de"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-3 border border-[var(--dark-border)] rounded-lg font-bold hover:border-[var(--gold)] transition-colors"
        >
          ▶ Vorschau (DE)
        </a>
      </div>

      {loading ? (
        <div className="text-[var(--muted)]">Laden…</div>
      ) : summary && summary.exists ? (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">Aktuelles Deck</h2>
            <span className="text-xs text-[var(--muted)] font-mono">
              {summary.totalQuestions} Fragen ·{' '}
              {summary.updatedAt
                ? new Date(summary.updatedAt).toLocaleString('de-DE')
                : '—'}
            </span>
          </div>
          <div className="space-y-2 pt-2 border-t border-[var(--dark-border)]">
            {summary.rounds.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span>
                  {r.icon} Runde {i + 1}: {r.categoryName}
                </span>
                <span className="font-mono text-[var(--muted)]">
                  {r.questionCount} Fragen
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : !error ? (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 text-sm text-[var(--muted)]">
          Noch kein Demo-Deck gespeichert. Klicke auf „Demo-Deck neu generieren“.
        </div>
      ) : null}
    </div>
  );
}
