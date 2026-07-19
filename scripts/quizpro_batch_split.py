#!/usr/bin/env python3
"""
Split quizpro_final_checked.json into batches of 100 for CC review.
Creates batch files + a master CC prompt.

Usage:
    cd ~/PubQuiz/pubquizplanner
    python3 scripts/quizpro_batch_split.py
"""

import json
import os

INPUT = "data/pipeline/3-qc-checked/quizpro_final.json"
OUTPUT_DIR = "data/pipeline/quizpro_batches"
BATCH_SIZE = 100

os.makedirs(OUTPUT_DIR, exist_ok=True)

with open(INPUT, encoding='utf-8') as f:
    data = json.load(f)

print(f"Total questions: {len(data)}")
num_batches = (len(data) + BATCH_SIZE - 1) // BATCH_SIZE
print(f"Batches of {BATCH_SIZE}: {num_batches}")

for batch_num in range(num_batches):
    start = batch_num * BATCH_SIZE
    end = min(start + BATCH_SIZE, len(data))
    batch = data[start:end]
    
    # Add original index for tracking
    for i, q in enumerate(batch):
        q['_batch_index'] = start + i
    
    outpath = os.path.join(OUTPUT_DIR, f"batch_{batch_num:02d}.json")
    with open(outpath, 'w', encoding='utf-8') as f:
        json.dump(batch, f, ensure_ascii=False, indent=2)
    
    print(f"  batch_{batch_num:02d}.json: questions {start}-{end-1} ({len(batch)} items)")

# Write the CC prompt template
prompt = """Read the file data/pipeline/quizpro_batches/batch_XX.json

This file contains German pub quiz (Kneipenquiz) questions from an old quiz database. 
Your job: review each question and REJECT or APPROVE it.

REJECT a question if:
- It only makes sense as multiple choice (e.g. "Was ist keine Blume?", "Was ist die richtige Rechtschreibung?" — these need MC options to work)
- The question is ambiguous — no unique, clear answer exists
- The answer is factually wrong (check carefully!)
- The question is too niche for a general pub quiz audience
- The question is outdated and no longer true
- The question is too trivial or boring (e.g. "Was ist die Hauptstadt von Frankreich?")
- The question text is garbled, unclear, or incomplete
- The answer is incomplete or truncated
- Relative time references that make the question undateable ("vor X Jahren")

APPROVE and ENRICH if the question is good. For each approved question, output:
{
  "_batch_index": N,
  "status": "ok",
  "text_de": "cleaned/improved question text",
  "answer_de": "verified/corrected answer",
  "category": "one of: Wissenschaft, Geschichte, Geographie, Literatur, Allgemeinwissen, Film&TV, Musik, Sport, Popkultur, Essen&Trinken, Kunst&Kultur, Sprache, Technik, Logik&Mathe",
  "difficulty": 1-3,
  "fun_fact_de": "interesting fun fact in German, 1-2 sentences",
  "tags": ["tag1", "tag2"]
}

For rejected questions:
{
  "_batch_index": N,
  "status": "reject",
  "reason": "brief reason"
}

Difficulty scale:
1 = easy, most pub visitors would know this
2 = medium, requires solid general knowledge  
3 = hard, only knowledgeable people get this right

Write the output to data/pipeline/quizpro_batches/batch_XX_reviewed.json

IMPORTANT:
- Fix typos in questions and answers
- Verify facts — these questions are 15-25 years old
- Generate a fun_fact_de for every approved question
- Re-categorize if the existing category seems wrong
- Be strict: when in doubt, reject. Quality > quantity.
"""

with open(os.path.join(OUTPUT_DIR, "CC_PROMPT.md"), 'w') as f:
    f.write(prompt)

print(f"\nPrompt template saved to {OUTPUT_DIR}/CC_PROMPT.md")
print(f"\nTo run batch 0:")
print(f"  cd ~/PubQuiz/pubquizplanner")
print(f"  # Copy prompt from {OUTPUT_DIR}/CC_PROMPT.md")
print(f"  # Replace XX with 00, paste into CC")
