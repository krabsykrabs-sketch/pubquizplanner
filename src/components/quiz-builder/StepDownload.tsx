'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { getSessionId } from '@/lib/session-id';
import type { QuizConfig, QuizQuestion } from '@/types/quiz';

interface RoundQuestions {
  questions: QuizQuestion[];
  expanded: boolean;
}

interface Props {
  config: QuizConfig;
  onChange: (config: QuizConfig) => void;
  roundsData: RoundQuestions[];
  onBack: () => void;
}

export default function StepDownload({ config, onChange, roundsData, onBack }: Props) {
  const t = useTranslations('generator');
  const [generatingPres, setGeneratingPres] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [generatingCheat, setGeneratingCheat] = useState(false);

  const download = async (
    endpoint: string,
    fileSuffix: string,
    setGenerating: (v: boolean) => void
  ) => {
    setGenerating(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-quiz-session': getSessionId() ?? '',
        },
        body: JSON.stringify({
          config: { ...config, title: config.title || t('quizTitleDefault') },
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
      a.download = `${(config.title || t('quizTitleDefault')).replace(/\s+/g, '_')}_${fileSuffix}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
    setGenerating(false);
  };

  const handleDownloadPresentation = () =>
    download('/api/generate-presentation', 'Praesentation.html', setGeneratingPres);
  const handleDownloadAnswerSheet = () =>
    download('/api/generate-answer-sheet', 'Antwortbogen.pdf', setGeneratingPdf);
  const handleDownloadCheatSheet = () =>
    download('/api/generate-cheat-sheet', 'Spickzettel.pdf', setGeneratingCheat);

  const totalQuestions = roundsData.reduce(
    (sum, r) => sum + r.questions.length,
    0
  );

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-[var(--gold)]">{t('step2')}</h2>

      {/* Event details — only needed for the generated files */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-6 space-y-4">
        <h3 className="font-bold">{t('eventDetails')}</h3>
        <div>
          <label className="block text-sm text-[var(--muted)] mb-1">
            {t('quizTitle')}
          </label>
          <input
            type="text"
            value={config.title}
            onChange={(e) => onChange({ ...config, title: e.target.value })}
            placeholder={t('quizTitleDefault')}
            className="w-full bg-[var(--background)] border border-[var(--dark-border)] rounded-lg px-4 py-3 text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none transition-colors"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              {t('date')}
            </label>
            <input
              type="date"
              value={config.date}
              onChange={(e) => onChange({ ...config, date: e.target.value })}
              className="w-full bg-[var(--background)] border border-[var(--dark-border)] rounded-lg px-4 py-3 text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--muted)] mb-1">
              {t('venue')}
            </label>
            <input
              type="text"
              value={config.venue}
              onChange={(e) => onChange({ ...config, venue: e.target.value })}
              className="w-full bg-[var(--background)] border border-[var(--dark-border)] rounded-lg px-4 py-3 text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-[var(--muted)] mb-2">
            {t('answerPlacement')}
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="answerPlacement"
                checked={config.answerPlacement === 'after_each'}
                onChange={() => onChange({ ...config, answerPlacement: 'after_each' })}
              />
              <span className="text-sm">{t('afterEach')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="answerPlacement"
                checked={config.answerPlacement === 'all_at_end'}
                onChange={() => onChange({ ...config, answerPlacement: 'all_at_end' })}
              />
              <span className="text-sm">{t('allAtEnd')}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-6 space-y-3">
        <h3 className="font-bold text-lg">{config.title || t('quizTitleDefault')}</h3>
        {config.date && (
          <p className="text-[var(--muted)] text-sm">📅 {config.date}</p>
        )}
        {config.venue && (
          <p className="text-[var(--muted)] text-sm">📍 {config.venue}</p>
        )}
        <p className="text-[var(--muted)] text-sm">
          {config.rounds.length} Runden · {totalQuestions} Fragen
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

        <button
          onClick={handleDownloadCheatSheet}
          disabled={generatingCheat}
          className="w-full border-2 border-[var(--gold)] text-[var(--gold)] py-4 rounded-xl font-bold text-lg hover:bg-[var(--gold)] hover:text-[var(--background)] transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {generatingCheat ? (
            <>⏳ {t('generating')}</>
          ) : (
            <>🗒️ {t('downloadCheatSheet')}</>
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
