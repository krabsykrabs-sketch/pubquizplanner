'use client';

import { useState } from 'react';
import { getSessionId } from '@/lib/session-id';
import type { QuizQuestion } from '@/types/quiz';

interface Props {
  question: QuizQuestion;
  onSwap: () => void;
  swapDisabled: boolean;
}

export default function QuestionCard({ question, onSwap, swapDisabled }: Props) {
  const [reported, setReported] = useState(false);

  const report = async () => {
    if (reported) return;
    setReported(true);
    try {
      await fetch('/api/report-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: question.id, sessionId: getSessionId() }),
      });
    } catch {
      // keep the visual confirmation anyway — reporting is best-effort
    }
  };

  return (
    <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg p-4 flex items-start gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--gold)] bg-opacity-20 flex items-center justify-center text-sm font-mono text-[var(--gold)]">
        {question.questionNumber}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[var(--foreground)] mb-1">{question.text_de}</p>
        <p className="text-sm text-[var(--gold)]">→ {question.answer_de}</p>
        <div className="flex items-center gap-3 text-xs text-[var(--muted)] mt-1">
          <span>{'⭐'.repeat(question.difficulty)}</span>
          <button
            onClick={report}
            disabled={reported}
            className="hover:text-orange-400 transition-colors disabled:cursor-default"
            title="Frage als fehlerhaft melden"
          >
            {reported ? '✓ Gemeldet' : '⚑ Melden'}
          </button>
        </div>
      </div>
      <button
        onClick={onSwap}
        disabled={swapDisabled}
        className="flex-shrink-0 px-3 py-2 rounded-lg text-sm border border-[var(--dark-border)] hover:border-[var(--gold)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Frage tauschen"
      >
        🔄 <span className="hidden sm:inline">Tauschen</span>
      </button>
    </div>
  );
}
