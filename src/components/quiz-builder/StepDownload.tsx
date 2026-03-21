'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { QuizConfig, QuizQuestion } from '@/types/quiz';

interface RoundQuestions {
  questions: QuizQuestion[];
  expanded: boolean;
}

interface Props {
  config: QuizConfig;
  roundsData: RoundQuestions[];
  onBack: () => void;
}

export default function StepDownload({ config, roundsData, onBack }: Props) {
  const t = useTranslations('generator');
  const [generatingPres, setGeneratingPres] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleDownloadPresentation = async () => {
    setGeneratingPres(true);
    try {
      const res = await fetch('/api/generate-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          rounds: roundsData.map((r, i) => ({
            config: config.rounds[i],
            questions: r.questions,
          })),
        }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.title.replace(/\s+/g, '_')}_Praesentation.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
    setGeneratingPres(false);
  };

  const handleDownloadAnswerSheet = async () => {
    setGeneratingPdf(true);
    try {
      const res = await fetch('/api/generate-answer-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          rounds: roundsData.map((r, i) => ({
            config: config.rounds[i],
            questions: r.questions,
          })),
        }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.title.replace(/\s+/g, '_')}_Antwortbogen.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
    setGeneratingPdf(false);
  };

  const totalQuestions = roundsData.reduce(
    (sum, r) => sum + r.questions.length,
    0
  );

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-[var(--gold)]">{t('step4')}</h2>

      {/* Summary */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-6 space-y-3">
        <h3 className="font-bold text-lg">{config.title}</h3>
        {config.date && (
          <p className="text-[var(--muted)] text-sm">📅 {config.date}</p>
        )}
        {config.venue && (
          <p className="text-[var(--muted)] text-sm">📍 {config.venue}</p>
        )}
        <p className="text-[var(--muted)] text-sm">
          {config.numberOfRounds} Runden · {totalQuestions} Fragen
        </p>
        <div className="space-y-1 pt-2 border-t border-[var(--dark-border)]">
          {config.rounds.map((round, i) => (
            <p key={i} className="text-sm">
              <span className="text-[var(--muted)]">
                {round.categoryIcon} Runde {i + 1}:
              </span>{' '}
              {round.categoryName}{' '}
              <span className="text-[var(--muted)]">
                ({roundsData[i]?.questions.length || 0} Fragen)
              </span>
            </p>
          ))}
        </div>
      </div>

      {/* Download buttons */}
      <div className="space-y-4">
        <button
          onClick={handleDownloadPresentation}
          disabled={generatingPres}
          className="w-full bg-[var(--gold)] text-[var(--background)] py-4 rounded-xl font-bold text-lg hover:bg-[var(--gold-light)] transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {generatingPres ? (
            <>⏳ {t('generating')}</>
          ) : (
            <>🖥️ {t('downloadPresentation')}</>
          )}
        </button>

        <button
          onClick={handleDownloadAnswerSheet}
          disabled={generatingPdf}
          className="w-full border-2 border-[var(--gold)] text-[var(--gold)] py-4 rounded-xl font-bold text-lg hover:bg-[var(--gold)] hover:text-[var(--background)] transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {generatingPdf ? (
            <>⏳ {t('generating')}</>
          ) : (
            <>📄 {t('downloadAnswerSheet')}</>
          )}
        </button>
      </div>

      <button
        onClick={onBack}
        className="w-full border border-[var(--dark-border)] py-3 rounded-lg font-bold hover:border-[var(--gold)] transition-colors"
      >
        ← {t('back')}
      </button>
    </div>
  );
}
