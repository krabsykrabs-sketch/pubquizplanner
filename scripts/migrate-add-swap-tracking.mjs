// Per-question quality signal (2026-11-21): how often a question was shown in
// the generator and how often visitors swapped it out. Counted server-side
// from tracked (non-bot, non-admin) requests only, starting at 0 on this date.
// Additive and reversible:
//   ALTER TABLE questions DROP COLUMN shown_count, DROP COLUMN swap_count;
//
// Usage: node scripts/migrate-add-swap-tracking.mjs   (reads DATABASE_URL)
// NOTE: applied to production on 2026-11-21 via the db-query.sh SSH helper.
import pg from 'pg';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
await client.query(`
  ALTER TABLE questions
    ADD COLUMN IF NOT EXISTS shown_count integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS swap_count integer NOT NULL DEFAULT 0
`);
console.log('shown_count + swap_count ensured on questions.');
await client.end();
