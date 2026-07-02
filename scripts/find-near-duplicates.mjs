// Scan the questions table for near-duplicate candidates using trigram
// similarity on normalized text_de + answer_de. Read-only: produces a review
// list, deletes nothing.
//
// Usage: DATABASE_URL=... node scripts/find-near-duplicates.mjs
// Output: data/review/duplicate_candidates.json
import pg from 'pg';
import { writeFileSync, mkdirSync } from 'fs';

const TEXT_SIM_THRESHOLD = 0.55;
const ANSWER_MATCH_TEXT_SIM = 0.35;

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

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const { rows } = await client.query(
  `SELECT q.id, q.text_de, q.answer_de, q.status, q.difficulty, q.source,
          q.fun_fact_de IS NOT NULL AS has_fun_fact, c.slug AS category
   FROM questions q JOIN categories c ON c.id = q.category_id
   ORDER BY q.id`
);
await client.end();

const items = rows.map((r) => ({
  ...r,
  normText: normalize(r.text_de),
  normAnswer: normalize(r.answer_de),
}));
items.forEach((it) => (it.tri = trigrams(it.normText)));

const pairs = [];
for (let i = 0; i < items.length; i++) {
  for (let j = i + 1; j < items.length; j++) {
    const a = items[i];
    const b = items[j];
    const sameAnswer = a.normAnswer === b.normAnswer && a.normAnswer.length > 1;
    const textSim = similarity(a.tri, b.tri);
    const isCandidate =
      textSim >= TEXT_SIM_THRESHOLD ||
      (sameAnswer && textSim >= ANSWER_MATCH_TEXT_SIM);
    if (isCandidate) {
      pairs.push({ aId: a.id, bId: b.id, textSim: +textSim.toFixed(3), sameAnswer });
    }
  }
}

// Union-find to merge pairs into groups
const parent = {};
const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
items.forEach((it) => (parent[it.id] = it.id));
pairs.forEach((p) => {
  parent[find(p.aId)] = find(p.bId);
});

const groupsById = {};
pairs.forEach((p) => {
  const root = find(p.aId);
  groupsById[root] ??= new Set();
  groupsById[root].add(p.aId);
  groupsById[root].add(p.bId);
});

const byId = Object.fromEntries(items.map((it) => [it.id, it]));
const groups = Object.values(groupsById).map((idSet, i) => {
  const members = [...idSet].sort((a, b) => a - b).map((id) => byId[id]);
  const groupPairs = pairs.filter((p) => idSet.has(p.aId) && idSet.has(p.bId));
  const maxSim = Math.max(...groupPairs.map((p) => p.textSim));
  return {
    group: i + 1,
    maxTextSimilarity: maxSim,
    sameAnswer: groupPairs.some((p) => p.sameAnswer),
    questions: members.map((m) => ({
      id: m.id,
      category: m.category,
      status: m.status,
      difficulty: m.difficulty,
      source: m.source,
      has_fun_fact: m.has_fun_fact,
      text_de: m.text_de,
      answer_de: m.answer_de,
    })),
  };
});

groups.sort((a, b) => b.maxTextSimilarity - a.maxTextSimilarity);
groups.forEach((g, i) => (g.group = i + 1));

mkdirSync('data/review', { recursive: true });
writeFileSync(
  'data/review/duplicate_candidates.json',
  JSON.stringify({ scannedQuestions: items.length, groups }, null, 2)
);

console.log(`scanned ${items.length} questions`);
console.log(`${groups.length} candidate groups (${pairs.length} pairs)`);
for (const g of groups) {
  console.log(
    `\n— group ${g.group} (sim ${g.maxTextSimilarity}${g.sameAnswer ? ', same answer' : ''})`
  );
  for (const q of g.questions) {
    console.log(`  #${q.id} [${q.category}/${q.status}] ${q.text_de} → ${q.answer_de}`);
  }
}
