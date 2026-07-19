#!/usr/bin/env python3
import json
import os

def get_translation_summary():
    """Get summary of translations completed"""

    summary = {}
    total_questions = 0

    for batch_num in range(10, 20):
        output_file = f'/home/jan/PubQuiz/pubquizplanner/data/pipeline/reddit/batches/batch_{batch_num:02d}_output.json'

        if os.path.exists(output_file):
            try:
                with open(output_file, 'r') as f:
                    data = json.load(f)
                    count = len(data)
                    summary[batch_num] = count
                    total_questions += count
            except:
                summary[batch_num] = 0
        else:
            summary[batch_num] = 0

    return summary, total_questions

if __name__ == "__main__":
    summary, total = get_translation_summary()

    print("Translation Summary for Batches 10-19:")
    print("=" * 40)

    for batch_num in range(10, 20):
        count = summary.get(batch_num, 0)
        print(f"Batch {batch_num:02d}: {count:3d} questions translated")

    print("=" * 40)
    print(f"Total:      {total:3d} questions translated")

    # Calculate approval rate
    # Assuming ~200 questions per batch × 10 batches = ~2000 total questions
    estimated_total = 200 * 10
    approval_rate = (total / estimated_total) * 100 if estimated_total > 0 else 0

    print(f"Estimated approval rate: {approval_rate:.1f}%")