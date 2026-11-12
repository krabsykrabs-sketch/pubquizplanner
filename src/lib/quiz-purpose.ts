// Answers for the one-click "Wofür ist dein Quiz?" poll on the generator's
// download step. Shared by the poll UI, the API allow-list and the admin
// dashboard so the three never drift.
export const QUIZ_PURPOSES = ['school', 'work', 'pub', 'private'] as const;
export type QuizPurpose = (typeof QUIZ_PURPOSES)[number];

export function isQuizPurpose(value: unknown): value is QuizPurpose {
  return typeof value === 'string' && (QUIZ_PURPOSES as readonly string[]).includes(value);
}

/** German labels for the admin dashboard / CSV export. */
export const QUIZ_PURPOSE_LABELS_DE: Record<QuizPurpose, string> = {
  school: 'Schule / Unterricht',
  work: 'Firma / Team',
  pub: 'Kneipe / Verein',
  private: 'Privat / Familie',
};
