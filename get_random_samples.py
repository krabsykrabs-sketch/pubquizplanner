#!/usr/bin/env python3
"""
Get 10 random examples from the complete Reddit quiz collection.
"""

import json
import random

def get_random_samples():
    with open('data/pipeline/reddit/reddit_sundayquiz_complete.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)

    # Get 10 random samples
    samples = random.sample(questions, 10)

    print("🎲 10 RANDOM EXAMPLES from Reddit Sunday Quiz Collection:")
    print("=" * 70)

    for i, q in enumerate(samples, 1):
        print(f"\n{i}. [{q.get('tags', [''])[0]}] [Difficulty {q.get('difficulty', '?')}]")
        print(f"   📝 {q.get('text_de', '')}")
        print(f"   ✅ {q.get('answer_de', '')}")
        print(f"   💡 {q.get('fun_fact_de', '')}")

if __name__ == "__main__":
    get_random_samples()