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
  difficulty: number | 'mixed',
  count: number,
  roundType: string,
  excludeIds: number[]
): Promise<Question[]> {
  let difficultyClause = '';
  const params: unknown[] = [categoryId, roundType, count];

  if (difficulty !== 'mixed') {
    difficultyClause = 'AND difficulty = $4';
    params.push(difficulty);
  }

  let excludeClause = '';
  if (excludeIds.length > 0) {
    const placeholderStart = params.length + 1;
    const placeholders = excludeIds.map((_, i) => `$${placeholderStart + i}`).join(', ');
    excludeClause = `AND id NOT IN (${placeholders})`;
    params.push(...excludeIds);
  }

  const rows = await query<Question>(
    `SELECT * FROM questions
     WHERE category_id = $1 AND round_type = $2
     ${difficultyClause}
     ${excludeClause}
     ORDER BY times_served ASC, RANDOM()
     LIMIT $3`,
    params
  );

  return rows;
}

export async function fetchSwapQuestion(
  categoryId: number,
  difficulty: number | 'mixed',
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
