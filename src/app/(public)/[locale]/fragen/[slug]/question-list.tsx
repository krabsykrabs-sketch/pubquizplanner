'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, ChevronDown, Lightbulb } from 'lucide-react';
import type { Question } from '@/types/quiz';

interface Props {
  questions: Question[];
  locale: string;
}

export function QuestionList({ questions, locale }: Props) {
  return (
    <div className="space-y-3">
      {questions.map((q, index) => (
        <QuestionItem key={q.id} question={q} index={index} locale={locale} />
      ))}
    </div>
  );
}

function QuestionItem({ question: q, index, locale }: { question: Question; index: number; locale: string }) {
  const t = useTranslations('fragen');
  // CTA box after every 10 questions
  const showCta = (index + 1) % 10 === 0;

  return (
    <>
      <details className="group overflow-hidden rounded-ds-lg border border-[var(--border-subtle)] bg-[var(--surface-card)]">
        <summary className="flex cursor-pointer select-none list-none items-start gap-3 p-4 [&::-webkit-details-marker]:hidden">
          <span className="mt-px inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] px-1.5 font-mono text-xs font-medium text-[var(--accent-text)]">
            {index + 1}
          </span>
          <span className="flex-1">
            <span className="text-[var(--text-body)]">{q.text_de}</span>
          </span>
          <ChevronDown
            className="mt-1 h-4 w-4 shrink-0 text-[var(--text-faint)] transition-transform group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <div className="border-t border-[var(--border-subtle)] px-4 pb-4 pt-3">
          <p className="mb-1 font-medium text-[var(--accent-text)]">
            &rarr; {q.answer_de}
          </p>
          {q.fun_fact_de && (
            <p className="flex items-start gap-1.5 text-sm italic text-[var(--text-muted)]">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {q.fun_fact_de}
            </p>
          )}
        </div>
      </details>

      {showCta && (
        <div className="my-4 rounded-ds-lg bg-[var(--accent-soft)] p-5 text-center">
          <p className="mb-2 text-sm text-[var(--accent-text)]">
            {t('inlineCtaText')}
          </p>
          <Link
            href={`/${locale}/generator`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--link)] no-underline transition-colors hover:text-[var(--link-hover)]"
          >
            {t('ctaButton')}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      )}
    </>
  );
}
