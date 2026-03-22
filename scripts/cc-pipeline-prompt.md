# PubQuizPlanner Question Pipeline — CC Instructions

You are processing trivia questions for pubquizplanner.com, a German pub quiz generator.

## Directory Structure

```
data/opentriviaqa/              ← Raw English source files (DO NOT MODIFY)
data/pipeline/1-prefiltered/    ← After programmatic pre-filter (already done)
data/pipeline/2-translated/     ← Your German translations go here
data/pipeline/3-qc-checked/     ← Your QC results go here  
data/pipeline/4-final/          ← Import-ready files go here
data/pipeline/logs/             ← Progress tracking
```

## Category → DB slug mapping

```
general         → allgemeinwissen
geography       → geographie
history         → geschichte
science-technology → wissenschaft
animals         → wissenschaft
literature      → literatur
movies          → film-tv
music           → musik
sports          → sport
world           → allgemeinwissen
food-drink      → essen-trinken
art             → kunst-kultur
nature          → wissenschaft
mythology       → kunst-kultur
entertainment   → popkultur
people-places   → geographie
```

## Your Task

Process each category through TWO steps: Translate, then QC.
Work on ONE category at a time, processing in batches of 25 questions.

### STEP 1: TRANSLATE

For each prefiltered file in `data/pipeline/1-prefiltered/`:

1. Read the JSON file
2. Process 25 questions at a time
3. For each question, decide: KEEP or REJECT

**REJECT if:**
- Too American/Anglo-centric for German pub audience
- Too niche or obscure (nobody in a German pub would care)
- Only works as multiple choice (answer depends on seeing options)
- Boring, too easy, or too medical/technical
- Already covered by Wikidata questions (basic capitals, planets, elements)

**For KEEP questions, produce:**
```json
{
  "text_de": "German open-ended question (1-2 sentences, sounds good read aloud)",
  "answer_de": "German answer",
  "wrong_answers_de": [],
  "fun_fact_de": "Surprising fun fact in German (1-2 sentences)",
  "difficulty": 2,
  "tags": ["category-slug", "topic"],
  "_source": "opentriviaqa",
  "_source_category": "original-category-name"
}
```

**Difficulty scale:**
- 1 = Almost everyone knows this
- 2 = Good general knowledge  
- 3 = Need to know the topic well
- 4 = Expert knowledge

**Translation rules:**
- Rephrase as open-ended question (no answer options)
- Max 1-2 sentences, must sound natural read aloud by a quizmaster
- Adapt cultural references ("President" → "US-Präsident", city names to German)
- ~30% of questions should have DACH relevance where possible
- Fun facts should be genuinely surprising, not just restating the answer
- Tags: first tag = category slug from mapping above, then 1-2 topic tags in German

**Save results to:** `data/pipeline/2-translated/{category}.json`

**Track progress in:** `data/pipeline/logs/{category}-translate.log`
After each batch, append a line: `Batch N: X/25 kept`

**Expected keep rates (for reference):**
- general: ~7%
- science-technology: ~10%
- geography: ~14%  
- history, literature, animals: ~12%
- music, movies, sports: ~10%

### STEP 2: QC FACT-CHECK

For each translated file in `data/pipeline/2-translated/`:

1. Read the JSON file
2. Process 25 questions at a time
3. For each question:
   a. Read ONLY the question text
   b. Answer it yourself WITHOUT looking at answer_de
   c. Compare your answer with answer_de
   d. Check if the question is grammatically correct and unambiguous

**Rate each question:**
- `ok` — Your answer matches, question is clear
- `check` — You're unsure or multiple answers possible → provide fix
- `wrong` — The given answer is factually incorrect → provide fix or mark for removal
- `ambiguous` — Question allows multiple correct answers → rephrase
- `broken` — Grammar error or nonsensical text → fix or remove

**Save QC results to:** `data/pipeline/3-qc-checked/{category}-qc.json`
Format:
```json
[
  {"index": 0, "status": "ok"},
  {"index": 1, "status": "wrong", "my_answer": "...", "issue": "...", "fix_text_de": "...", "fix_answer_de": "..."},
]
```

### STEP 3: BUILD FINAL FILE

After QC, create the final import-ready file:

1. Read translated file + QC results
2. Keep all `ok` questions as-is
3. Apply fixes from `check` and `ambiguous` (use fix_text_de/fix_answer_de if provided)
4. REMOVE all `wrong` and `broken` questions
5. Remove internal fields (_source, _source_category, _qc_note) — keep only the import schema fields
6. Also check for duplicates (same answer_de appearing twice) and remove the worse version

**Final schema per question:**
```json
{
  "text_de": "...",
  "text_de_open": "...",  
  "answer_de": "...",
  "wrong_answers_de": [],
  "fun_fact_de": "...",
  "difficulty": 2,
  "tags": ["geographie", "europa"]
}
```
Note: `text_de_open` = same as `text_de` (all our questions are open-ended)

**Save to:** `data/pipeline/4-final/{category}.json`

**Print summary:**
```
Category: {name}
  Pre-filtered: {N} questions
  Translated: {N} kept ({rate}%)
  QC: {ok} ok, {fixed} fixed, {removed} removed
  Final: {N} import-ready questions
```

## Processing Order (by priority)

Process in this order (highest-value categories first):
1. geography
2. history  
3. music
4. movies
5. sports
6. animals
7. literature
8. world
9. food-drink
10. art
11. nature
12. mythology
13. entertainment
14. people-places

Skip: general and science-technology (ALREADY DONE manually)

## Resume Support

Before starting a category, check if partial results exist:
- If `2-translated/{cat}.json` exists → skip to QC
- If `3-qc-checked/{cat}-qc.json` exists → skip to final build
- If `4-final/{cat}.json` exists → skip entirely

## Important Notes

- Do NOT process categories in `SKIP_CATEGORIES`: celebrities, television, video-games, religion-faith, for-kids, brain-teasers, rated, newest
- Be STRICT in translation — it's better to reject than to keep a mediocre question
- For QC: if you're 90%+ sure the answer is wrong, mark as "wrong". If you're uncertain, mark as "check".
- Watch for duplicate questions across batches (same topic, different wording)
- All output files must be valid JSON with UTF-8 encoding
