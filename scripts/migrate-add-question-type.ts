// Adds the estimation-question support column.
//
// question_type: NULL / 'standard' = normal open-answer question;
// 'estimation' = Schätzfrage (numeric answer stored in answer_de, scored
// closest-wins by the host — no auto-grading). Additive and reversible
// (DROP COLUMN question_type).
//
// Usage: DATABASE_URL=... npx tsx scripts/migrate-add-question-type.ts
//
// NOTE: already applied to production on 2026-07-03 via the db-query.sh SSH
// helper. This file documents the change and makes it reproducible on a fresh DB.
import pg from 'pg';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

await client.query(
  `ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_type varchar(20)`
);

console.log('question_type column ensured on questions.');
await client.end();
