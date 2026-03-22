'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Category } from '@/types/quiz';

interface ImportResult {
  inserted: number;
  skipped: number;
  skippedFlag: number;
  batchId: string;
}

export default function ImportPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState(0);
  const [fileName, setFileName] = useState('');
  const [questionCount, setQuestionCount] = useState<number | null>(null);
  const [questions, setQuestions] = useState<unknown[] | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    fetch('/api/admin/categories').then((r) => r.json()).then(setCategories);
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');
    setResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(parsed)) {
          setError('JSON muss ein Array sein');
          setQuestions(null);
          setQuestionCount(null);
          return;
        }
        setQuestions(parsed);
        const active = parsed.filter((q: { skip?: boolean }) => !q.skip);
        setQuestionCount(active.length);
      } catch {
        setError('Ungültige JSON-Datei');
        setQuestions(null);
        setQuestionCount(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!questions || !categoryId) return;

    setImporting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, questions }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Import fehlgeschlagen');
      }

      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Import');
    }

    setImporting(false);
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-[var(--gold)]">Fragen importieren</h1>

      {result ? (
        <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 space-y-3">
          <h2 className="font-bold text-lg">Import abgeschlossen</h2>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-green-400 font-mono">{result.inserted}</span> Fragen importiert
            </p>
            {result.skipped > 0 && (
              <p>
                <span className="text-[var(--muted)] font-mono">{result.skipped}</span> übersprungen (Duplikate oder ungültig)
              </p>
            )}
            {result.skippedFlag > 0 && (
              <p>
                <span className="text-[var(--muted)] font-mono">{result.skippedFlag}</span> übersprungen (skip: true)
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
              onClick={() => {
                setResult(null);
                setQuestions(null);
                setQuestionCount(null);
                setFileName('');
                if (fileRef.current) fileRef.current.value = '';
              }}
              className="px-4 py-2 border border-[var(--dark-border)] rounded-lg text-sm hover:border-[var(--gold)] transition-colors"
            >
              Weitere importieren
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* File upload */}
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">JSON-Datei</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full bg-[var(--dark-card)] border-2 border-dashed border-[var(--dark-border)] rounded-xl px-6 py-8 text-center cursor-pointer hover:border-[var(--gold)] transition-colors"
            >
              {fileName ? (
                <div>
                  <p className="text-[var(--foreground)] font-medium">{fileName}</p>
                  {questionCount !== null && (
                    <p className="text-sm text-[var(--muted)] mt-1">{questionCount} Fragen erkannt</p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-[var(--muted)]">JSON-Datei hierhin ziehen oder klicken</p>
                  <p className="text-xs text-[var(--muted)] mt-1">Array mit text_de, answer_de, ...</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleFile}
              className="hidden"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">Kategorie</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(parseInt(e.target.value))}
              className="w-full bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-4 py-3 text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
            >
              <option value={0}>Kategorie wählen...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name_de}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={importing || !questions || !categoryId}
            className="w-full bg-[var(--gold)] text-[var(--background)] py-3 rounded-lg font-bold text-lg hover:bg-[var(--gold-light)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {importing ? (
              <><span className="animate-spin">⏳</span> Importiere...</>
            ) : (
              <>📥 Importieren{questionCount !== null && ` (${questionCount} Fragen)`}</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
