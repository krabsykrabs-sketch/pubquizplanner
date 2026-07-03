import { getTranslations } from 'next-intl/server';
import type { SampleQuestion } from './types';

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
    <section className="max-w-4xl mx-auto px-6 pb-16">
      <h3 className="text-center text-lg font-medium text-[var(--muted)] mb-6">
        {t('sampleQuestionsHeadline')}
      </h3>
      <div className="grid md:grid-cols-3 gap-4">
        {questions.map((q, i) => (
          <div
            key={i}
            className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 text-left"
          >
            <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-3">
              <span>{q.category_icon}</span>
              <span>{q.category_name_de}</span>
            </div>
            <p className="text-sm font-medium text-[var(--foreground)] mb-2 leading-snug">
              {q.text_de}
            </p>
            <p className="text-sm text-[var(--gold)] font-semibold mb-2">
              {q.answer_de}
            </p>
            {q.fun_fact_de && (
              <p className="text-xs text-[var(--muted)] leading-relaxed border-t border-[var(--dark-border)] pt-2 mt-2">
                <span className="text-[var(--gold-light)] font-medium">
                  {t('funFact')}:
                </span>{' '}
                {q.fun_fact_de}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
