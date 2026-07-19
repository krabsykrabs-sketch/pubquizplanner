#!/usr/bin/env python3
"""
Split Reddit final JSON into clean vs needs-translation groups.
"""

import json
import os
import math

def split_reddit_final():
    # Read the final file
    with open('data/pipeline/reddit/reddit_sundayquiz_final.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)

    clean_questions = []
    needs_translation = []

    # Categorize questions
    for q in questions:
        text_de = q.get('text_de', '')
        fun_fact_de = q.get('fun_fact_de', '')

        # Check if it's actually in German or needs translation
        is_english_text = (
            text_de.startswith('Which ') or
            text_de.startswith('What ') or
            text_de.startswith('Who ') or
            text_de.startswith('Where ') or
            text_de.startswith('When ') or
            text_de.startswith('How ') or
            text_de.startswith('Why ') or
            ' the ' in text_de[:50]  # English articles in first part
        )

        has_placeholder_fun_fact = 'Weitere Informationen zu dieser Frage sind verfügbar' in fun_fact_de

        if is_english_text or has_placeholder_fun_fact:
            needs_translation.append(q)
        else:
            clean_questions.append(q)

    # Save clean questions
    os.makedirs('data/pipeline/reddit', exist_ok=True)
    with open('data/pipeline/reddit/reddit_clean.json', 'w', encoding='utf-8') as f:
        json.dump(clean_questions, f, indent=2, ensure_ascii=False)

    # Save needs translation
    with open('data/pipeline/reddit/reddit_needs_translation.json', 'w', encoding='utf-8') as f:
        json.dump(needs_translation, f, indent=2, ensure_ascii=False)

    print(f"Clean questions (already in German): {len(clean_questions):,}")
    print(f"Needs translation: {len(needs_translation):,}")
    print(f"Total: {len(questions):,}")

    # Create retranslation batches
    batch_size = 200
    num_batches = math.ceil(len(needs_translation) / batch_size)

    batch_dir = 'data/pipeline/reddit/retranslate_batches'
    os.makedirs(batch_dir, exist_ok=True)

    for i in range(num_batches):
        start_idx = i * batch_size
        end_idx = min(start_idx + batch_size, len(needs_translation))
        batch_questions = needs_translation[start_idx:end_idx]

        batch_filename = os.path.join(batch_dir, f'batch_{i:02d}.json')
        with open(batch_filename, 'w', encoding='utf-8') as f:
            json.dump(batch_questions, f, indent=2, ensure_ascii=False)

    print(f"\nCreated {num_batches} retranslation batches in {batch_dir}/")
    print(f"Batch size: ~{batch_size} questions each")

if __name__ == "__main__":
    split_reddit_final()