// Apply the dispositions in data/review/change_plan.json to the questions
// table. Dry-run by default (prints the full before/after diff); pass
// --apply to execute everything in one transaction.
//
// Usage: DATABASE_URL=... node scripts/quality-review/apply-changes.mjs [--apply]
import pg from 'pg';
import { readFileSync } from 'fs';

const APPLY = process.argv.includes('--apply');
const plan = JSON.parse(readFileSync('data/review/change_plan.json', 'utf8'));

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const ids = plan.changes.map((c) => c.id);
const { rows } = await client.query(
  `SELECT q.id, q.text_de, q.answer_de, q.fun_fact_de, c.slug AS category
   FROM questions q JOIN categories c ON c.id = q.category_id
   WHERE q.id = ANY($1)`,
  [ids]
);
const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
const { rows: cats } = await client.query('SELECT id, slug FROM categories');
const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));

const missing = ids.filter((id) => !byId[id]);
if (missing.length) {
  console.error(`ABORT: ids not found in DB: ${missing.join(', ')}`);
  process.exit(1);
}
const badCat = plan.changes.filter((c) => c.category && !catBySlug[c.category]);
if (badCat.length) {
  console.error(`ABORT: unknown category slugs: ${badCat.map((c) => c.category).join(', ')}`);
  process.exit(1);
}

let deletes = 0;
let recats = 0;
let rewords = 0;

if (APPLY) await client.query('BEGIN');

for (const ch of plan.changes) {
  const cur = byId[ch.id];

  if (ch.action === 'delete') {
    deletes++;
    console.log(`\n─ DELETE #${ch.id} [${cur.category}]`);
    console.log(`  ${cur.text_de} → ${cur.answer_de}`);
    if (APPLY) await client.query('DELETE FROM questions WHERE id = $1', [ch.id]);
    continue;
  }

  if (ch.action === 'recategorize') recats++;
  else rewords++;

  console.log(`\n─ ${ch.action.toUpperCase()} #${ch.id} [${cur.category}]`);
  if (ch.category) console.log(`  Kategorie: ${cur.category} → ${ch.category}`);
  if (ch.text_de && ch.text_de !== cur.text_de) {
    console.log(`  F alt: ${cur.text_de}`);
    console.log(`  F neu: ${ch.text_de}`);
  }
  if (ch.answer_de && ch.answer_de !== cur.answer_de) {
    console.log(`  A alt: ${JSON.stringify(cur.answer_de)}`);
    console.log(`  A neu: ${JSON.stringify(ch.answer_de)}`);
  }
  if (ch.fun_fact_de) {
    console.log(`  FunFact alt: ${cur.fun_fact_de}`);
    console.log(`  FunFact neu: ${ch.fun_fact_de}`);
  }

  if (APPLY) {
    await client.query(
      `UPDATE questions SET
         category_id = COALESCE($2, category_id),
         text_de = COALESCE($3, text_de),
         answer_de = COALESCE($4, answer_de),
         fun_fact_de = COALESCE($5, fun_fact_de),
         updated_at = NOW()
       WHERE id = $1`,
      [ch.id, ch.category ? catBySlug[ch.category] : null, ch.text_de ?? null, ch.answer_de ?? null, ch.fun_fact_de ?? null]
    );
  }
}

if (APPLY) await client.query('COMMIT');
await client.end();

console.log(`\n${APPLY ? 'APPLIED' : 'DRY RUN'}: ${rewords} rewords, ${recats} recategorizations, ${deletes} deletes (${plan.changes.length} total)`);
if (!APPLY) console.log('Run with --apply to execute.');
