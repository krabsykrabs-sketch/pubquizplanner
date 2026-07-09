import { Shuffle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Card from '@/components/ds/Card';
import { categoryIcon } from '@/lib/category-visuals';
import type { SampleQuestion } from './types';

const TILTS = ['rotate(-1deg)', 'rotate(0.6deg)', 'rotate(-0.8deg)'];

/** Circular "answer coaster": amber ring, dashed inner ring, answer stamped in the middle. */
function AnswerCoaster({ answer, label }: { answer: string; label: string }) {
  // Long answers step down so the stamp keeps reading cleanly.
  const size =
    answer.length <= 12
      ? 'text-[1.05rem]'
      : answer.length <= 20
        ? 'text-[0.85rem]'
        : 'text-[0.7rem]';
  return (
    <div className="relative h-[92px] w-[92px] flex-none" style={{ transform: 'rotate(-3deg)' }}>
      <div
        className="absolute inset-0 rounded-full border-[2.5px] border-[var(--amber-500)] bg-[var(--warm-50)]"
        style={{ boxShadow: '0 4px 12px rgba(74,42,22,0.22)' }}
      />
      <div
        className="absolute inset-[7px] rounded-full border-[1.5px] border-dashed"
        style={{ borderColor: 'rgba(217,110,42,0.5)' }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-px p-2">
        <span className="font-mono text-[0.48rem] uppercase tracking-[0.16em] text-[var(--amber-700)]">
          {label}
        </span>
        <span
          className={`text-center font-display font-extrabold leading-none text-[var(--amber-700)] ${size}`}
        >
          {answer}
        </span>
      </div>
    </div>
  );
}

// Three real sample questions (with answers + fun facts) as content depth /
// social proof. Renders nothing when there are none.
export default async function SampleQuestions({
  questions,
}: {
  questions: SampleQuestion[];
}) {
  if (questions.length === 0) return null;
  const t = await getTranslations('landing');

  return (
    <section id="fragen" className="bg-[var(--bg-page)] py-[60px] nav:py-[92px]">
      <div className="mx-auto max-w-container px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--accent-text)]">
              {t('kickerSample')}
            </span>
            <h3 className="mb-0 mt-2.5 font-display text-[1.75rem] font-extrabold tracking-[-0.02em] text-[var(--text-strong)]">
              {t('sampleTitle')}
            </h3>
          </div>
          <span className="inline-flex items-center gap-[7px] font-mono text-[0.72rem] tracking-[0.05em] text-[var(--text-faint)]">
            <Shuffle className="h-3.5 w-3.5" aria-hidden />
            {t('sampleShuffle')}
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 nav:grid-cols-3">
          {questions.map((q, i) => {
            const Icon = categoryIcon(q.category_slug);
            return (
              <div key={i} style={{ transform: TILTS[i % TILTS.length] }}>
                <Card padding="lg" elevation="raised" className="h-full">
                  <div className="mb-4 flex items-center gap-[9px]">
                    <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-ds bg-[var(--accent-soft)] text-[var(--accent-text)]">
                      <Icon className="h-[18px] w-[18px]" aria-hidden />
                    </span>
                    <span className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-[var(--text-muted)]">
                      {q.category_name_de}
                    </span>
                  </div>
                  <p className="mb-5 mt-0 min-h-[3.1em] font-display text-[1.24rem] font-bold leading-[1.25] tracking-[-0.01em] text-[var(--text-strong)] [text-wrap:pretty]">
                    {q.text_de}
                  </p>
                  <div className="flex items-center gap-3.5 border-t border-[var(--border-subtle)] pt-[18px]">
                    <AnswerCoaster answer={q.answer_de} label={t('sampleAnswerLabel')} />
                    {q.fun_fact_de && (
                      <div className="flex-1">
                        <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--text-faint)]">
                          {t('funFact')}
                        </span>
                        <p className="mb-0 mt-1 text-[0.85rem] leading-[1.5] text-[var(--text-muted)]">
                          {q.fun_fact_de}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
