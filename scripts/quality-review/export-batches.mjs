// Stage 1 of the quality review: export approved questions from the DB into
// one JSON batch file per category, ready for review against RUBRIC.md.
//
// Usage: DATABASE_URL=... node scripts/quality-review/export-batches.mjs
// Output: data/review/batches/<category-slug>.json
import pg from 'pg';
import { writeFileSync, mkdirSync } from 'fs';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const { rows } = await client.query(
  `SELECT q.id, q.text_de, q.answer_de, q.fun_fact_de, q.difficulty,
          q.tags, q.source, c.slug AS category
   FROM questions q JOIN categories c ON c.id = q.category_id
   WHERE q.status = 'approved'
   ORDER BY c.slug, q.id`
);
await client.end();

mkdirSync('data/review/batches', { recursive: true });
mkdirSync('data/review/results', { recursive: true });

const byCategory = {};
for (const r of rows) (byCategory[r.category] ??= []).push(r);

for (const [slug, questions] of Object.entries(byCategory)) {
  writeFileSync(
    `data/review/batches/${slug}.json`,
    JSON.stringify({ category: slug, count: questions.length, questions }, null, 2)
  );
  console.log(`${slug}: ${questions.length}`);
}
console.log(`total: ${rows.length} approved questions in ${Object.keys(byCategory).length} batches`);
