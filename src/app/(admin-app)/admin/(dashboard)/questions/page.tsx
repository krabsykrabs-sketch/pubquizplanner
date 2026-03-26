'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Category, Question } from '@/types/quiz';
import ReviewCard from '@/components/admin/ReviewCard';

type QuestionRow = Question & { category_name: string; category_icon: string };

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterVerified, setFilterVerified] = useState('');
  const [filterHighlight, setFilterHighlight] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Edit modal
  const [editingId, setEditingId] = useState<number | null>(null);

  const limit = 30;

  const fetchQuestions = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sortBy,
      sortOrder,
    });
    if (search) params.set('search', search);
    if (filterCategory) params.set('categoryId', filterCategory);
    if (filterDifficulty) params.set('difficulty', filterDifficulty);
    if (filterStatus) params.set('status', filterStatus);
    if (filterVerified) params.set('verified', filterVerified);
    if (filterHighlight) params.set('highlight', 'true');

    fetch(`/api/admin/questions?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data.questions);
        setTotal(data.total);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, search, filterCategory, filterDifficulty, filterStatus, filterVerified, filterHighlight, sortBy, sortOrder]);

  useEffect(() => {
    fetch('/api/admin/categories').then((r) => r.json()).then(setCategories);
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, filterCategory, filterDifficulty, filterStatus, filterVerified, filterHighlight]);

  const totalPages = Math.ceil(total / limit);

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  const sortIndicator = (col: string) => {
    if (sortBy !== col) return '';
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Frage wirklich löschen?')) return;
    await fetch('/api/admin/questions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchQuestions();
  };

  const editingQuestion = editingId ? questions.find((q) => q.id === editingId) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--gold)]">Alle Fragen</h1>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Suche nach Frage oder Antwort..."
          className="flex-1 min-w-[200px] bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none"
        >
          <option value="">Kategorie</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.icon} {c.name_de}</option>
          ))}
        </select>
        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value)}
          className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none"
        >
          <option value="">Schwierigkeit</option>
          {[1, 2, 3].map((d) => (
            <option key={d} value={d}>{'⭐'.repeat(d)}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none"
        >
          <option value="">Status</option>
          <option value="pending">Ausstehend</option>
          <option value="flagged">Markiert</option>
          <option value="approved">Freigegeben</option>
          <option value="rejected">Abgelehnt</option>
        </select>
        <select
          value={filterVerified}
          onChange={(e) => setFilterVerified(e.target.value)}
          className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none"
        >
          <option value="">Verifiziert</option>
          <option value="true">Ja</option>
          <option value="false">Nein</option>
        </select>
        <button
          onClick={() => setFilterHighlight(!filterHighlight)}
          className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
            filterHighlight
              ? 'bg-yellow-600/20 border-yellow-500/50 text-yellow-400'
              : 'bg-[var(--dark-card)] border-[var(--dark-border)] text-[var(--muted)] hover:border-[var(--gold)]'
          }`}
        >
          ⭐ Nur Highlights
        </button>
      </div>

      {/* Info bar */}
      <div className="text-sm text-[var(--muted)]">
        {total} Fragen gefunden · Seite {page} von {totalPages || 1}
      </div>

      {/* Edit modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-20 px-4 overflow-auto">
          <div className="w-full max-w-2xl pb-10">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setEditingId(null)}
                className="text-[var(--muted)] hover:text-[var(--foreground)] text-lg"
              >
                ✕
              </button>
            </div>
            <ReviewCard
              question={editingQuestion}
              categories={categories}
              onUpdate={() => {
                setEditingId(null);
                fetchQuestions();
              }}
            />
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">Laden...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--dark-border)] text-left text-[var(--muted)]">
                <th className="py-2 px-2 cursor-pointer hover:text-[var(--foreground)]" onClick={() => handleSort('id')}>
                  ID{sortIndicator('id')}
                </th>
                <th className="py-2 px-2">⭐</th>
                <th className="py-2 px-2">Kat.</th>
                <th className="py-2 px-2">Frage</th>
                <th className="py-2 px-2">Antwort</th>
                <th className="py-2 px-2 cursor-pointer hover:text-[var(--foreground)]" onClick={() => handleSort('difficulty')}>
                  Diff.{sortIndicator('difficulty')}
                </th>
                <th className="py-2 px-2 cursor-pointer hover:text-[var(--foreground)]" onClick={() => handleSort('status')}>
                  Status{sortIndicator('status')}
                </th>
                <th className="py-2 px-2 cursor-pointer hover:text-[var(--foreground)]" onClick={() => handleSort('times_served')}>
                  Served{sortIndicator('times_served')}
                </th>
                <th className="py-2 px-2 cursor-pointer hover:text-[var(--foreground)]" onClick={() => handleSort('created_at')}>
                  Datum{sortIndicator('created_at')}
                </th>
                <th className="py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr
                  key={q.id}
                  className="border-b border-[var(--dark-border)] hover:bg-[var(--dark-card)] cursor-pointer transition-colors"
                  onClick={() => setEditingId(q.id)}
                >
                  <td className="py-2 px-2 font-mono text-[var(--muted)]">{q.id}</td>
                  <td className="py-2 px-2">{q.is_highlight ? '⭐' : ''}</td>
                  <td className="py-2 px-2">{q.category_icon}</td>
                  <td className="py-2 px-2 max-w-[300px] truncate">{q.text_de}</td>
                  <td className="py-2 px-2 max-w-[200px] truncate text-[var(--gold)]">{q.answer_de}</td>
                  <td className="py-2 px-2">{'⭐'.repeat(q.difficulty)}</td>
                  <td className="py-2 px-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                      q.status === 'approved' ? 'bg-green-900/30 text-green-400' :
                      q.status === 'rejected' ? 'bg-red-900/30 text-red-400' :
                      q.status === 'flagged' ? 'bg-orange-900/30 text-orange-400' :
                      'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="py-2 px-2 font-mono text-[var(--muted)]">{q.times_served}</td>
                  <td className="py-2 px-2 text-[var(--muted)] text-xs">
                    {new Date(q.created_at).toLocaleDateString('de')}
                  </td>
                  <td className="py-2 px-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }}
                      className="text-red-400/50 hover:text-red-400 text-xs"
                      title="Löschen"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded border border-[var(--dark-border)] text-sm disabled:opacity-30 hover:border-[var(--gold)] transition-colors"
          >
            ←
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let p: number;
            if (totalPages <= 7) {
              p = i + 1;
            } else if (page <= 4) {
              p = i + 1;
            } else if (page >= totalPages - 3) {
              p = totalPages - 6 + i;
            } else {
              p = page - 3 + i;
            }
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  p === page
                    ? 'bg-[var(--gold)] text-[var(--background)]'
                    : 'border border-[var(--dark-border)] hover:border-[var(--gold)]'
                }`}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded border border-[var(--dark-border)] text-sm disabled:opacity-30 hover:border-[var(--gold)] transition-colors"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
