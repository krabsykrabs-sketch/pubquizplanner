// Adds the per-question locale allow-list.
//
// locales: NULL = the question may appear in / be translated to ALL locales
// (default). A non-null array restricts it, e.g. ['de'] = German-only (never
// translated — for German wordplay/etymology/idioms). translate-questions.mjs
// honors this and demotes any now-excluded translations to 'skipped'.
// Additive and reversible (DROP COLUMN locales).
//
// Usage: DATABASE_URL=... npx tsx scripts/migrate-add-locales.ts
//
// NOTE: already applied to production on 2026-07-03 via the db-query.sh SSH helper.
import pg from 'pg';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

await client.query(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS locales text[]`);

console.log('locales column ensured on questions.');
await client.end();
