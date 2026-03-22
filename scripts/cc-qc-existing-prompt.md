# QC Check for Existing Translated Files

You already have translated German questions in `data/opentriviaqa_filtered/`.
These need QC checking before import.

## Task

1. List all `-de.json` files in `data/opentriviaqa_filtered/`
2. For each file, run the QC fact-check (same process as in cc-pipeline-prompt.md Step 2)
3. Apply the faktencheck results from `data/pipeline/logs/faktencheck-ergebnisse.json` if it exists (some QC was already done manually)
4. Build final import-ready files in `data/pipeline/4-final/`

## QC Process (per batch of 25 questions)

For each question:
a. Read ONLY `text_de` (the question)
b. Answer it yourself WITHOUT looking at `answer_de`
c. Compare your answer with `answer_de`
d. Rate: ok / check / wrong / ambiguous / broken

For anything not "ok", provide: `my_answer`, `issue`, and optionally `fix_text_de` / `fix_answer_de`

## After QC

Build final files:
- Keep "ok" as-is
- Apply fixes from "check"/"ambiguous" 
- Remove "wrong"/"broken"
- Remove duplicates (same answer appearing twice)
- Ensure each question has: text_de, text_de_open (= text_de), answer_de, wrong_answers_de, fun_fact_de, difficulty, tags

Save to `data/pipeline/4-final/{category-name}.json`

Print summary per file.
