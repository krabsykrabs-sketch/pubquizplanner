import { query } from './db';
import type { Question, QuizConfig, QuizQuestion, AssembledQuiz } from '@/types/quiz';

export async function assembleQuiz(config: QuizConfig): Promise<AssembledQuiz> {
  // Track used answers across all rounds to prevent duplicates
  const usedAnswers = new Set<string>();

  const rounds = [];
  for (const roundConfig of config.rounds) {
    const questions = await fetchQuestionsDeduped(
      roundConfig.categoryId,
      roundConfig.difficulty,
      roundConfig.questionsPerRound,
      roundConfig.roundType,
      [],
      usedAnswers
    );

    const quizQuestions: QuizQuestion[] = questions.map((q, i) => ({
      ...q,
      // For standard rounds, prefer the open-ended version of the question
      text_de: roundConfig.roundType === 'standard' && q.text_de_open
        ? q.text_de_open
        : q.text_de,
      roundNumber: roundConfig.roundNumber,
      questionNumber: i + 1,
    }));

    rounds.push({ config: roundConfig, questions: quizQuestions });
  }

  return { config, rounds };
}

/**
 * Fetch questions while ensuring no answer_de duplicates with already-used answers.
 * Fetches extra candidates and filters, falling back to allow duplicates if not enough.
 */
async function fetchQuestionsDeduped(
  categoryId: number,
  difficulty: number[],
  count: number,
  roundType: string,
  excludeIds: number[],
  usedAnswers: Set<string>
): Promise<Question[]> {
  // Fetch more than needed so we can filter out answer duplicates
  const overFetchCount = Math.min(count * 3, count + 20);
  const candidates = await fetchQuestionsForRound(
    categoryId,
    difficulty,
    overFetchCount,
    roundType,
    excludeIds
  );

  const selected: Question[] = [];
  for (const q of candidates) {
    if (selected.length >= count) break;

    const normalizedAnswer = q.answer_de.toLowerCase().trim();
    if (usedAnswers.has(normalizedAnswer)) continue;

    selected.push(q);
    usedAnswers.add(normalizedAnswer);
  }

  // If we couldn't fill the quota without duplicates, allow them rather than return fewer
  if (selected.length < count) {
    for (const q of candidates) {
      if (selected.length >= count) break;
      if (!selected.some((s) => s.id === q.id)) {
        selected.push(q);
      }
    }
  }

  return selected;
}

export async function fetchQuestionsForRound(
  categoryId: number,
  difficulty: number[],
  count: number,
  roundType: string,
  excludeIds: number[]
): Promise<Question[]> {
  const params: unknown[] = [categoryId, count];
  let paramIndex = 3;

  // Difficulty filter — if all 4 selected, no filter needed
  let difficultyClause = '';
  if (difficulty.length > 0 && difficulty.length < 4) {
    const placeholders = difficulty.map((_, i) => `$${paramIndex + i}`).join(', ');
    difficultyClause = `AND difficulty IN (${placeholders})`;
    params.push(...difficulty);
    paramIndex += difficulty.length;
  }

  // Multiple choice rounds require wrong_answers_de with 3 entries
  let mcClause = '';
  if (roundType === 'multiple_choice') {
    mcClause = 'AND wrong_answers_de IS NOT NULL AND array_length(wrong_answers_de, 1) >= 3';
  }

  // Exclude IDs
  let excludeClause = '';
  if (excludeIds.length > 0) {
    const placeholders = excludeIds.map((_, i) => `$${paramIndex + i}`).join(', ');
    excludeClause = `AND id NOT IN (${placeholders})`;
    params.push(...excludeIds);
  }

  const rows = await query<Question>(
    `SELECT * FROM questions
     WHERE category_id = $1
     AND status = 'approved'
     ${difficultyClause}
     ${mcClause}
     ${excludeClause}
     ORDER BY times_served ASC, RANDOM()
     LIMIT $2`,
    params
  );

  return rows;
}

export async function fetchSwapQuestion(
  categoryId: number,
  difficulty: number[],
  roundType: string,
  excludeIds: number[]
): Promise<Question | null> {
  const questions = await fetchQuestionsForRound(
    categoryId,
    difficulty,
    1,
    roundType,
    excludeIds
  );
  return questions[0] || null;
}
