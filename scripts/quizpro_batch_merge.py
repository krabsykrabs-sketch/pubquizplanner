#!/usr/bin/env python3
"""
Merge all batch_XX_reviewed.json files back into one final file.

Usage:
    cd ~/PubQuiz/pubquizplanner
    python3 scripts/quizpro_batch_merge.py
"""

import json
import glob
import os

BATCH_DIR = "data/pipeline/quizpro_batches"
OUTPUT = "data/pipeline/3-qc-checked/quizpro_gold_qc.json"

reviewed_files = sorted(glob.glob(os.path.join(BATCH_DIR, "batch_*_reviewed.json")))

if not reviewed_files:
    print(f"No reviewed files found in {BATCH_DIR}/")
    print("Run CC review on batches first.")
    exit(1)

print(f"Found {len(reviewed_files)} reviewed batch files")

all_ok = []
all_reject = 0

for filepath in reviewed_files:
    with open(filepath, encoding='utf-8') as f:
        batch = json.load(f)
    
    ok = [q for q in batch if q.get('status') == 'ok']
    rej = [q for q in batch if q.get('status') == 'reject']
    
    print(f"  {os.path.basename(filepath)}: {len(ok)} ok, {len(rej)} rejected")
    
    # Clean up internal fields before merging
    for q in ok:
        q.pop('_batch_index', None)
        q.pop('status', None)
        # Ensure required fields
        q.setdefault('_source', 'quizpro')
        q.setdefault('wrong_answers_de', [])
    
    all_ok.extend(ok)
    all_reject += len(rej)

# Save merged output
os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
with open(OUTPUT, 'w', encoding='utf-8') as f:
    json.dump(all_ok, f, ensure_ascii=False, indent=2)

print(f"\n{'='*60}")
print(f"Total approved: {len(all_ok)}")
print(f"Total rejected: {all_reject}")
print(f"Output: {OUTPUT}")

# Category breakdown
cats = {}
for q in all_ok:
    cats[q.get('category', '?')] = cats.get(q.get('category', '?'), 0) + 1
print(f"\nBy category:")
for cat, count in sorted(cats.items(), key=lambda x: -x[1]):
    print(f"  {count:5d}  {cat}")
