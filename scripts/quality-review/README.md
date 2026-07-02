# Question Quality Review — reusable process

Batched taste/quality review of the question database. Judges whether each
question is a good pub quiz question (KEEP/FLAG). No fact-checking, no
translation review, and the review never modifies the database — it only
produces a review list for a human to act on.

## How to run

1. **Export** batches (one JSON per category) from the production DB:

   ```bash
   DATABASE_URL=postgres://... node scripts/quality-review/export-batches.mjs
   ```

2. **Review** each batch in `data/review/batches/` against
   [RUBRIC.md](RUBRIC.md). This is the LLM/human-judgment stage — e.g. in
   Claude Code:

   > Read scripts/quality-review/RUBRIC.md, then review every question in
   > data/review/batches/<slug>.json against it. Write the result to
   > data/review/results/<slug>.json in the rubric's output format.

   Run one such prompt per batch (parallel subagents work well). To re-review
   only new imports, export after the import and review just the categories
   that changed.

3. **Merge** results into the final deliverables:

   ```bash
   node scripts/quality-review/merge-results.mjs
   ```

   Output: `data/review/flagged_questions.json` (structured, one entry per
   flagged question) and `data/review/summary.md` (human-readable breakdown).

The final call on every flagged question is made by a human. Suggested
actions are `reword`, `recategorize`, or `delete`.
