'use client';

import type { QuizQuestion } from '@/types/quiz';

interface Props {
  question: QuizQuestion;
  onSwap: () => void;
  swapDisabled: boolean;
}

export default function QuestionCard({ question, onSwap, swapDisabled }: Props) {
  return (
    <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg p-4 flex items-start gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--gold)] bg-opacity-20 flex items-center justify-center text-sm font-mono text-[var(--gold)]">
        {question.questionNumber}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[var(--foreground)] mb-1">{question.text_de}</p>
        <p className="text-sm text-[var(--gold)]">→ {question.answer_de}</p>
        <div className="text-xs text-[var(--muted)] mt-1">
          {'⭐'.repeat(question.difficulty)}
        </div>
      </div>
      <button
        onClick={onSwap}
        disabled={swapDisabled}
        className="flex-shrink-0 px-3 py-2 rounded-lg text-sm border border-[var(--dark-border)] hover:border-[var(--gold)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        title="Frage tauschen"
      >
        🔄
      </button>
    </div>
  );
}
