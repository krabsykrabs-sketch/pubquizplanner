'use client';

import { useEffect, useState } from 'react';
import type { ExampleQuestion } from '@/types/quiz';

interface Props {
  categoryId: number;
}

export default function DifficultyPreview({ categoryId }: Props) {
  const [examples, setExamples] = useState<ExampleQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    fetch(`/api/questions/examples?categoryId=${categoryId}`)
      .then((res) => res.json())
      .then((data) => {
        setExamples(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categoryId]);

  if (!categoryId) return null;
  if (loading) return <p className="text-sm text-[var(--muted)]">Laden...</p>;
  if (examples.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
        Beispielfragen
      </p>
      {[1, 2, 3, 4].map((diff) => {
        const ex = examples.find((e) => e.difficulty === diff);
        if (!ex) return null;
        return (
          <div
            key={diff}
            className="bg-[var(--background)] border border-[var(--dark-border)] rounded-lg p-3 text-sm"
          >
            <span className="text-xs mr-2">{'⭐'.repeat(diff)}</span>
            <span className="text-[var(--foreground)]">{ex.text_de}</span>
            <span className="text-[var(--muted)] ml-2">→ {ex.answer_de}</span>
          </div>
        );
      })}
    </div>
  );
}
