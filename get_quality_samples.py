#!/usr/bin/env python3
"""
Get high-quality examples from different categories.
"""

import json
import random

def get_quality_samples():
    # Load specific categories
    categories = [
        ('geographie.json', 'Geographie'),
        ('literatur.json', 'Literatur'),
        ('musik.json', 'Musik'),
        ('wissenschaft.json', 'Wissenschaft'),
        ('film-tv.json', 'Film-TV')
    ]

    print("🎯 10 HIGH-QUALITY EXAMPLES from Reddit Sunday Quiz Collection:")
    print("=" * 70)

    example_count = 0

    for filename, category in categories:
        try:
            with open(f'data/pipeline/reddit/by_category/{filename}', 'r', encoding='utf-8') as f:
                questions = json.load(f)

            # Filter for high-quality German questions (no English text, no generic fun facts)
            quality_questions = []
            for q in questions:
                text_de = q.get('text_de', '')
                fun_fact = q.get('fun_fact_de', '')

                # Check for proper German questions
                is_german = (
                    text_de.startswith(('Welcher', 'Welche', 'Welches', 'Wer', 'Was', 'Wo', 'Wann', 'Wie', 'In welchem', 'Von welchem')) and
                    not text_de.startswith(('Which', 'What', 'Who', 'Where')) and
                    'Weitere Informationen' not in fun_fact and
                    'Dies ist eine interessante' not in fun_fact and
                    '[TRANSLATE]' not in text_de
                )

                if is_german:
                    quality_questions.append(q)

            # Get 2 random samples from this category
            if quality_questions:
                samples = random.sample(quality_questions, min(2, len(quality_questions)))
                for q in samples:
                    example_count += 1
                    if example_count > 10:
                        break

                    print(f"\n{example_count}. [{q.get('tags', [''])[0]}] [Difficulty {q.get('difficulty', '?')}]")
                    print(f"   📝 {q.get('text_de', '')}")
                    print(f"   ✅ {q.get('answer_de', '')}")
                    print(f"   💡 {q.get('fun_fact_de', '')}")
        except:
            continue

        if example_count >= 10:
            break

if __name__ == "__main__":
    get_quality_samples()