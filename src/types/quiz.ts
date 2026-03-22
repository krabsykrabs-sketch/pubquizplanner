export interface Category {
  id: number;
  slug: string;
  name_de: string;
  name_en: string | null;
  icon: string | null;
  sort_order: number;
}

export interface Question {
  id: number;
  category_id: number;
  text_de: string;
  text_de_open: string | null;
  text_en: string | null;
  answer_de: string;
  answer_en: string | null;
  fun_fact_de: string | null;
  fun_fact_en: string | null;
  difficulty: number;
  wrong_answers_de: string[] | null;
  round_type: string;
  tags: string[];
  image_url: string | null;
  audio_url: string | null;
  is_current_event: boolean;
  current_event_week: string | null;
  verified: boolean;
  status: string;
  verification_note: string | null;
  generation_batch_id: string | null;
  times_served: number;
  created_at: string;
  updated_at: string;
}

export interface RoundConfig {
  roundNumber: number;
  categoryId: number;
  categorySlug: string;
  categoryName: string;
  categoryIcon: string;
  difficulty: number[];
  questionsPerRound: number;
  roundType: 'standard' | 'multiple_choice';
}

export interface QuizConfig {
  title: string;
  date: string;
  venue: string;
  numberOfRounds: number;
  answerPlacement: 'after_each' | 'all_at_end';
  rounds: RoundConfig[];
}

export interface QuizQuestion extends Question {
  roundNumber: number;
  questionNumber: number;
}

export interface AssembledQuiz {
  config: QuizConfig;
  rounds: {
    config: RoundConfig;
    questions: QuizQuestion[];
  }[];
}
