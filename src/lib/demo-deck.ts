import { query, queryOne } from './db';
import { SOURCE_LOCALE, EXTRA_LOCALES } from '@/config/locales';
import { DEFAULT_QUIZ_MODE, type QuizMode } from './quiz-modes';
import type { AssembledQuiz, Question, QuizQuestion, RoundConfig } from '@/types/quiz';

// The saved demo deck is stored as structure only (question IDs + round
// grouping), never baked text — so one saved deck renders in every locale when
// assembled at serve time. See scripts/migrate-add-demo-deck.ts.

export interface DemoDeckRound {
  categoryId: number;
  categorySlug: string;
  questionIds: number[];
}

export interface DemoDeck {
  mode: QuizMode;
  rounds: DemoDeckRound[];
}

// Demo sizing — small enough to feel like a taste, real enough to show the
// product. Tunable in one place.
const DEMO_ROUNDS = 3;
const DEMO_QUESTIONS_PER_ROUND = 3;

// --- Persistence (single pinned row, id = 1) ------------------------------

export async function getStoredDemoDeck(): Promise<DemoDeck | null> {
  const row = await queryOne<{ deck: DemoDeck }>(
    'SELECT deck FROM demo_deck WHERE id = 1'
  );
  return row?.deck ?? null;
}

export async function saveDemoDeck(deck: DemoDeck): Promise<void> {
  await query(
    `INSERT INTO demo_deck (id, deck, updated_at)
     VALUES (1, $1, now())
     ON CONFLICT (id) DO UPDATE SET deck = EXCLUDED.deck, updated_at = now()`,
    [JSON.stringify(deck)]
  );
}

export async function getDemoDeckUpdatedAt(): Promise<string | null> {
  const row = await queryOne<{ updated_at: string }>(
    'SELECT updated_at FROM demo_deck WHERE id = 1'
  );
  return row?.updated_at ?? null;
}

// True once the storage table exists (migration applied), regardless of whether
// a deck has been saved yet — the homepage uses this to decide whether to show
// the demo entry point at all, so it stays unbroken before the migration runs.
export async function isDemoStorageReady(): Promise<boolean> {
  try {
    await getStoredDemoDeck();
    return true;
  } catch {
    return false;
  }
}

// Returns the saved deck, lazily seeding a random one on first ever request so
// the homepage demo is never broken once storage exists.
export async function ensureDemoDeck(): Promise<DemoDeck> {
  const existing = await getStoredDemoDeck();
  if (existing) return existing;
  const fresh = await generateRandomDemoDeck();
  await saveDemoDeck(fresh);
  return fresh;
}

// --- Generation (v1: random spread across categories) ---------------------

interface EligibleQuestion {
  id: number;
  category_id: number;
  slug: string;
}

// Only questions approved AND translated in every non-source locale are
// eligible, so the same deck renders fully in de/nl/pl/sv.
async function getEligibleQuestions(): Promise<EligibleQuestion[]> {
  if (EXTRA_LOCALES.length === 0) {
    return query<EligibleQuestion>(
      `SELECT q.id, q.category_id, c.slug
       FROM questions q JOIN categories c ON c.id = q.category_id
       WHERE q.status = 'approved'`
    );
  }
  return query<EligibleQuestion>(
    `SELECT q.id, q.category_id, c.slug
     FROM questions q
     JOIN categories c ON c.id = q.category_id
     JOIN question_translations t ON t.question_id = q.id
       AND t.locale = ANY($1) AND t.status IN ('machine', 'reviewed')
     WHERE q.status = 'approved'
     GROUP BY q.id, q.category_id, c.slug
     HAVING COUNT(DISTINCT t.locale) = $2`,
    [EXTRA_LOCALES, EXTRA_LOCALES.length]
  );
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build a fresh random demo deck. Picks a spread of distinct categories that
// have enough eligible questions, then random questions within each.
export async function generateRandomDemoDeck(): Promise<DemoDeck> {
  const eligible = await getEligibleQuestions();
  if (eligible.length === 0) {
    throw new Error('No eligible questions to build a demo deck.');
  }

  const byCategory = new Map<number, EligibleQuestion[]>();
  for (const q of eligible) {
    const list = byCategory.get(q.category_id) ?? [];
    list.push(q);
    byCategory.set(q.category_id, list);
  }

  const usableCategories = shuffle(
    Array.from(byCategory.values()).filter(
      (qs) => qs.length >= DEMO_QUESTIONS_PER_ROUND
    )
  ).slice(0, DEMO_ROUNDS);

  if (usableCategories.length === 0) {
    throw new Error('No category has enough eligible questions for a demo round.');
  }

  const rounds: DemoDeckRound[] = usableCategories.map((qs) => {
    const picked = shuffle(qs).slice(0, DEMO_QUESTIONS_PER_ROUND);
    return {
      categoryId: picked[0].category_id,
      categorySlug: picked[0].slug,
      questionIds: picked.map((q) => q.id),
    };
  });

  return { mode: DEFAULT_QUIZ_MODE, rounds };
}

// --- Assembly (hydrate a stored deck in a given locale) -------------------

interface CategoryMeta {
  id: number;
  name: string;
  icon: string;
}

async function getCategoryMeta(
  categoryIds: number[],
  locale: string
): Promise<Map<number, CategoryMeta>> {
  if (categoryIds.length === 0) return new Map();
  const rows =
    locale === SOURCE_LOCALE
      ? await query<CategoryMeta>(
          `SELECT id, name_de AS name, icon FROM categories WHERE id = ANY($1)`,
          [categoryIds]
        )
      : await query<CategoryMeta>(
          `SELECT c.id, COALESCE(ct.name, c.name_de) AS name, c.icon
           FROM categories c
           LEFT JOIN category_translations ct
             ON ct.category_id = c.id AND ct.locale = $2
           WHERE c.id = ANY($1)`,
          [categoryIds, locale]
        );
  return new Map(rows.map((r) => [r.id, r]));
}

async function getQuestionsById(
  ids: number[],
  locale: string
): Promise<Map<number, Question>> {
  if (ids.length === 0) return new Map();
  const rows =
    locale === SOURCE_LOCALE
      ? await query<Question>(`SELECT * FROM questions WHERE id = ANY($1)`, [ids])
      : await query<Question>(
          `SELECT q.*, t.text AS text_de, t.answer AS answer_de, t.fun_fact AS fun_fact_de
           FROM questions q
           JOIN question_translations t ON t.question_id = q.id
             AND t.locale = $2 AND t.status IN ('machine', 'reviewed')
           WHERE q.id = ANY($1)`,
          [ids, locale]
        );
  return new Map(rows.map((r) => [r.id, r]));
}

// Turn a stored deck into a fully-hydrated AssembledQuiz in `locale`, ready for
// buildPresentation. Questions missing in the locale are skipped; empty rounds
// are dropped. Returns null if nothing renders.
export async function assembleDemoDeck(
  deck: DemoDeck,
  locale: string,
  title: string
): Promise<AssembledQuiz | null> {
  const allIds = deck.rounds.flatMap((r) => r.questionIds);
  const categoryIds = deck.rounds.map((r) => r.categoryId);
  const [questionMap, categoryMap] = await Promise.all([
    getQuestionsById(allIds, locale),
    getCategoryMeta(categoryIds, locale),
  ]);

  const rounds: AssembledQuiz['rounds'] = [];
  deck.rounds.forEach((r, roundIndex) => {
    const cat = categoryMap.get(r.categoryId);
    if (!cat) return;
    const questions: QuizQuestion[] = [];
    r.questionIds.forEach((id) => {
      const q = questionMap.get(id);
      if (!q) return;
      questions.push({
        ...q,
        roundNumber: roundIndex + 1,
        questionNumber: questions.length + 1,
      });
    });
    if (questions.length === 0) return;
    const roundConfig: RoundConfig = {
      roundNumber: rounds.length + 1,
      categoryId: cat.id,
      categorySlug: r.categorySlug,
      categoryName: cat.name,
      categoryIcon: cat.icon ?? '',
      questionsPerRound: questions.length,
    };
    rounds.push({ config: roundConfig, questions });
  });

  if (rounds.length === 0) return null;

  return {
    config: {
      title,
      date: '',
      venue: '',
      locale,
      numberOfRounds: rounds.length,
      mode: deck.mode ?? DEFAULT_QUIZ_MODE,
      rounds: rounds.map((r) => r.config),
    },
    rounds,
  };
}

export const DEMO_DECK_SIZING = { DEMO_ROUNDS, DEMO_QUESTIONS_PER_ROUND };
