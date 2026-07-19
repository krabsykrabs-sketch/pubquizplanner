## PubQuizPlanner — Six-Task Work Plan

**MODEL ROUTING (read first):**
Run this entire plan on **Opus 4.8**. Every task here is code, scaffolding, analysis, or
prompt-writing — all appropriate for Opus. Do NOT use a more expensive model for these.

The ONLY work reserved for a stronger model (Fable) is writing NET-NEW question content — i.e.
actually authoring estimation questions or new-category questions. That is a SEPARATE session,
done later, once sources/decisions are finalized. Nothing in this plan writes question content,
so nothing here needs Fable. Each task below restates its routing on its first line.

---

Six tasks. Some are build tasks, some are scaffolding + proposal tasks because the inputs aren't
finalized yet. Where a task depends on a decision I haven't made, prepare the structure and propose
a plan for my approval — do NOT guess and build content on an undecided foundation. Do these in
order; report after each.

Context: Next.js 14, TypeScript, PostgreSQL (pg, no ORM), Tailwind, next-intl v4. German-first pub
quiz generator, no runtime AI, pure DB-driven. Currently live in DE and NL (subfolder locales: /de,
/nl). Output formats: HTML slides, PDF answer sheets, quizmaster cheat sheet. ~3000+ questions across
14 categories.

---

TASK 1 — Additional language scaffolding
**Model: Opus 4.8. Pure refactoring against an existing pattern — no stronger model needed.**

We want to add more locales beyond DE and NL, using the existing subfolder model (/de, /nl, /pl, /se,
etc.) — NOT separate domains. Do NOT split domain authority.

First, audit how DE and NL are currently implemented (routing, next-intl config, locale-aware DB
queries, hreflang tags, sitemap generation). Then:
- Make adding a new locale a clean, documented, repeatable process. Abstract any per-locale hardcoding
  so a new language is a config change plus content, not a code rewrite.
- Set up hreflang correctly across all locales (this matters for SEO — each localized page must declare
  its alternates).
- Ensure the sitemap generates per-locale entries automatically.
- Add a `locale` (or `locales[]`) dimension to the questions schema if not already present, so questions
  can be scoped per language. Flag before any migration — DATABASE_URL is an internal Coolify hostname,
  migrations run in the prod container via SSH.

Do NOT translate any question content in this task. This is routing/schema/scaffolding only.
Deliver: an audit of the current locale setup, the refactor making new locales easy, and a short
"how to add a locale" doc.

---

TASK 2 — Additional categories (scaffolding + sourcing proposal)
**Model: Opus 4.8. Analysis + config + a written proposal. Do NOT generate any questions.**

We want more question categories, but the SOURCE is not yet decided. Do NOT invent or generate questions.

Instead:
- Review how the existing 14 categories are structured (DB schema, category tagging, how category pages
  and SEO pages are generated from them).
- Make adding a new category a clean process — confirm nothing is hardcoded to the current 14 (the landing
  page and SEO pages should already pull categories dynamically for those with ≥30 questions; verify this).
- Propose a sourcing plan: given our existing pipeline (prefilter → translate → QC → import → manual
  review), lay out options for where new-category questions could come from and the tradeoffs. Present it
  for my decision. Do not proceed to sourcing.

Deliver: confirmation the system is category-agnostic (or a fix if it isn't), plus a written sourcing
proposal for my approval. (When I approve a source, the actual question authoring will be a separate
Fable session — not part of your work.)

---

TASK 3 — Estimation questions (new question type)
**Model: Opus 4.8. This task is schema + generator/slide/admin PLUMBING only — all routine code.
Writing the actual estimation questions is NOT part of this task; that's a later Fable session.**

Add a new question type: estimation questions ("Schätzfragen"). These ask for a numeric answer where the
closest guess wins, rather than an exact match — e.g. "Wie viele Knochen hat der menschliche Körper?" →
206. Competitors use these heavily and they're great for pub quizzes; we have none.

Requirements:
- Determine the schema change needed. An estimation question has a numeric answer and no exact-match
  grading — the host judges closest. Consider whether this is a new `question_type` field, a boolean flag,
  or a separate handling path. Propose your approach before migrating.
- The generator, slides, answer sheet, and cheat sheet must all handle this type correctly (slide shows the
  question; answer sheet/cheat sheet shows the number; scoring note explains closest-wins).
- The admin must support creating/editing estimation questions.
- This is a NET-NEW question type — it must coexist with standard open-answer questions. Do NOT touch or
  convert existing questions.

Note: we are deliberately open-answer only and have removed multiple choice. Estimation questions are
open-answer (numeric), consistent with that.
Deliver: the schema proposal (for approval), then the implementation across all output formats + admin.
Do NOT author estimation questions — leave the type ready and empty for a later content pass.

---

TASK 4 — Prettier slides (design via ChatGPT handoff)
**Model: Opus 4.8. The design comes from ChatGPT, not from you. You write the ChatGPT prompts and do
the theming refactor — both routine.**

Our HTML slide output works but looks plain. We want a significantly more polished visual design. The
design itself will be generated externally via ChatGPT, then implemented here.

Your job:
- Review the current slide generation code and structure (what renders a slide, what's themeable, the
  constraints — it's HTML/CSS, must work offline once generated, must handle variable content lengths).
- Write 3-5 detailed, ready-to-paste ChatGPT prompts that ask ChatGPT to produce slide design concepts
  (layouts, color schemes, typography, visual treatment for question slides, answer slides, round-title
  slides, and a title slide). The prompts must specify our real constraints: German pub quiz context, must
  be reproducible in HTML/CSS, readable projected on a screen in a pub, works with our category set, no
  reliance on licensed imagery. Give ChatGPT enough context to produce something we can actually implement,
  not generic mockups.
- Prepare the slide code so that once I bring design concepts back, integrating a new visual theme is
  straightforward — ideally a theming layer (CSS variables / design tokens) so the design can be applied
  without rewriting the generation logic.

Deliver: the ChatGPT prompts (as a file I can copy from), plus the theming refactor that makes applying
the returned design easy. This task completes in TWO stages — you scaffold now, I return designs, then you
implement.

---

TASK 5 — Prettier landing page (design via ChatGPT handoff)
**Model: Opus 4.8. Same handoff model as Task 4 — routine.**

Same handoff model as Task 4, for the landing page (/de and /nl, and future locales).

- Review the current landing page structure and what it needs to contain (value prop, category chips pulled
  dynamically, dynamic question count, sample questions, CTA to the generator, links to category/SEO pages).
- Write 2-3 detailed ChatGPT prompts to generate landing page design concepts — hero section, category
  display, overall visual identity. Specify constraints: must be implementable in Next.js + Tailwind, must
  keep the existing dynamic data elements, must work across locales, mobile-responsive, clean and modern
  (reference point: it should feel more polished than typical cluttered quiz sites — that's our
  differentiation).
- Prepare the landing page components so the returned design integrates cleanly.

Deliver: the ChatGPT prompts as a copyable file, plus any component prep. Two-stage like Task 4.

---

TASK 6 — Reporting
**Model: Opus 4.8.**

For each task, summarize what you found, what you built, and what's waiting on my input (design returns,
sourcing decision, category decision, schema approvals). Keep changes well-scoped. Anything destructive or
dependent on an undecided input → stop and ask.

Start with Task 1.
