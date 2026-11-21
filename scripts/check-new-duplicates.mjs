// Check freshly authored questions against ALL existing ones (any category,
// any status — rejected topics count too) before they are inserted as pending.
// Same trigram similarity as find-near-duplicates.mjs, but offline: compares
// a JSON export of the questions table with a new-questions file.
//
// Usage:
//   node scripts/check-new-duplicates.mjs <export.json> <new-questions.json> [more.json ...]
// export.json: array of {id, category, status, text_de, answer_de}
// new-questions.json: array of {text_de, answer_de, ...} (AUTHORING.md format)
// Also flags near-duplicates *within* the new files. Exit code 1 if any hit.
import { readFileSync } from 'fs';

const TEXT_SIM = 0.5; // a bit stricter than the DB scan (0.55): new work should be clearly distinct
const ANSWER_MATCH_TEXT_SIM = 0.3; // same answer + loosely similar question = likely same idea

const normalize = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/['"„“”‚‘’()\[\].,!?:;–—-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const trigrams = (s) => {
  const padded = `  ${s} `;
  const set = new Set();
  for (let i = 0; i < padded.length - 2; i++) set.add(padded.slice(i, i + 3));
  return set;
};
const similarity = (a, b) => {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
};
const prep = (q, label) => ({
  ...q,
  label,
  tri: trigrams(normalize(q.text_de)),
  ans: normalize(q.answer_de),
});

const [exportFile, ...newFiles] = process.argv.slice(2);
if (!exportFile || newFiles.length === 0) {
  console.error('usage: node scripts/check-new-duplicates.mjs <export.json> <new.json> [...]');
  process.exit(2);
}
const existing = JSON.parse(readFileSync(exportFile, 'utf8')).map((q) =>
  prep(q, `#${q.id} [${q.category}/${q.status}]`)
);
const fresh = newFiles.flatMap((f) =>
  JSON.parse(readFileSync(f, 'utf8')).map((q, i) => prep(q, `${f.split('/').pop()}#${i + 1}`))
);

let hits = 0;
const check = (a, b) => {
  const sim = similarity(a.tri, b.tri);
  const sameAnswer = a.ans && a.ans === b.ans;
  if (sim >= TEXT_SIM || (sameAnswer && sim >= ANSWER_MATCH_TEXT_SIM)) {
    hits++;
    console.log(`\n${a.label}  ~  ${b.label}   sim=${sim.toFixed(2)}${sameAnswer ? ' SAME ANSWER' : ''}`);
    console.log(`  new: ${a.text_de} → ${a.answer_de}`);
    console.log(`  old: ${b.text_de} → ${b.answer_de}`);
  }
};
for (const q of fresh) for (const e of existing) check(q, e);
for (let i = 0; i < fresh.length; i++) for (let j = i + 1; j < fresh.length; j++) check(fresh[i], fresh[j]);
console.log(`\n${fresh.length} new questions checked against ${existing.length} existing: ${hits} possible duplicate(s).`);
process.exit(hits ? 1 : 0);
