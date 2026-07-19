# PubQuizPlanner — Work Plan for Fable 5

You have full access to the project files, the codebase, and the question database.
This document contains five independent tasks. Do them in the order listed.
Each task is self-contained — complete and report on one before moving to the next.

**Context you need:**
- Stack: Next.js 14, TypeScript, PostgreSQL (pg library, no ORM), Tailwind, next-intl v4
- German-first pub quiz generator. No runtime AI — pure database-driven.
- Output formats: HTML slide presentations, PDF answer sheets, quizmaster cheat sheets
- The database has ~3,000+ questions across 14 categories, built via a translation/QC pipeline
- Project docs: `CLAUDE_CODE_INSTRUCTIONS.md` and `docs/quiz-generator-concept-v4.md`

**General principles:**
- Do NOT fact-check questions. Factual accuracy has already been verified. Do not re-verify.
- Do NOT re-translate anything. All questions are already in German.
- Before any database migration, remember DATABASE_URL points to an internal Coolify hostname — migrations run inside the production container via SSH, not locally.
- Report findings clearly. Where you're making changes, show a summary of what changed and why.

---

## TASK 1 — Homepage structure audit

Review the landing page (both `/de` and `/en` variants) as a whole. Assess whether the
structure makes sense and serves the product well.

Evaluate:
- Information hierarchy — does the page lead with the right things? Is the value proposition clear within the first screen?
- The category chip section — it should dynamically show all categories with ≥30 approved questions. Verify it does, and that the counts are accurate against the live database.
- The dynamic question count and sample questions — verify they're pulling real data and rendering correctly on both locales.
- SEO structure — heading hierarchy (single H1, logical H2s), meta tags, internal linking to the category pages. The category pages (`/de/fragen/{slug}`) are the main organic entry points and rank on page 1 for several German queries; the homepage should link to them cleanly.
- Any German strings leaking into the English page (this was a known issue — verify it's resolved).
- Mobile responsiveness of the layout.

Deliver: a written assessment of what works and what doesn't, with specific, prioritized
recommendations. Where changes are low-risk and clearly correct, make them and note what you changed.
Where a change is a judgment call, describe it and let me decide.

---

## TASK 2 — Add a quizmaster cheat sheet feature

First, check whether this already exists. The original concept (`docs/quiz-generator-concept-v4.md`)
mentions quizmaster cheat sheets as an output format. Determine whether it's actually implemented
or only planned. Report which.

If it does not exist (or exists but is broken/incomplete), build it:

A **cheat sheet for the host** — a single document containing all questions and their answers for
a generated quiz, laid out for the host to read from while running the event. Requirements:
- All questions in the quiz, in order, grouped by round
- Each question shows: the question text, the correct answer, and the fun fact (where present)
- Include the category and difficulty of each question
- Clean, printable layout — the host will likely print it or read from a screen. Dense but readable. Not slides.
- Match the existing generation flow — it should be produced alongside the HTML slides and PDF answer sheet from the same quiz generation action, using the same data source.

Follow the existing patterns in the codebase for how the other output formats (slides, answer sheets)
are generated. Reuse the existing quiz data structure — do not build a parallel data path.

Deliver: the working feature, plus a short note on how it's triggered and where the code lives.

---

## TASK 3 — Investigate and fix duplicate questions

During testing, the same questions appeared duplicated. The cause is unknown — it could be:
- A generation/selection bug (the same question ID being pulled twice into one quiz), OR
- A database-level issue (multiple distinct rows with near-identical content, likely introduced by the import pipeline from overlapping sources — Jeopardy, Reddit, QuizPro, OpenTDB all fed in)

Diagnose which it is. Check both layers:

1. **Generation layer:** Review the quiz generation / question selection logic. Can the same
   question be selected more than once for a single quiz? If so, fix the selection to guarantee
   uniqueness within a generated quiz.

2. **Database layer:** Scan the questions table for duplicates and near-duplicates. Exact duplicates
   (identical `text_de`) are straightforward. Near-duplicates (same question, slightly different
   wording — e.g. from two different source datasets) are harder. Use fuzzy matching on `text_de`
   and `answer_de` to surface candidates. Do NOT auto-delete near-duplicates — produce a list of
   candidate duplicate groups for me to review. Exact duplicates you may de-duplicate directly, but
   report how many and which you removed, keeping the row with the best metadata (fun fact present,
   source populated, etc.).

Deliver: a diagnosis of the root cause(s), the fix for the generation layer if applicable, a count
and summary of exact duplicates removed, and a review list of near-duplicate candidates.

---

## TASK 4 — Remove multiple choice entirely

This product is open-answer only. There should be no multiple choice anywhere. I don't believe MC is
implemented, but I'm not certain — check thoroughly and remove every trace.

Check and remove across three layers:

1. **Rendering / generation:** Any code path in the slide generation, quiz generation, or any output
   format that renders or supports multiple choice options. Remove it.

2. **Admin / UI:** Any fields, inputs, toggles, or display related to multiple choice or wrong answers
   in the admin interface and the question editor. (There may be a `wrong_answers` field or similar
   left over from the OpenTDB import days — the ReviewCard showed "Falsche Antworten" fields at one
   point.) Remove the MC-related UI.

3. **Database:** Check whether any questions actually contain multiple-choice data (e.g. a populated
   `wrong_answers` array, or distractor fields). Report how many, if any. If the schema has MC-related
   columns that are now unused, note them — but do NOT drop columns without flagging it to me first,
   since that's a destructive schema change.

Deliver: confirmation of what MC-related code/UI existed and was removed, a count of any DB rows with
MC data, and a list of any MC-related schema columns you recommend dropping (for my approval).

---

## TASK 5 — Full question quality review (the big one)

Go through every question in the database and assess quality. This is the most important task.

**What this is:** a judgment of whether each question is a GOOD pub quiz question. Taste and quality only.

**What this is NOT:**
- NOT fact-checking. Do not verify factual accuracy. It's already been done. Assume facts are correct.
- NOT translation review. Everything is already in German.

**What makes a question flag-worthy (i.e. NOT good):**
- Boring or trivial ("What colour is grass?") — no challenge, no interest
- Confusing or ambiguous phrasing — unclear what's being asked, or multiple valid answers
- Awkward or unnatural German phrasing that survived the pipeline
- Relies on context that isn't there (e.g. a question that only made sense as multiple choice, or references "the above" / options that don't exist)
- Answer doesn't actually match the question, or answer is oddly formatted (e.g. a full sentence where a word is expected, leftover artifacts)
- Too obscure to be enjoyable — not "hard" in a fun way, just unknowable
- Culturally mismatched — assumes US/UK-specific knowledge that a German pub quiz audience wouldn't have (some of these slipped through from English-language sources)
- Duplicative in spirit of a much more common question

**What does NOT need flagging:**
- Genuinely hard questions (hard ≠ bad — a good quiz has hard questions)
- Questions with no fun fact (that's fine, not every question needs one)
- Niche-but-fair questions

**How to do this at scale:**
The full question set will not fit in your context at once. Build a repeatable, batched review process:
- Pull questions from the database in batches (by category is a sensible unit)
- For each question, decide: KEEP or FLAG. If FLAG, give a one-line reason and, where obvious, a suggested fix (reword / re-tag / delete).
- Write results to a structured output file (e.g. `data/review/flagged_questions.json`) with: question ID, category, text_de, answer_de, flag reason, suggested action.
- Also produce a human-readable summary: how many reviewed, how many flagged, breakdown of flag reasons by category.

**Important:** Do NOT delete or modify any questions in this task. Produce the review list only.
I will make the final call on each flagged question. Most questions are good — I expect the flag rate
to be a minority. I want your judgment, not automatic changes.

Make the review process reusable — I'll want to run it again on future imports. A script + rubric I
can re-invoke is more valuable than a one-off pass. Note where it lives and how to run it.

Deliver: the reusable review script, the flagged-questions output file, and the summary breakdown.

---

## TASK 6 — Analytics dashboard

Build me a private dashboard to understand how the site is actually used. This is for my eyes only —
it should live behind the existing admin auth, not be public.

I want visibility into the **funnel** and the **traffic**, specifically:
- How many people visit the site, over time
- Which pages they visit (the category pages are the main entry points, so I want to see which ones pull traffic)
- How many people actually generate a quiz presentation (the core conversion action)
- How many actually download it (slides / PDF / cheat sheet)
- The flow between pages — where traffic enters, where it goes next, where people drop off

I'm deliberately not specifying the layout, the metrics breakdown, or the implementation. You'll design
a better plan than I would by prescribing it. Use your judgment on:
- What events to instrument and how (the key funnel steps are: page view → quiz generation → download)
- How to store the event data (bear in mind we already run PostgreSQL — a lightweight events table is probably simpler than pulling in a third-party analytics service, but weigh it yourself; privacy and self-hosting are values here, so avoid anything that ships user data to external ad-tech)
- How to present it — charts, funnel visualization, page-flow view, whatever communicates the picture clearly
- Time ranges and filtering that would actually be useful

Constraints and notes:
- Respect privacy. This is a self-hosted, ad-free product. Don't introduce tracking that conflicts with that — aggregate, anonymous event counts are the goal, not per-user surveillance. If GDPR-relevant considerations come up (this is an EU-hosted, German-facing site), flag them.
- Instrumentation should be lightweight and not slow down the pages or the generation flow.
- Reuse the existing stack (PostgreSQL, Next.js) rather than adding heavy new dependencies unless you make a clear case for one.

Propose your plan first — a short design of what you'll instrument, how you'll store it, and what the
dashboard will show — then build it once the approach is sound. If any part is a judgment call I'd care
about (e.g. a third-party dependency, a schema addition, anything touching user data), surface it before proceeding.

Deliver: the plan, then the working dashboard behind admin auth, plus a note on what's instrumented and
where the code lives.

---

## Reporting

For each task, give me a clear summary of what you found and what you did. Keep code changes
well-scoped — don't refactor beyond what each task requires. Where you're unsure or a change is
destructive (schema drops, near-duplicate deletion, bulk question changes), stop and ask rather
than proceeding.

Start with Task 1.
