#!/usr/bin/env python3
"""
Final cleanup pass for Reddit Sunday Quiz questions.
Split into CLEAN vs NEEDS_FIX, then batch process fixes.
"""

import json
import os
import math
import re

def detect_placeholder_fun_fact(fun_fact):
    """Detect generic placeholder fun facts"""
    if not fun_fact:
        return True

    fun_fact_lower = fun_fact.lower()

    # Placeholder patterns
    placeholder_patterns = [
        "testet spezifisches wissen",
        "interessante frage aus einem online-quiz",
        "weitere informationen",
        "aus verschiedenen bereichen",
        "diese frage testet",
        "dies ist eine interessante",
        "interessante tatsache über",
        "diese antwort bezieht sich auf",
        "diese erfindung oder entdeckung veränderte",
        "musik ist eine universelle sprache"
    ]

    for pattern in placeholder_patterns:
        if pattern in fun_fact_lower:
            return True

    return False

def is_english_text(text):
    """Check if text is in English"""
    if not text:
        return True

    # Check for English question starters
    english_starters = [
        'Which ', 'What ', 'Who ', 'Where ', 'When ', 'How ', 'Why ',
        'In which', 'For which', 'From which', 'On which', 'At which',
        'Name the', 'Give the', 'State the'
    ]

    for starter in english_starters:
        if text.startswith(starter):
            return True

    # Check for [TRANSLATE] marker
    if '[TRANSLATE]' in text:
        return True

    # Check for common English words in first 50 characters
    first_part = text[:50].lower()
    english_indicators = [' the ', ' a ', ' an ', ' is ', ' was ', ' are ', ' were ', ' of ']
    english_count = sum(1 for indicator in english_indicators if indicator in first_part)

    return english_count >= 2

def split_and_analyze():
    print("🔍 Loading and analyzing reddit_sundayquiz_complete.json...")

    with open('data/pipeline/reddit/reddit_sundayquiz_complete.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)

    clean_questions = []
    needs_fix_questions = []

    for q in questions:
        text_de = q.get('text_de', '')
        fun_fact_de = q.get('fun_fact_de', '')

        # Check if text is German and fun fact is specific
        is_german_text = not is_english_text(text_de)
        is_specific_fun_fact = not detect_placeholder_fun_fact(fun_fact_de)

        if is_german_text and is_specific_fun_fact:
            clean_questions.append(q)
        else:
            needs_fix_questions.append(q)

    print(f"📊 ANALYSIS RESULTS:")
    print(f"  Total questions: {len(questions):,}")
    print(f"  CLEAN (ready to use): {len(clean_questions):,}")
    print(f"  NEEDS_FIX: {len(needs_fix_questions):,}")
    print(f"  Fix percentage: {(len(needs_fix_questions)/len(questions)*100):.1f}%")

    # Save clean questions
    os.makedirs('data/pipeline/reddit', exist_ok=True)
    with open('data/pipeline/reddit/clean_ready.json', 'w', encoding='utf-8') as f:
        json.dump(clean_questions, f, indent=2, ensure_ascii=False)
    print(f"  ✅ Saved {len(clean_questions):,} clean questions to clean_ready.json")

    # Create fix batches
    if needs_fix_questions:
        batch_size = 200
        num_batches = math.ceil(len(needs_fix_questions) / batch_size)

        batch_dir = 'data/pipeline/reddit/final_fix_batches'
        os.makedirs(batch_dir, exist_ok=True)

        for i in range(num_batches):
            start_idx = i * batch_size
            end_idx = min(start_idx + batch_size, len(needs_fix_questions))
            batch_questions = needs_fix_questions[start_idx:end_idx]

            batch_filename = os.path.join(batch_dir, f'batch_{i:02d}.json')
            with open(batch_filename, 'w', encoding='utf-8') as f:
                json.dump(batch_questions, f, indent=2, ensure_ascii=False)

        print(f"  📦 Created {num_batches} fix batches in {batch_dir}/")
        print(f"  Batch size: ~{batch_size} questions each")

        # Sample analysis of issues
        print(f"\n🔍 SAMPLE ISSUES FOUND:")
        english_count = sum(1 for q in needs_fix_questions[:50] if is_english_text(q.get('text_de', '')))
        placeholder_count = sum(1 for q in needs_fix_questions[:50] if detect_placeholder_fun_fact(q.get('fun_fact_de', '')))
        print(f"  English text_de (sample of 50): {english_count}")
        print(f"  Placeholder fun_fact_de (sample of 50): {placeholder_count}")

        # Show examples
        print(f"\n📝 SAMPLE ISSUES:")
        for i, q in enumerate(needs_fix_questions[:3]):
            print(f"  {i+1}. [{q.get('tags', [''])[0]}]")
            print(f"     text_de: {q.get('text_de', '')[:80]}...")
            print(f"     fun_fact: {q.get('fun_fact_de', '')[:80]}...")
            print()

if __name__ == "__main__":
    split_and_analyze()