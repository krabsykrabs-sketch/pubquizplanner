'use client';

import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  FileText,
  Loader2,
  MapPin,
  Presentation,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ds/Button';
import Card from '@/components/ds/Card';
import Input from '@/components/ds/Input';
import { categoryIcon } from '@/lib/category-visuals';
import { getSessionId } from '@/lib/session-id';
import { getQuizMode, DEFAULT_QUIZ_MODE } from '@/lib/quiz-modes';
import type { QuizConfig, QuizQuestion } from '@/types/quiz';
import ModeSelector from './ModeSelector';
import TimerSelector from './TimerSelector';

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

  // Which outputs the chosen mode offers (e.g. fast mode hides the answer sheet).
  const outputs = getQuizMode(config.mode ?? DEFAULT_QUIZ_MODE).outputs;

  const labelCls = 'mb-1 block text-sm font-medium text-[var(--text-muted)]';

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <h2 className="font-display text-[1.75rem] font-extrabold tracking-[-0.02em] text-[var(--text-strong)]">
        {t('step2')}
      </h2>

      {/* Event details — only needed for the generated files */}
      <Card padding="lg" className="space-y-4">
        <h3 className="font-display text-[1.15rem] font-bold text-[var(--text-strong)]">
          {t('eventDetails')}
        </h3>
        <div>
          <label className={labelCls}>{t('quizTitle')}</label>
          <Input
            type="text"
            value={config.title}
            onChange={(e) => onChange({ ...config, title: e.target.value })}
            placeholder={t('quizTitleDefault')}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>{t('date')}</label>
            <Input
              type="date"
              value={config.date}
              onChange={(e) => onChange({ ...config, date: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>{t('venue')}</label>
            <Input
              type="text"
              value={config.venue}
              onChange={(e) => onChange({ ...config, venue: e.target.value })}
            />
          </div>
        </div>
        <ModeSelector
          value={config.mode ?? DEFAULT_QUIZ_MODE}
          onChange={(mode) => onChange({ ...config, mode })}
        />
        <TimerSelector
          seconds={config.timerSeconds ?? 0}
          sound={config.timerSound ?? true}
          onChangeSeconds={(timerSeconds) => onChange({ ...config, timerSeconds })}
          onChangeSound={(timerSound) => onChange({ ...config, timerSound })}
        />
      </Card>

      {/* Summary */}
      <Card padding="lg" elevation="raised" className="space-y-3">
        <h3 className="font-display text-lg font-bold text-[var(--text-strong)]">
          {config.title || t('quizTitleDefault')}
        </h3>
        {config.date && (
          <p className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Calendar className="h-4 w-4" aria-hidden />
            <span className="font-mono">{config.date}</span>
          </p>
        )}
        {config.venue && (
          <p className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <MapPin className="h-4 w-4" aria-hidden />
            {config.venue}
          </p>
        )}
        <p className="text-sm text-[var(--text-muted)]">
          <span className="font-mono">{config.rounds.length}</span> Runden ·{' '}
          <span className="font-mono">{totalQuestions}</span> Fragen
        </p>
        <div className="space-y-1.5 border-t border-[var(--border-subtle)] pt-3">
          {config.rounds.map((round, i) => {
            const RoundIcon = categoryIcon(round.categorySlug);
            return (
              <p key={i} className="flex items-center gap-2 text-sm">
                <RoundIcon className="h-4 w-4 flex-none text-[var(--accent-text)]" aria-hidden />
                <span className="text-[var(--text-muted)]">
                  Runde <span className="font-mono">{i + 1}</span>:
                </span>{' '}
                <span className="text-[var(--text-strong)]">{round.categoryName}</span>
                <span className="font-mono text-xs text-[var(--text-faint)]">
                  ({roundsData[i]?.questions.length || 0} Fragen)
                </span>
              </p>
            );
          })}
        </div>
      </Card>

      {/* Download buttons */}
      <div className="space-y-4">
        {outputs.presentation && (
          <Button
            size="lg"
            fullWidth
            onClick={handleDownloadPresentation}
            disabled={generatingPres}
            iconLeft={
              generatingPres ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <Presentation className="h-5 w-5" aria-hidden />
              )
            }
          >
            {generatingPres ? t('generating') : t('downloadPresentation')}
          </Button>
        )}

        {outputs.answerSheet && (
          <Button
            size="lg"
            fullWidth
            variant="secondary"
            onClick={handleDownloadAnswerSheet}
            disabled={generatingPdf}
            iconLeft={
              generatingPdf ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <FileText className="h-5 w-5" aria-hidden />
              )
            }
          >
            {generatingPdf ? t('generating') : t('downloadAnswerSheet')}
          </Button>
        )}

        {outputs.cheatSheet && (
          <Button
            size="lg"
            fullWidth
            variant="secondary"
            onClick={handleDownloadCheatSheet}
            disabled={generatingCheat}
            iconLeft={
              generatingCheat ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <ClipboardList className="h-5 w-5" aria-hidden />
              )
            }
          >
            {generatingCheat ? t('generating') : t('downloadCheatSheet')}
          </Button>
        )}
      </div>

      <Button
        variant="ghost"
        fullWidth
        onClick={onBack}
        iconLeft={<ArrowLeft className="h-4 w-4" aria-hidden />}
      >
        {t('back')}
      </Button>
    </div>
  );
}
