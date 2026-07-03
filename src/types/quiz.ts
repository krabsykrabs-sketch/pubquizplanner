export interface Category {
  id: number;
  slug: string;
  // For non-German locales the serving queries alias the localized name
  // onto name_de, so components can stay locale-agnostic.
  name_de: string;
  icon: string | null;
  sort_order: number;
}

export interface Question {
  id: number;
  category_id: number;
  // For non-German locales the serving queries alias translated content
  // onto the *_de fields (historical naming), so components stay unchanged.
  text_de: string;
  answer_de: string;
  fun_fact_de: string | null;
  // null / 'standard' = normal open-answer question; 'estimation' = Schätzfrage
  // (numeric answer in answer_de, scored closest-wins by the host).
  question_type: string | null;
  difficulty: number;
  round_type: string;
  tags: string[];
  image_url: string | null;
  audio_url: string | null;
  is_current_event: boolean;
  current_event_week: string | null;
  verified: boolean;
  status: string;
  verification_note: string | null;
  source: string | null;
  generation_batch_id: string | null;
  is_highlight: boolean;
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
  questionsPerRound: number;
}

export interface QuizConfig {
  title: string;
  date: string;
  venue: string;
  locale: string;
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
