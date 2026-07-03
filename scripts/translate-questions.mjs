// Translate approved questions into a target locale using the Anthropic API.
// German is the source of truth; this script finds approved questions with a
// missing or stale translation (source_hash mismatch) and upserts
// question_translations rows. Questions that don't work in the target
// language (wordplay, German-insider content) are stored as status='skipped'.
//
// Usage: DATABASE_URL=... ANTHROPIC_API_KEY=... node scripts/translate-questions.mjs <locale>
import pg from 'pg';
import { createHash } from 'crypto';
import Anthropic from '@anthropic-ai/sdk';

const LANGUAGES = {
  nl: 'Niederländisch (Nederlands)',
  es: 'Spanisch (Español)',
  pl: 'Polnisch (Polski)',
  sv: 'Schwedisch (Svenska)',
  it: 'Italienisch (Italiano)',
  fr: 'Französisch (Français)',
  en: 'Englisch (English)',
};

const locale = process.argv[2];
if (!LANGUAGES[locale]) {
  console.error(`Usage: node scripts/translate-questions.mjs <${Object.keys(LANGUAGES).join('|')}>`);
  process.exit(1);
}
const language = LANGUAGES[locale];
const BATCH_SIZE = 15;

const sourceHash = (q) =>
  createHash('md5')
    .update(`${q.text_de}${q.answer_de}${q.fun_fact_de ?? ''}`)
    .digest('hex');

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const anthropic = new Anthropic();

const { rows: pending } = await client.query(
  `SELECT q.id, q.text_de, q.answer_de, q.fun_fact_de, q.locales,
          t.source_hash AS existing_hash, t.status AS existing_status
   FROM questions q
   LEFT JOIN question_translations t ON t.question_id = q.id AND t.locale = $1
   WHERE q.status = 'approved'
   ORDER BY q.id`,
  [locale]
);

// A question is available in this locale unless it has a non-null `locales`
// allow-list that excludes it (e.g. ['de'] = German-only).
const isAllowed = (q) => !q.locales || q.locales.includes(locale);

// Questions excluded from this locale but still carrying a live (machine/
// reviewed) translation: demote them to 'skipped' so they stop being served.
const toSkip = pending.filter(
  (q) => !isAllowed(q) && (q.existing_status === 'machine' || q.existing_status === 'reviewed')
);
for (const q of toSkip) {
  await client.query(
    `UPDATE question_translations
       SET text = '', answer = '', fun_fact = $3, status = 'skipped', source_hash = $4, updated_at = NOW()
     WHERE question_id = $1 AND locale = $2`,
    [q.id, locale, 'excluded by locales allow-list', sourceHash(q)]
  );
}
if (toSkip.length > 0) {
  console.log(`${locale}: demoted ${toSkip.length} now-excluded translation(s) to skipped`);
}

const work = pending.filter((q) => isAllowed(q) && q.existing_hash !== sourceHash(q));

console.log(`${locale}: ${pending.length} approved questions, ${work.length} need translation (missing or stale)`);
if (work.length === 0) {
  await client.end();
  process.exit(0);
}

const SYSTEM = `Du bist ein professioneller Übersetzer für Pub-Quiz-Fragen vom Deutschen ins ${language}.

Regeln:
- Übersetze Frage, Antwort und Fun Fact so, dass sie in der Zielsprache natürlich klingen und laut vorgelesen gut funktionieren — keine wörtliche Übersetzung.
- Antworten kurz halten (1-5 Wörter), Eigennamen in der in der Zielsprache üblichen Form (z. B. lokalisierte Buch- und Filmtitel).
- Einheiten, Währungen und Redewendungen sinnvoll lokalisieren.
- SKIP: Wenn eine Frage in der Zielsprache nicht funktioniert (Wortspiel, deutsche Sprache selbst ist Thema, nur mit deutschem Insiderwissen lösbar), übersetze sie NICHT, sondern markiere sie als skip mit kurzer Begründung.
- Fragen über Deutschland/Österreich/Schweiz sind OK, solange sie für ein internationales Publikum lösbar und interessant sind.

Antworte ausschließlich mit einem JSON-Array. Pro Frage entweder:
{"id": 123, "text": "...", "answer": "...", "fun_fact": "..." | null}
oder:
{"id": 123, "skip": true, "reason": "..."}`;

let translated = 0;
let skipped = 0;
let failed = 0;

for (let i = 0; i < work.length; i += BATCH_SIZE) {
  const batch = work.slice(i, i + BATCH_SIZE);
  const list = batch
    .map(
      (q) =>
        `ID ${q.id}\nFrage: ${q.text_de}\nAntwort: ${q.answer_de}\nFun Fact: ${q.fun_fact_de ?? '—'}`
    )
    .join('\n\n');

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 8192,
      system: SYSTEM,
      messages: [{ role: 'user', content: `Übersetze diese Quizfragen:\n\n${list}` }],
    });
    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');
    const match = text.match(/\[[\s\S]*\]/);
    const results = JSON.parse(match ? match[0] : text);

    for (const r of results) {
      const source = batch.find((q) => q.id === r.id);
      if (!source) continue;
      if (r.skip) {
        await client.query(
          `INSERT INTO question_translations (question_id, locale, text, answer, fun_fact, status, source_hash)
           VALUES ($1, $2, '', '', $3, 'skipped', $4)
           ON CONFLICT (question_id, locale) DO UPDATE
             SET text = '', answer = '', fun_fact = $3, status = 'skipped', source_hash = $4, updated_at = NOW()`,
          [r.id, locale, r.reason ?? null, sourceHash(source)]
        );
        skipped++;
      } else if (r.text && r.answer) {
        await client.query(
          `INSERT INTO question_translations (question_id, locale, text, answer, fun_fact, status, source_hash)
           VALUES ($1, $2, $3, $4, $5, 'machine', $6)
           ON CONFLICT (question_id, locale) DO UPDATE
             SET text = $3, answer = $4, fun_fact = $5, status = 'machine', source_hash = $6, updated_at = NOW()`,
          [r.id, locale, r.text, r.answer, r.fun_fact ?? null, sourceHash(source)]
        );
        translated++;
      }
    }
    console.log(`batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(work.length / BATCH_SIZE)}: ok (${translated} translated, ${skipped} skipped so far)`);
  } catch (err) {
    failed += batch.length;
    console.error(`batch ${Math.floor(i / BATCH_SIZE) + 1} FAILED: ${err.message}`);
  }
}

const { rows: coverage } = await client.query(
  `SELECT status, count(*) FROM question_translations WHERE locale = $1 GROUP BY status`,
  [locale]
);
console.log(`\nDone: ${translated} translated, ${skipped} skipped, ${failed} failed this run`);
console.log(`Coverage for ${locale}:`, coverage.map((c) => `${c.status}=${c.count}`).join(', '));
await client.end();
