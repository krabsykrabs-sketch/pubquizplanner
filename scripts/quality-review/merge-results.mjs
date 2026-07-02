// Stage 3 of the quality review: merge per-category result files into the
// final flagged-questions list plus a human-readable summary.
//
// Usage: node scripts/quality-review/merge-results.mjs
// Input:  data/review/results/<category-slug>.json
// Output: data/review/flagged_questions.json, data/review/summary.md
import { readFileSync, writeFileSync, readdirSync } from 'fs';

const RESULTS_DIR = 'data/review/results';

const files = readdirSync(RESULTS_DIR).filter((f) => f.endsWith('.json'));
if (files.length === 0) {
  console.error('No result files found — run the review stage first (see RUBRIC.md).');
  process.exit(1);
}

let totalReviewed = 0;
const allFlagged = [];
const perCategory = [];

for (const file of files.sort()) {
  const r = JSON.parse(readFileSync(`${RESULTS_DIR}/${file}`, 'utf8'));
  totalReviewed += r.reviewed;
  perCategory.push({ category: r.category, reviewed: r.reviewed, flagged: r.flagged.length });
  for (const f of r.flagged) allFlagged.push({ category: r.category, ...f });
}

allFlagged.sort((a, b) => a.category.localeCompare(b.category) || a.id - b.id);

writeFileSync(
  'data/review/flagged_questions.json',
  JSON.stringify(
    { reviewed: totalReviewed, flaggedCount: allFlagged.length, flagged: allFlagged },
    null,
    2
  )
);

const reasonCounts = {};
const actionCounts = {};
for (const f of allFlagged) {
  reasonCounts[f.reason] = (reasonCounts[f.reason] || 0) + 1;
  actionCounts[f.action] = (actionCounts[f.action] || 0) + 1;
}

const lines = [];
lines.push('# Question Quality Review — Summary');
lines.push('');
lines.push(`Reviewed: **${totalReviewed}** questions · Flagged: **${allFlagged.length}** (${((allFlagged.length / totalReviewed) * 100).toFixed(1)}%)`);
lines.push('');
lines.push('## By category');
lines.push('');
lines.push('| Category | Reviewed | Flagged | Rate |');
lines.push('|----------|---------:|--------:|-----:|');
for (const c of perCategory.sort((a, b) => b.flagged - a.flagged)) {
  lines.push(`| ${c.category} | ${c.reviewed} | ${c.flagged} | ${((c.flagged / c.reviewed) * 100).toFixed(1)}% |`);
}
lines.push('');
lines.push('## By flag reason');
lines.push('');
lines.push('| Reason | Count |');
lines.push('|--------|------:|');
for (const [reason, count] of Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])) {
  lines.push(`| ${reason} | ${count} |`);
}
lines.push('');
lines.push('## By suggested action');
lines.push('');
lines.push('| Action | Count |');
lines.push('|--------|------:|');
for (const [action, count] of Object.entries(actionCounts).sort((a, b) => b[1] - a[1])) {
  lines.push(`| ${action} | ${count} |`);
}
lines.push('');
lines.push('## Flagged questions');
lines.push('');
for (const f of allFlagged) {
  lines.push(`- **#${f.id}** [${f.category}] ${f.text_de} → *${f.answer_de}*`);
  lines.push(`  - \`${f.reason}\` · ${f.note} · Aktion: **${f.action}**${f.fix ? ` · Vorschlag: ${f.fix}` : ''}`);
}
lines.push('');

writeFileSync('data/review/summary.md', lines.join('\n'));
console.log(`reviewed ${totalReviewed}, flagged ${allFlagged.length}`);
console.log('wrote data/review/flagged_questions.json and data/review/summary.md');
