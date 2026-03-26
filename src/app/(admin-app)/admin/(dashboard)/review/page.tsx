'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Category, Question } from '@/types/quiz';
import ReviewCard from '@/components/admin/ReviewCard';

type QuestionWithCategory = Question & { category_name: string; category_icon: string };

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="text-[var(--muted)]">Laden...</div>}>
      <ReviewPageContent />
    </Suspense>
  );
}

function ReviewPageContent() {
  const searchParams = useSearchParams();
  const batchId = searchParams.get('batchId');

  const [questions, setQuestions] = useState<QuestionWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchQuestions = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ status: 'pending,flagged', limit: '200' });
    if (batchId) params.set('batchId', batchId);
    if (filterCategory) params.set('categoryId', filterCategory);
    if (filterDifficulty) params.set('difficulty', filterDifficulty);

    fetch(`/api/admin/questions?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data.questions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [batchId, filterCategory, filterDifficulty]);

  useEffect(() => {
    fetch('/api/admin/categories').then((r) => r.json()).then(setCategories);
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleBulkApprove = async () => {
    setBulkLoading(true);
    const ids = questions.map((q) => q.id);
    await fetch('/api/admin/questions/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', ids }),
    });
    setBulkLoading(false);
    fetchQuestions();
  };

  const handleBulkReject = async () => {
    if (!confirm(`Möchtest du wirklich alle ${questions.length} Fragen ablehnen?`)) return;
    setBulkLoading(true);
    const ids = questions.map((q) => q.id);
    await fetch('/api/admin/questions/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', ids }),
    });
    setBulkLoading(false);
    fetchQuestions();
  };

  // Group by category
  const grouped = questions.reduce<Record<string, QuestionWithCategory[]>>((acc, q) => {
    const key = q.category_name || 'Ohne Kategorie';
    if (!acc[key]) acc[key] = [];
    acc[key].push(q);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--gold)]">Review Queue</h1>
          <p className="text-sm text-[var(--muted)]">
            {questions.length} Fragen
            {(() => {
              const flaggedCount = questions.filter((q) => q.status === 'flagged').length;
              return flaggedCount > 0 ? ` (${flaggedCount} markiert)` : '';
            })()}
            {batchId && ' · gefiltert nach Batch'}
          </p>
        </div>
        {questions.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleBulkReject}
              disabled={bulkLoading}
              className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg text-sm font-bold hover:bg-red-600/30 transition-colors disabled:opacity-50"
            >
              {bulkLoading ? 'Wird abgelehnt...' : `❌ Alle ${questions.length} ablehnen`}
            </button>
            <button
              onClick={handleBulkApprove}
              disabled={bulkLoading}
              className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg text-sm font-bold hover:bg-green-600/30 transition-colors disabled:opacity-50"
            >
              {bulkLoading ? 'Wird freigegeben...' : `✅ Alle ${questions.length} freigeben`}
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
        >
          <option value="">Alle Kategorien</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.icon} {c.name_de}</option>
          ))}
        </select>
        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
        >
          <option value="">Alle Schwierigkeiten</option>
          {[1, 2, 3].map((d) => (
            <option key={d} value={d}>{'⭐'.repeat(d)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">Laden...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-[var(--muted)]">Keine ausstehenden Fragen</p>
        </div>
      ) : (
        Object.entries(grouped).map(([category, qs]) => (
          <div key={category} className="space-y-3">
            <h2 className="text-sm font-bold text-[var(--muted)] uppercase tracking-wider">
              {category} ({qs.length})
            </h2>
            {qs.map((q) => (
              <ReviewCard
                key={q.id}
                question={q}
                categories={categories}
                onUpdate={fetchQuestions}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );
}
