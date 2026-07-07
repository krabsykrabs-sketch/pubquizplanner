export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  generateRandomDemoDeck,
  getStoredDemoDeck,
  getDemoDeckUpdatedAt,
  saveDemoDeck,
  type DemoDeck,
} from '@/lib/demo-deck';

interface DeckSummary {
  exists: boolean;
  updatedAt: string | null;
  totalQuestions: number;
  rounds: { categoryName: string; icon: string; questionCount: number }[];
}

// Summarise a deck for the admin UI, resolving category names in German (the
// admin console's language).
async function summarise(deck: DemoDeck | null): Promise<DeckSummary> {
  if (!deck) {
    return { exists: false, updatedAt: null, totalQuestions: 0, rounds: [] };
  }
  const ids = deck.rounds.map((r) => r.categoryId);
  const cats = await query<{ id: number; name_de: string; icon: string }>(
    'SELECT id, name_de, icon FROM categories WHERE id = ANY($1)',
    [ids]
  );
  const byId = new Map(cats.map((c) => [c.id, c]));
  const rounds = deck.rounds.map((r) => ({
    categoryName: byId.get(r.categoryId)?.name_de ?? `#${r.categoryId}`,
    icon: byId.get(r.categoryId)?.icon ?? '',
    questionCount: r.questionIds.length,
  }));
  return {
    exists: true,
    updatedAt: await getDemoDeckUpdatedAt(),
    totalQuestions: deck.rounds.reduce((s, r) => s + r.questionIds.length, 0),
    rounds,
  };
}

export async function GET() {
  try {
    const deck = await getStoredDemoDeck();
    return NextResponse.json(await summarise(deck));
  } catch {
    return NextResponse.json(
      { error: 'demo_deck table not found — run scripts/migrate-add-demo-deck.ts.' },
      { status: 503 }
    );
  }
}

export async function POST() {
  try {
    const deck = await generateRandomDemoDeck();
    await saveDemoDeck(deck);
    return NextResponse.json(await summarise(deck));
  } catch (err) {
    const message =
      err instanceof Error && /demo_deck/.test(err.message)
        ? err.message
        : 'Could not regenerate demo deck. Is the demo_deck table present?';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
