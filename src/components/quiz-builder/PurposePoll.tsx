'use client';

import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Card from '@/components/ds/Card';
import Tag from '@/components/ds/Tag';
import { getSessionId } from '@/lib/session-id';
import { QUIZ_PURPOSES, type QuizPurpose } from '@/lib/quiz-purpose';

// One optional, anonymous click on the download step: who is this quiz for?
// Answers tell us whether the audience is classrooms, teams, pubs or families
// (branding + any paid offer). Asked once per visit: after an answer — or if
// one was already given this visit — the card is replaced by a short thanks.
const STORAGE_KEY = 'pqp_purpose';

function readAnswered(): boolean {
  try {
    return !!sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

export default function PurposePoll() {
  const t = useTranslations('generator');
  const locale = useLocale();
  // null until mounted so server and first client render match.
  const [state, setState] = useState<'ask' | 'thanks' | 'hidden' | null>(null);

  useEffect(() => {
    setState(readAnswered() ? 'hidden' : 'ask');
  }, []);

  const answer = (purpose: QuizPurpose) => {
    setState('thanks');
    try {
      sessionStorage.setItem(STORAGE_KEY, purpose);
    } catch {
      // storage unavailable — the server still dedupes per visit
    }
    fetch('/api/quiz-purpose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purpose, sessionId: getSessionId(), locale }),
      keepalive: true,
    }).catch(() => {});
  };

  if (state === null || state === 'hidden') return null;

  if (state === 'thanks') {
    return (
      <p className="flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
        <Check className="h-4 w-4 text-[var(--accent-text)]" aria-hidden />
        {t('purposeThanks')}
      </p>
    );
  }

  return (
    <Card padding="md" className="space-y-3">
      <div>
        <h3 className="font-display text-base font-bold text-[var(--text-strong)]">
          {t('purposeQuestion')}
        </h3>
        <p className="text-xs text-[var(--text-faint)]">{t('purposeNote')}</p>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={t('purposeQuestion')}>
        {QUIZ_PURPOSES.map((p) => (
          <Tag key={p} onClick={() => answer(p)}>
            {t(`purpose_${p}`)}
          </Tag>
        ))}
      </div>
    </Card>
  );
}
