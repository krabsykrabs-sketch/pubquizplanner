'use client';

import { BarChart3, Check, Flag, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Badge from '@/components/ds/Badge';
import { getSessionId } from '@/lib/session-id';
import type { QuizQuestion } from '@/types/quiz';

interface Props {
  question: QuizQuestion;
  onSwap: () => void;
  swapDisabled: boolean;
}

export default function QuestionCard({ question, onSwap, swapDisabled }: Props) {
  const t = useTranslations('generator');
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
    <div className="flex items-start gap-4 rounded-ds-lg border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-4">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-ds bg-[var(--accent-soft)] font-mono text-sm font-semibold text-[var(--accent-text)]">
        {String(question.questionNumber).padStart(2, '0')}
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 font-medium text-[var(--text-strong)]">{question.text_de}</p>
        <p className="text-sm text-[var(--accent-text)]">→ {question.answer_de}</p>
        {question.question_type === 'estimation' && (
          <div className="mt-1.5">
            <Badge tone="accent">
              <BarChart3 className="h-3 w-3" aria-hidden />
              Schätzfrage
            </Badge>
          </div>
        )}
        <div className="mt-1.5 flex items-center gap-3 text-xs text-[var(--text-muted)]">
          <button
            onClick={report}
            disabled={reported}
            className="inline-flex items-center gap-1 transition-colors hover:text-[var(--danger)] disabled:cursor-default disabled:hover:text-[var(--text-muted)]"
            title={t('reportQuestion')}
          >
            {reported ? (
              <>
                <Check className="h-3 w-3" aria-hidden />
                {t('reported')}
              </>
            ) : (
              <>
                <Flag className="h-3 w-3" aria-hidden />
                {t('reportQuestion')}
              </>
            )}
          </button>
        </div>
      </div>
      <button
        onClick={onSwap}
        disabled={swapDisabled}
        className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-ds border-[1.5px] border-[var(--border-strong)] bg-[var(--surface-card)] px-3 py-2 text-sm font-medium text-[var(--text-body)] transition-colors hover:bg-[var(--surface-inset)] disabled:cursor-not-allowed disabled:opacity-30"
        title={t('swap')}
      >
        <RefreshCw className={`h-3.5 w-3.5 ${swapDisabled ? 'animate-spin' : ''}`} aria-hidden />
        <span className="hidden sm:inline">{t('swap')}</span>
      </button>
    </div>
  );
}
