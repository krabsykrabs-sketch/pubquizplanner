'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Question } from '@/types/quiz';

interface Props {
  questions: Question[];
  locale: string;
}

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Leicht',
  2: 'Mittel',
  3: 'Schwer',
};

export function QuestionList({ questions, locale }: Props) {
  const [filter, setFilter] = useState<number | null>(null);

  const filtered = filter ? questions.filter((q) => q.difficulty === filter) : questions;

  return (
    <>
      {/* Difficulty filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFilter(null)}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            filter === null
              ? 'bg-[var(--gold)] text-[var(--background)] border-[var(--gold)]'
              : 'bg-[var(--dark-card)] border-[var(--dark-border)] text-[var(--muted)] hover:border-[var(--gold)]'
          }`}
        >
          Alle ({questions.length})
        </button>
        {[1, 2, 3].map((d) => {
          const count = questions.filter((q) => q.difficulty === d).length;
          if (count === 0) return null;
          return (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                filter === d
                  ? 'bg-[var(--gold)] text-[var(--background)] border-[var(--gold)]'
                  : 'bg-[var(--dark-card)] border-[var(--dark-border)] text-[var(--muted)] hover:border-[var(--gold)]'
              }`}
            >
              {'⭐'.repeat(d)} {DIFFICULTY_LABELS[d]} ({count})
            </button>
          );
        })}
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {filtered.map((q, index) => (
          <QuestionItem key={q.id} question={q} index={index} locale={locale} />
        ))}
      </div>
    </>
  );
}

function QuestionItem({ question: q, index, locale }: { question: Question; index: number; locale: string }) {
  // CTA box after every 10 questions
  const showCta = (index + 1) % 10 === 0;

  return (
    <>
      <details className="group bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl overflow-hidden">
        <summary className="flex items-start gap-3 p-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden select-none">
          <span className="flex-1">
            <span className="text-[var(--foreground)]">{q.text_de}</span>
          </span>
          <span className="shrink-0 flex items-center gap-2">
            <span className="text-xs text-[var(--muted)]" title={DIFFICULTY_LABELS[q.difficulty]}>
              {'⭐'.repeat(q.difficulty)}
            </span>
            <span className="text-[var(--muted)] group-open:rotate-180 transition-transform text-xs">
              ▼
            </span>
          </span>
        </summary>
        <div className="px-4 pb-4 pt-1 border-t border-[var(--dark-border)]">
          <p className="text-[var(--gold)] font-medium mb-1">
            &rarr; {q.answer_de}
          </p>
          {q.fun_fact_de && (
            <p className="text-sm text-[var(--muted)] italic">
              💡 {q.fun_fact_de}
            </p>
          )}
        </div>
      </details>

      {showCta && (
        <div className="bg-[var(--gold)]/10 border border-[var(--gold)]/30 rounded-xl p-5 text-center my-4">
          <p className="text-sm text-[var(--foreground)] mb-2">
            Diese Fragen als fertige Präsentation?
          </p>
          <Link
            href={`/${locale}/generator`}
            className="inline-flex items-center gap-1 text-[var(--gold)] font-bold text-sm hover:text-[var(--gold-light)] transition-colors"
          >
            Quiz erstellen &rarr;
          </Link>
        </div>
      )}
    </>
  );
}
