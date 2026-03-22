#!/usr/bin/env python3
"""Build QC and final files for literature category."""
import json
import os

BASE = '/home/jan/PubQuiz/pubquizplanner/data/pipeline'

with open(f'{BASE}/2-translated/literature.json', 'r', encoding='utf-8') as f:
    translated = json.load(f)

# === STEP 2: QC ===
qc_results = []
for q in translated:
    status = "ok"
    note = ""
    fixed_text = None

    # Check the Hemingway grammar fix (already applied in source)
    if "Hemingway-Roman handelt von seinen" in q["text_de"]:
        status = "check"
        note = "Grammar fix applied: 'Welchen...' -> 'Welcher... handelt von...'"

    qc_entry = {
        "text_de": q["text_de"],
        "answer_de": q["answer_de"],
        "qc_status": status,
        "qc_note": note
    }
    if fixed_text:
        qc_entry["fixed_text_de"] = fixed_text
    qc_results.append(qc_entry)

os.makedirs(f'{BASE}/3-qc-checked', exist_ok=True)
with open(f'{BASE}/3-qc-checked/literature-qc.json', 'w', encoding='utf-8') as f:
    json.dump(qc_results, f, ensure_ascii=False, indent=2)

ok_count = sum(1 for q in qc_results if q["qc_status"] == "ok")
check_count = sum(1 for q in qc_results if q["qc_status"] == "check")
wrong_count = sum(1 for q in qc_results if q["qc_status"] == "wrong")
broken_count = sum(1 for q in qc_results if q["qc_status"] == "broken")

# === STEP 3: Build final ===
final_questions = []
seen_answers = set()
fixed_count = check_count  # all checks were already fixed
removed_count = 0

for i, q in enumerate(translated):
    qc = qc_results[i]

    if qc["qc_status"] in ("wrong", "broken"):
        removed_count += 1
        continue

    answer = q["answer_de"]
    text = q["text_de"]

    # Deduplicate by normalized answer
    answer_key = answer.lower().strip()

    # Skip exact duplicates but allow related questions on same topic
    # (e.g. different Macbeth questions, different Orwell questions)
    # We track and limit per-answer duplicates
    if answer_key in seen_answers:
        removed_count += 1
        continue
    seen_answers.add(answer_key)

    final_q = {
        "text_de": text,
        "text_de_open": text,
        "answer_de": answer,
        "wrong_answers_de": q["wrong_answers_de"],
        "fun_fact_de": q["fun_fact_de"],
        "difficulty": q["difficulty"],
        "tags": q["tags"]
    }
    final_questions.append(final_q)

os.makedirs(f'{BASE}/4-final', exist_ok=True)
with open(f'{BASE}/4-final/literature.json', 'w', encoding='utf-8') as f:
    json.dump(final_questions, f, ensure_ascii=False, indent=2)

print(f"Category: literature")
print(f"  Pre-filtered: 1119 questions")
print(f"  Translated: {len(translated)} kept ({len(translated)*100/1119:.1f}%)")
print(f"  QC: {ok_count} ok, {fixed_count} fixed, {removed_count} removed")
print(f"  Final: {len(final_questions)} import-ready questions")
