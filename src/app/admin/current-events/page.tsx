'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Category, Question } from '@/types/quiz';
import ReviewCard from '@/components/admin/ReviewCard';

type QuestionRow = Question & { category_name: string; category_icon: string };

export default function CurrentEventsPage() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterWeek, setFilterWeek] = useState('');

  const fetchQuestions = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      currentEvents: 'true',
      limit: '100',
      sortBy: 'created_at',
      sortOrder: 'desc',
    });

    fetch(`/api/admin/questions?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data.questions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch('/api/admin/categories').then((r) => r.json()).then(setCategories);
    fetchQuestions();
  }, [fetchQuestions]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');

    try {
      const res = await fetch('/api/admin/current-events', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Generierung fehlgeschlagen');
      }
      const { batchId } = await res.json();
      router.push(`/admin/review?batchId=${batchId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler');
      setGenerating(false);
    }
  };

  // Get unique weeks for filter
  const weeks = Array.from(new Set(questions.map((q) => q.current_event_week).filter(Boolean))).sort().reverse();

  const filtered = filterWeek
    ? questions.filter((q) => q.current_event_week === filterWeek)
    : questions;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--gold)]">Aktuelle Ereignisse</h1>
          <p className="text-sm text-[var(--muted)]">
            Wöchentliche Fragen zu aktuellen Nachrichten
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-5 py-3 bg-[var(--gold)] text-[var(--background)] rounded-lg font-bold hover:bg-[var(--gold-light)] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {generating ? (
            <>
              <span className="animate-spin">⏳</span>
              Generiere...
            </>
          ) : (
            <>📰 Diese Woche generieren</>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Week filter */}
      {weeks.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterWeek('')}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              !filterWeek
                ? 'bg-[var(--gold)] text-[var(--background)] border-[var(--gold)]'
                : 'border-[var(--dark-border)] hover:border-[var(--gold)]'
            }`}
          >
            Alle
          </button>
          {weeks.map((w) => (
            <button
              key={w}
              onClick={() => setFilterWeek(w!)}
              className={`px-3 py-1.5 rounded-lg text-sm font-mono border transition-colors ${
                filterWeek === w
                  ? 'bg-[var(--gold)] text-[var(--background)] border-[var(--gold)]'
                  : 'border-[var(--dark-border)] hover:border-[var(--gold)]'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">Laden...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📰</div>
          <p className="text-[var(--muted)]">Noch keine aktuellen Fragen vorhanden</p>
          <p className="text-sm text-[var(--muted)] mt-1">
            Klicke oben auf &quot;Diese Woche generieren&quot; um loszulegen.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <ReviewCard
              key={q.id}
              question={q}
              categories={categories}
              onUpdate={fetchQuestions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
