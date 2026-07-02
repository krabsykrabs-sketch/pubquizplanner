// Insert authored questions as status='pending' for manual admin review.
// Reads data/new-questions/<category-slug>.json (array of question objects)
// and data/new-questions/manual-fable.json (object keyed by category slug).
// Skips questions whose exact text already exists. Never approves anything.
//
// Usage: DATABASE_URL=... node scripts/insert-pending-questions.mjs [--dry-run]
import pg from 'pg';
import { readFileSync, existsSync } from 'fs';

const DRY = process.argv.includes('--dry-run');
const BATCH_ID = 'fable5-authoring-2026-07-02';
const SOURCE = 'claude-fable-5';
const SLUGS = ['sprache', 'kunst-kultur', 'logik-mathe', 'technik', 'popkultur', 'sport'];

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const { rows: cats } = await client.query('SELECT id, slug FROM categories');
const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

// Collect per category: agent files + manual file
const bySlug = {};
for (const slug of SLUGS) {
  bySlug[slug] = [];
  const file = `data/new-questions/${slug}.json`;
  if (existsSync(file)) bySlug[slug].push(...JSON.parse(readFileSync(file, 'utf8')));
}
const manualFile = 'data/new-questions/manual-fable.json';
if (existsSync(manualFile)) {
  const manual = JSON.parse(readFileSync(manualFile, 'utf8'));
  for (const [slug, qs] of Object.entries(manual)) {
    (bySlug[slug] ??= []).push(...qs);
  }
}

let inserted = 0;
let skippedDupes = 0;
let invalid = 0;

for (const [slug, questions] of Object.entries(bySlug)) {
  const categoryId = catBySlug[slug];
  if (!categoryId) {
    console.error(`unknown category: ${slug}`);
    continue;
  }
  for (const q of questions) {
    if (!q.text_de || !q.answer_de) {
      invalid++;
      continue;
    }
    const { rows: existing } = await client.query(
      'SELECT id FROM questions WHERE lower(trim(text_de)) = lower(trim($1)) LIMIT 1',
      [q.text_de]
    );
    if (existing.length > 0) {
      skippedDupes++;
      console.log(`  dupe skipped [${slug}]: ${q.text_de.slice(0, 60)}`);
      continue;
    }
    if (!DRY) {
      await client.query(
        `INSERT INTO questions
         (category_id, text_de, answer_de, fun_fact_de, difficulty, tags,
          source, status, generation_batch_id, verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, false)`,
        [
          categoryId,
          q.text_de.trim(),
          q.answer_de.trim(),
          q.fun_fact_de?.trim() || null,
          [1, 2, 3].includes(q.difficulty) ? q.difficulty : 2,
          q.tags?.length ? q.tags : null,
          SOURCE,
          BATCH_ID,
        ]
      );
    }
    inserted++;
  }
  console.log(`${slug}: ${questions.length} authored`);
}

console.log(
  `\n${DRY ? 'DRY RUN — would insert' : 'Inserted'} ${inserted} pending questions (batch ${BATCH_ID}); ${skippedDupes} duplicates skipped, ${invalid} invalid entries`
);
await client.end();
