import { query } from './db';
import type { Question, QuizConfig, QuizQuestion, AssembledQuiz } from '@/types/quiz';

export async function assembleQuiz(config: QuizConfig): Promise<AssembledQuiz> {
  const rounds = await Promise.all(
    config.rounds.map(async (roundConfig) => {
      const questions = await fetchQuestionsForRound(
        roundConfig.categoryId,
        roundConfig.difficulty,
        roundConfig.questionsPerRound,
        roundConfig.roundType,
        []
      );

      const quizQuestions: QuizQuestion[] = questions.map((q, i) => ({
        ...q,
        roundNumber: roundConfig.roundNumber,
        questionNumber: i + 1,
      }));

      return { config: roundConfig, questions: quizQuestions };
    })
  );

  return { config, rounds };
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
