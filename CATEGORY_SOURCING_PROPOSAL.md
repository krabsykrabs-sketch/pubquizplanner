# New categories: agnosticism check + sourcing proposal

**OPUS Task 2 deliverable. Nothing here sources or authors questions — it's an
audit plus options for your decision.**

---

## Part A — Is the system category-agnostic? Yes.

Categories are fully data-driven. The `categories` table is just:

| column | notes |
|---|---|
| `id` | serial |
| `slug` | plain string — **no enum, no union type** anywhere in the code |
| `name_de` | display name (source locale) |
| `icon` | emoji, stored in DB |
| `sort_order` | ordering |

Everything downstream reads this table dynamically:

- **Landing page, `/fragen`, category pages, sitemap, the generator's category
  API** all query categories with `HAVING COUNT(q.id) >= 30` — a category becomes
  visible automatically once it clears the threshold, and there is **no `active`
  flag to toggle**.
- **Admin** (review / questions / import screens) reads the category list from the
  DB, so the create/edit dropdowns pick up a new category with no code change.
- `Category.slug` is typed `string`; hreflang, translations, and serving queries
  are all slug-agnostic (post-Task-1).

**The only place that references category slugs literally** is
`src/lib/category-intros.ts` (SEO intro paragraphs, keyed by slug) — and it has a
built-in fallback: `getCategoryIntro()` returns `null` for an unknown slug and the
page renders a templated intro instead. So an intro is *optional polish*, not a
blocker.

### To add a category, the complete list of steps is:

1. `INSERT` a row into `categories` (`slug`, `name_de`, `icon`, `sort_order`).
2. Get it to **≥30 approved German questions** → it appears in DE automatically.
3. Per non-German locale: add a `category_translations` row (localized name) and
   reach ≥30 translated questions → it appears in that locale.
4. *(Optional)* add an SEO intro in `category-intros.ts`.

No migration, no routing, no component changes. **The only open input is where the
questions come from — that's Part B.**

---

## Part B — Where do new-category questions come from?

### What exists today

- **DB provenance:** 977 questions with empty `source` (the original seed corpus)
  + 187 `claude-fable-5` (LLM-authored). That's the entire live inventory.
- **You have already built extensive sourcing pipelines** under `data/pipeline/`
  (stages `1-prefiltered → 2-translated → 3-qc-checked → 4-final`) and parsers for
  several sources — but **none of that external material has been imported into the
  DB yet.** It's parked mid-pipeline. Any sourcing decision is really "which of
  these do we finish and import, and for which categories."

### The candidate sources, mapped to the pipeline

| Source | Language | In-repo state | License risk | House-taste fit | Best for |
|---|---|---|---|---|---|
| **Fable authoring** | DE native | Proven (187 live) | None | **Highest** (written to house style) | Any taste-critical category; getting a category from 0→~40 cleanly |
| **QuizPro_Kataloge** | **DE native** | 47 topic folders + `quizpro_batches/` staged | **Unknown — third-party quiz software catalogs; must clear** | Medium (varies by catalog) | Volume in German with no translation: e.g. Wirtschaft, Länder/Flaggen, Film sub-topics |
| **Reddit u/sundayquiz** | EN (UK) | Parsed, `by_category_final/` | Reddit user content — attribution/ToS | Medium (pub-native but UK-centric) | Fresh pub-style questions after translation + filtering |
| **Jeopardy!** | EN (US) | Filtered for food/pop, batched | Dataset terms; US-centric | **Low** (US insider knowledge violates house rule #6) | Idea-mining only for a couple of categories |
| **OpenTDB / OpenTriviaQA** | EN | 25 / 7 files staged | **Clean** (OpenTDB is CC-BY-SA) | Low (generic, and MC-format — we're open-answer only) | Not recommended except as raw prompts |
| **Wikidata** | Structured | 18 files | **Clean** (CC0) | Low unless reshaped (produces WER/lookup questions) | A facts-heavy visual category (e.g. Länder & Flaggen) |

### The three cross-cutting constraints that decide fit

1. **House taste** (`AUTHORING.md`): the twist goes in the *answer*, ask WAS/WARUM
   not WER, no famous canon, no US/UK insider knowledge, ~30% DACH. External banks
   (esp. Jeopardy/OpenTDB) fail this often → heavy filtering, low yield.
2. **Translation**: every English source adds a translate + re-QC hop and risks
   unnatural German. German sources (Fable, QuizPro) skip this entirely.
3. **Licensing**: **Fable/Wikidata/OpenTDB are clean. QuizPro and Reddit/Jeopardy
   are not obviously cleared** — importing third-party quiz text at scale is a
   decision you need to make before we finish those pipelines.

---

## Recommendation (for your decision — I won't proceed until you pick)

**A hybrid, taste-first strategy:**

- **Default to Fable authoring** for each new category's core ~40 questions. It's
  the only source that's proven, license-clean, German-native, and on-taste, and
  it's how technik/sprache just got over the line. Cost and fact-checking are the
  price; both are manageable at ~40/category.
- **Use QuizPro_Kataloge as a German idea/well** *if* you can confirm it's
  license-OK — it's the one bulk source with no translation penalty. Treat catalog
  items as raw material a Fable pass rewrites to house style (dodges verbatim-copy
  IP issues and taste mismatches at once).
- **Deprioritize Jeopardy/OpenTDB/OpenTriviaQA** for new categories — translation +
  US/UK bias + format mismatch make the yield poor. Keep them only as prompt fuel.
- **Wikidata** only if you want a facts/visual category (Länder & Flaggen), and only
  through a reshaping pass so it isn't all WER-questions.

### Candidate new categories (you decide — these are just options)

Gaps not well covered by the current 14, with a natural source:

- **Wirtschaft & Marken** (economy/brands) — QuizPro "Markt" + Fable
- **Natur & Tiere** (split from the huge wissenschaft bucket) — Fable
- **Religion & Mythologie** — Fable
- **Videospiele / Gaming** — Fable (fresh, on-brand, license-clean)
- **Serien & Streaming** (split from film-tv) — Fable + Reddit
- **Länder & Flaggen** (visual round) — Wikidata + QuizPro "Länderflaggen"

---

## Decisions I need from you

1. **Which new categories** do you want to add (from the shortlist or your own)?
2. **Source strategy** — confirm Fable-first hybrid, or steer otherwise?
3. **Licensing** — is QuizPro_Kataloge (and any Reddit/Jeopardy text) cleared for
   use, even as rewrite source material?

Once you decide, the actual authoring/import is a **separate Fable session** (per
your plan) — this task stops here.
