// Central definition of the generator's quiz modes. Everything that differs
// between modes lives HERE — slide sequencing and which output files are
// offered — so adding a new mode (or a new per-mode difference) is a single
// edit to this table rather than scattered `if (mode === ...)` checks.

export type QuizMode = 'pub_quiz' | 'fast';

export type AnswerPlacement = 'after_each' | 'all_at_end';

export interface QuizModeConfig {
  /** Where answer slides go in the presentation. */
  answerPlacement: AnswerPlacement;
  /** Which downloadable outputs this mode offers. */
  outputs: {
    presentation: boolean;
    answerSheet: boolean;
    cheatSheet: boolean;
  };
}

export const DEFAULT_QUIZ_MODE: QuizMode = 'pub_quiz';

export const QUIZ_MODES: Record<QuizMode, QuizModeConfig> = {
  // Kneipenquiz: all questions first, all answers gathered at the end. The
  // answer sheet is the scoring artefact for teams.
  pub_quiz: {
    answerPlacement: 'all_at_end',
    outputs: { presentation: true, answerSheet: true, cheatSheet: true },
  },
  // Schnelles Quiz: answer revealed right after each question. Answers are
  // inline, so a separate answer sheet would be redundant — omit it.
  fast: {
    answerPlacement: 'after_each',
    outputs: { presentation: true, answerSheet: false, cheatSheet: true },
  },
};

export const QUIZ_MODE_ORDER: QuizMode[] = ['pub_quiz', 'fast'];

// Tolerant lookup — falls back to the default mode for undefined/unknown input
// (e.g. an older saved config or a hand-built deck without a mode).
export function getQuizMode(mode: QuizMode | undefined | null): QuizModeConfig {
  return (mode && QUIZ_MODES[mode]) || QUIZ_MODES[DEFAULT_QUIZ_MODE];
}
