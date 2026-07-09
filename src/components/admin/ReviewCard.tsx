'use client';

import { useState } from 'react';
import type { Category, Question } from '@/types/quiz';
import { LOCALES, LOCALE_LABELS } from '@/config/locales';

interface Props {
  question: Question & { category_name?: string; category_icon?: string };
  categories: Category[];
  onUpdate: () => void;
}

export default function ReviewCard({ question, categories, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [highlight, setHighlight] = useState(question.is_highlight ?? false);
  const [form, setForm] = useState({
    text_de: question.text_de,
    answer_de: question.answer_de,
    fun_fact_de: question.fun_fact_de || '',
    difficulty: question.difficulty,
    category_id: question.category_id,
    tags: (question.tags || []).join(', '),
    question_type: question.question_type === 'estimation' ? 'estimation' : 'standard',
  });
  // Locale allow-list: null = all languages; a restricted array limits where the
  // question may appear / be translated (e.g. ['de'] = German-only).
  const [restrictLocales, setRestrictLocales] = useState(Array.isArray(question.locales));
  const [allowedLocales, setAllowedLocales] = useState<string[]>(
    question.locales ?? [...LOCALES]
  );
  const toggleLocale = (loc: string) =>
    setAllowedLocales((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );

  const save = async (extraFields: Record<string, unknown> = {}) => {
    setSaving(true);
    await fetch('/api/admin/questions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: question.id,
        text_de: form.text_de,
        answer_de: form.answer_de,
        fun_fact_de: form.fun_fact_de || null,
        difficulty: form.difficulty,
        category_id: form.category_id,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        question_type: form.question_type === 'estimation' ? 'estimation' : null,
        locales: restrictLocales ? allowedLocales : null,
        ...extraFields,
      }),
    });
    setSaving(false);
    setEditing(false);
    onUpdate();
  };

  const approve = () => save({ status: 'approved', verified: true });
  const reject = () => save({ status: 'rejected', verified: false });
  // Divert a too-specific-but-fun question into the Multiple-Choice candidate
  // pool instead of rejecting it outright. Its fact is great as an MC question
  // even when it's unfair as an open question. Collectible via status filter.
  const markMcCandidate = () => save({ status: 'mc_candidate' });

  const handleFix = async () => {
    setFixing(true);
    try {
      const res = await fetch('/api/admin/questions/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id }),
      });
      if (!res.ok) throw new Error('Fix failed');
      const fixed = await res.json();

      setForm({
        ...form,
        text_de: fixed.text_de,
        answer_de: fixed.answer_de,
        fun_fact_de: fixed.fun_fact_de || '',
      });
      setEditing(true);
    } catch {
      // silently fail
    }
    setFixing(false);
  };

  return (
    <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span>{question.category_icon}</span>
          <span className="text-[var(--muted)]">{question.category_name}</span>
          <span className="text-[var(--muted)]">·</span>
          <span className="text-[var(--muted)]">{'⭐'.repeat(question.difficulty)}</span>
          <span className="text-[var(--muted)]">·</span>
          <button
            onClick={async (e) => {
              e.stopPropagation();
              const newVal = !highlight;
              setHighlight(newVal);
              await fetch('/api/admin/questions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: question.id, is_highlight: newVal }),
              });
            }}
            title={highlight ? 'Highlight entfernen' : 'Als Highlight markieren'}
            className={`text-lg leading-none transition-colors ${highlight ? 'text-yellow-400' : 'text-[var(--muted)] opacity-40 hover:opacity-70'}`}
          >
            ⭐
          </button>
          <span className="text-[var(--muted)]">·</span>
          <span className={`px-2 py-0.5 rounded text-xs font-mono ${
            question.status === 'approved' ? 'bg-green-900/30 text-green-400' :
            question.status === 'rejected' ? 'bg-red-900/30 text-red-400' :
            question.status === 'flagged' ? 'bg-orange-900/30 text-orange-400' :
            question.status === 'mc_candidate' ? 'bg-purple-900/30 text-purple-400' :
            'bg-yellow-900/30 text-yellow-400'
          }`}>
            {question.status === 'flagged' ? '⚠️ flagged' :
             question.status === 'mc_candidate' ? '🎯 MC-Kandidat' : question.status}
          </span>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          {editing ? 'Schließen' : 'Bearbeiten'}
        </button>
      </div>

      {editing ? (
        <div className="space-y-3">
          {/* Question text */}
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Frage</label>
            <textarea
              value={form.text_de}
              onChange={(e) => setForm({ ...form, text_de: e.target.value })}
              rows={2}
              className="w-full bg-[var(--background)] border border-[var(--dark-border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none resize-none"
            />
          </div>

          {/* Answer */}
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Antwort</label>
            <input
              type="text"
              value={form.answer_de}
              onChange={(e) => setForm({ ...form, answer_de: e.target.value })}
              className="w-full bg-[var(--background)] border border-[var(--dark-border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none"
            />
          </div>

          {/* Fun fact */}
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Fun Fact</label>
            <textarea
              value={form.fun_fact_de}
              onChange={(e) => setForm({ ...form, fun_fact_de: e.target.value })}
              rows={2}
              className="w-full bg-[var(--background)] border border-[var(--dark-border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none resize-none"
            />
          </div>

          {/* Difficulty + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Schwierigkeit</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: parseInt(e.target.value) })}
                className="w-full bg-[var(--background)] border border-[var(--dark-border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none"
              >
                {[1, 2, 3].map((d) => (
                  <option key={d} value={d}>{'⭐'.repeat(d)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Kategorie</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: parseInt(e.target.value) })}
                className="w-full bg-[var(--background)] border border-[var(--dark-border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name_de}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Tags (kommagetrennt)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full bg-[var(--background)] border border-[var(--dark-border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none"
            />
          </div>

          {/* Question type */}
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Fragetyp</label>
            <select
              value={form.question_type}
              onChange={(e) => setForm({ ...form, question_type: e.target.value })}
              className="w-full bg-[var(--background)] border border-[var(--dark-border)] rounded-lg px-3 py-2 text-sm focus:border-[var(--gold)] focus:outline-none"
            >
              <option value="standard">Standard (offene Antwort)</option>
              <option value="estimation">📊 Schätzfrage (nächste Schätzung gewinnt)</option>
            </select>
            {form.question_type === 'estimation' && (
              <p className="mt-1 text-xs text-[var(--muted)]">
                Antwort als Zahl eintragen (z.&nbsp;B. „206“ oder „206 Knochen“).
              </p>
            )}
          </div>

          {/* Translation availability (locale allow-list) */}
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Übersetzung</label>
            <label className="flex items-center gap-2 text-sm mb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={restrictLocales}
                onChange={(e) => setRestrictLocales(e.target.checked)}
              />
              <span>Nur in bestimmten Sprachen anzeigen (sonst: alle Sprachen)</span>
            </label>
            {restrictLocales && (
              <div className="flex flex-wrap gap-3 pl-6">
                {LOCALES.map((loc) => (
                  <label key={loc} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowedLocales.includes(loc)}
                      onChange={() => toggleLocale(loc)}
                    />
                    <span>{LOCALE_LABELS[loc] ?? loc} ({loc})</span>
                  </label>
                ))}
                <span className="text-xs text-[var(--muted)] w-full">
                  Tipp: nur „Deutsch&rdquo; angehakt = deutschspezifische Frage, wird nie übersetzt.
                </span>
              </div>
            )}
          </div>

          {/* Source (read-only) */}
          {question.source && (
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Quelle</label>
              <p className="text-sm text-[var(--muted)] bg-[var(--background)] border border-[var(--dark-border)] rounded-lg px-3 py-2">
                {question.source}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <p className="text-[var(--foreground)] mb-2">{question.text_de}</p>
          <p className="text-sm text-[var(--gold)]">→ {question.answer_de}</p>
          {question.question_type === 'estimation' && (
            <p className="text-xs text-[var(--gold-light)] mt-1">📊 Schätzfrage</p>
          )}
          {Array.isArray(question.locales) && (
            <p className="text-xs text-[var(--muted)] mt-1">
              🌐 nur: {question.locales.join(', ')}
            </p>
          )}
          {question.fun_fact_de && (
            <p className="text-xs text-[var(--muted)] mt-1 italic">💡 {question.fun_fact_de}</p>
          )}
          {question.source && (
            <p className="text-xs text-[var(--muted)] mt-1">📎 {question.source}</p>
          )}
          {question.status === 'flagged' && question.verification_note && (
            <div className="mt-3 bg-orange-900/15 border border-orange-500/30 rounded-lg px-3 py-2 text-sm text-orange-300">
              <span className="font-medium">⚠️ Verifizierung fehlgeschlagen:</span>{' '}
              {question.verification_note}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--dark-border)]">
        <button
          onClick={approve}
          disabled={saving}
          className="px-4 py-2 bg-green-600/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-600/30 transition-colors disabled:opacity-50"
        >
          ✅ Freigeben
        </button>
        <button
          onClick={reject}
          disabled={saving}
          className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-600/30 transition-colors disabled:opacity-50"
        >
          ❌ Ablehnen
        </button>
        <button
          onClick={markMcCandidate}
          disabled={saving}
          title="Für spätere Multiple-Choice-Frage vormerken (aus dem Review nehmen, aber nicht verwerfen)"
          className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-600/30 transition-colors disabled:opacity-50"
        >
          🎯 MC-Kandidat
        </button>
        {editing && (
          <button
            onClick={() => save()}
            disabled={saving}
            className="px-4 py-2 bg-[var(--gold)]/20 text-[var(--gold)] rounded-lg text-sm font-medium hover:bg-[var(--gold)]/30 transition-colors disabled:opacity-50"
          >
            💾 Speichern
          </button>
        )}
        {question.status === 'flagged' && question.verification_note && !editing && (
          <button
            onClick={handleFix}
            disabled={fixing}
            className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-600/30 transition-colors disabled:opacity-50"
          >
            {fixing ? '⏳ Korrigiere...' : '🔧 Korrektur übernehmen'}
          </button>
        )}
      </div>
    </div>
  );
}
