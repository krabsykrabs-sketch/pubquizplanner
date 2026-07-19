#!/usr/bin/env python3
"""
Merge clean questions + retranslated batches into final complete file.
Then split by category.
"""

import json
import os
from collections import Counter

def merge_and_split():
    print("🔗 Merging clean questions + retranslated batches...")

    # Load clean questions
    with open('data/pipeline/reddit/reddit_clean.json', 'r', encoding='utf-8') as f:
        clean_questions = json.load(f)

    # Load all retranslated batch outputs
    retranslated_questions = []
    batch_dir = 'data/pipeline/reddit/retranslate_batches'

    for i in range(7):  # batch_00_output.json through batch_06_output.json
        batch_file = os.path.join(batch_dir, f'batch_{i:02d}_output.json')
        if os.path.exists(batch_file):
            with open(batch_file, 'r', encoding='utf-8') as f:
                batch_questions = json.load(f)
                retranslated_questions.extend(batch_questions)
                print(f"  ✅ Loaded {len(batch_questions)} questions from batch_{i:02d}_output.json")

    # Combine all questions
    all_questions = clean_questions + retranslated_questions

    print(f"\n📊 FINAL COUNTS:")
    print(f"  Clean questions: {len(clean_questions):,}")
    print(f"  Retranslated questions: {len(retranslated_questions):,}")
    print(f"  Total questions: {len(all_questions):,}")

    # Save complete file
    with open('data/pipeline/reddit/reddit_sundayquiz_complete.json', 'w', encoding='utf-8') as f:
        json.dump(all_questions, f, indent=2, ensure_ascii=False)
    print(f"  ✅ Saved to reddit_sundayquiz_complete.json")

    # Create category directory
    category_dir = 'data/pipeline/reddit/by_category'
    os.makedirs(category_dir, exist_ok=True)

    # Group by category
    questions_by_category = {}
    for q in all_questions:
        tags = q.get('tags', [])
        if tags:
            category = tags[0]  # Use first tag as primary category
            if category not in questions_by_category:
                questions_by_category[category] = []
            questions_by_category[category].append(q)

    # Save category files and print counts
    print(f"\n📂 SPLIT BY CATEGORY:")
    total_categorized = 0

    for category, questions in sorted(questions_by_category.items()):
        # Clean filename
        filename = category.replace(' & ', '_').replace(' ', '_').lower() + '.json'
        filepath = os.path.join(category_dir, filename)

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(questions, f, indent=2, ensure_ascii=False)

        total_categorized += len(questions)
        print(f"  {category}: {len(questions):,} questions → {filename}")

    print(f"\n🎉 FINAL SUMMARY:")
    print(f"  Total questions: {len(all_questions):,}")
    print(f"  Categorized: {total_categorized:,}")
    print(f"  Categories: {len(questions_by_category)}")
    print(f"  Output directory: {category_dir}/")

if __name__ == "__main__":
    merge_and_split()