'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Category } from '@/types/quiz';

interface GenerateResult {
  batchId: string;
  inserted: number;
  pending: number;
  flagged: number;
  duplicatesRejected: number;
}

export default function GeneratePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState(0);
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<string>('mixed');
  const [instructions, setInstructions] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GenerateResult | null>(null);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) return;

    setGenerating(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          count,
          difficulty: difficulty === 'mixed' ? 'mixed' : parseInt(difficulty),
          specialInstructions: instructions || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Generation fehlgeschlagen');
      }

      const data: GenerateResult = await res.json();
      setResult(data);
      setGenerating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei der Generierung');
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-[var(--gold)]">Fragen generieren</h1>

      {/* Result summary */}
      {result && (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 space-y-3">
          <h2 className="font-bold text-lg text-[var(--foreground)]">Ergebnis</h2>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-[var(--gold)] font-mono">{result.inserted + result.duplicatesRejected}</span>{' '}
              Fragen generiert
            </p>
            <p>
              <span className="text-green-400 font-mono">{result.pending}</span>{' '}
              bestanden die Prüfung
            </p>
            {result.flagged > 0 && (
              <p>
                <span className="text-orange-400 font-mono">{result.flagged}</span>{' '}
                markiert zur manuellen Überprüfung
              </p>
            )}
            {result.duplicatesRejected > 0 && (
              <p>
                <span className="text-[var(--muted)] font-mono">{result.duplicatesRejected}</span>{' '}
                Duplikate entfernt
              </p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.push(`/admin/review?batchId=${result.batchId}`)}
              className="px-4 py-2 bg-[var(--gold)] text-[var(--background)] rounded-lg font-bold text-sm hover:bg-[var(--gold-light)] transition-colors"
            >
              Zum Review →
            </button>
            <button
              onClick={() => setResult(null)}
              className="px-4 py-2 border border-[var(--dark-border)] rounded-lg text-sm hover:border-[var(--gold)] transition-colors"
            >
              Weitere generieren
            </button>
          </div>
        </div>
      )}

      {!result && (
        <form onSubmit={handleGenerate} className="space-y-5">
          {/* Category */}
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">Kategorie</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(parseInt(e.target.value))}
              required
              className="w-full bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-4 py-3 text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
            >
              <option value={0}>Kategorie wählen...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name_de}
                </option>
              ))}
            </select>
          </div>

          {/* Count */}
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">Anzahl Fragen</label>
            <select
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-4 py-3 text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
            >
              {[5, 10, 15, 25, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">Schwierigkeit</label>
            <div className="flex gap-2">
              {[
                { label: 'Gemischt', value: 'mixed' },
                { label: '⭐', value: '1' },
                { label: '⭐⭐', value: '2' },
                { label: '⭐⭐⭐', value: '3' },
                { label: '⭐⭐⭐⭐', value: '4' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDifficulty(opt.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    difficulty === opt.value
                      ? 'bg-[var(--gold)] text-[var(--background)] border-[var(--gold)]'
                      : 'bg-[var(--dark-card)] text-[var(--foreground)] border-[var(--dark-border)] hover:border-[var(--gold)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Special instructions */}
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              Spezielle Anweisungen <span className="text-[var(--muted)]">(optional)</span>
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="z.B. DACH-spezifisch, 90er-Themen, nur Fußball..."
              rows={3}
              className="w-full bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-4 py-3 text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={generating || !categoryId}
            className="w-full bg-[var(--gold)] text-[var(--background)] py-3 rounded-lg font-bold text-lg hover:bg-[var(--gold-light)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <span className="animate-spin">⏳</span>
                Generiere {count} Fragen...
              </>
            ) : (
              <>🤖 Generieren</>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
