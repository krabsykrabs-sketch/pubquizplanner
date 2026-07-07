// Adds storage for the homepage's saved demo deck.
//
// A single-row table (id is pinned to 1) holding one deck as JSONB. The deck
// stores question IDs + round structure, not baked text, so the same saved
// deck renders in every locale at serve time. The admin "Demo" page regenerates
// and overwrites this row.
//
// Usage: DATABASE_URL=... npx tsx scripts/migrate-add-demo-deck.ts
//
// Additive and reversible (DROP TABLE demo_deck).
import pg from 'pg';

async function main() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS demo_deck (
      id         SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      deck       JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  console.log('demo_deck table ensured.');
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
