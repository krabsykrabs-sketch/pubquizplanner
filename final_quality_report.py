#!/usr/bin/env python3
"""
Generate final quality report for Reddit quiz collection.
"""

import json
import random

def quality_report():
    print("📊 REDDIT SUNDAY QUIZ FINAL QUALITY REPORT")
    print("=" * 60)

    with open('data/pipeline/reddit/reddit_final.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)

    print(f"Total Questions: {len(questions):,}")
    print()

    # Check for quality issues
    english_text = 0
    generic_fun_facts = 0
    quality_issues = []

    # Patterns that indicate quality issues
    english_patterns = ['Which ', 'What ', 'Who ', 'Where ', 'When ', 'How ', 'Why ']
    generic_patterns = [
        'testet spezifisches wissen',
        'interessante frage aus einem online-quiz',
        'weitere informationen',
        'aus verschiedenen bereichen',
        'diese frage testet',
        'dies ist eine interessante',
        'ein interessanter fakt über'
    ]

    for i, q in enumerate(questions):
        text_de = q.get('text_de', '')
        fun_fact = q.get('fun_fact_de', '').lower()

        # Check for English text
        if any(text_de.startswith(pattern) for pattern in english_patterns):
            english_text += 1
            if len(quality_issues) < 5:  # Store first 5 examples
                quality_issues.append(f"English text: {text_de[:80]}...")

        # Check for generic fun facts
        if any(pattern in fun_fact for pattern in generic_patterns):
            generic_fun_facts += 1
            if len(quality_issues) < 5:
                quality_issues.append(f"Generic fun fact: {fun_fact[:80]}...")

    # Calculate quality percentages
    german_text_pct = ((len(questions) - english_text) / len(questions)) * 100
    specific_fun_facts_pct = ((len(questions) - generic_fun_facts) / len(questions)) * 100

    print(f"🔍 QUALITY METRICS:")
    print(f"  German text: {len(questions) - english_text:,} / {len(questions):,} ({german_text_pct:.1f}%)")
    print(f"  Specific fun facts: {len(questions) - generic_fun_facts:,} / {len(questions):,} ({specific_fun_facts_pct:.1f}%)")
    print()

    if quality_issues:
        print(f"⚠️ REMAINING QUALITY ISSUES ({len(quality_issues)} examples):")
        for issue in quality_issues:
            print(f"  - {issue}")
        print()

    # Show high-quality examples
    print(f"✨ HIGH-QUALITY EXAMPLES:")

    # Try to find good quality examples
    good_examples = []
    for q in questions:
        text_de = q.get('text_de', '')
        fun_fact = q.get('fun_fact_de', '').lower()

        # Check if it's high quality
        is_german = text_de.startswith(('Welcher', 'Welche', 'Welches', 'Wer', 'Was', 'Wo', 'Wie'))
        is_specific = not any(pattern in fun_fact for pattern in generic_patterns) and len(fun_fact) > 50

        if is_german and is_specific:
            good_examples.append(q)

    # Show 5 random high-quality examples
    if good_examples:
        samples = random.sample(good_examples, min(5, len(good_examples)))
        for i, q in enumerate(samples, 1):
            print(f"{i}. [{q.get('tags', [''])[0]}] [Difficulty {q.get('difficulty', '?')}]")
            print(f"   📝 {q.get('text_de', '')}")
            print(f"   ✅ {q.get('answer_de', '')}")
            print(f"   💡 {q.get('fun_fact_de', '')}")
            print()

    # Overall assessment
    overall_quality = (german_text_pct + specific_fun_facts_pct) / 2
    print(f"🎯 OVERALL QUALITY SCORE: {overall_quality:.1f}%")

    if overall_quality >= 90:
        print("🎉 EXCELLENT - Production ready!")
    elif overall_quality >= 75:
        print("✅ GOOD - Minor issues remain")
    else:
        print("⚠️ NEEDS WORK - Significant quality issues")

if __name__ == "__main__":
    quality_report()