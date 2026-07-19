#!/usr/bin/env python3
"""
Analyze the final Reddit Sunday Quiz translation results.
"""

import json
import random
from collections import Counter

def analyze_reddit_final():
    with open('data/pipeline/reddit/reddit_sundayquiz_final.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)

    print(f"📊 REDDIT SUNDAY QUIZ FINAL ANALYSIS")
    print(f"=" * 50)

    # Basic stats
    total_questions = len(questions)
    print(f"Total questions: {total_questions:,}")
    print()

    # Distribution by tag
    tags = []
    for q in questions:
        if 'tags' in q and q['tags']:
            tags.extend(q['tags'])

    tag_distribution = Counter(tags)
    print("📍 Distribution by Tag:")
    for tag, count in tag_distribution.most_common():
        percentage = (count / total_questions) * 100
        print(f"  {tag}: {count:,} ({percentage:.1f}%)")
    print()

    # Distribution by difficulty
    difficulties = [q.get('difficulty', 0) for q in questions if 'difficulty' in q]
    difficulty_distribution = Counter(difficulties)
    print("🎯 Distribution by Difficulty:")
    for difficulty in sorted(difficulty_distribution.keys()):
        count = difficulty_distribution[difficulty]
        percentage = (count / total_questions) * 100
        print(f"  Level {difficulty}: {count:,} ({percentage:.1f}%)")
    print()

    # Random samples
    print("🎲 5 Random Samples:")
    sample_questions = random.sample(questions, min(5, len(questions)))
    for i, q in enumerate(sample_questions, 1):
        print(f"  {i}. [{q.get('tags', [''])[0]}] {q.get('text_de', 'NO TEXT')}")
        print(f"     Answer: {q.get('answer_de', 'NO ANSWER')}")
        print(f"     Fun fact: {q.get('fun_fact_de', 'NO FUN FACT')[:80]}...")
        print(f"     Difficulty: {q.get('difficulty', 'N/A')}")
        print()

    print("🔍 QUALITY ISSUES CHECK:")
    print("=" * 30)

    # Check for empty text_de or answer_de
    empty_text = [i for i, q in enumerate(questions) if not q.get('text_de', '').strip()]
    empty_answer = [i for i, q in enumerate(questions) if not q.get('answer_de', '').strip()]

    print(f"❌ Empty text_de: {len(empty_text)} questions")
    if empty_text[:5]:  # Show first 5 examples
        for idx in empty_text[:5]:
            print(f"   Question {idx}: {questions[idx]}")

    print(f"❌ Empty answer_de: {len(empty_answer)} questions")
    if empty_answer[:5]:  # Show first 5 examples
        for idx in empty_answer[:5]:
            print(f"   Question {idx}: {questions[idx]}")

    # Check for fun facts that are just answer restated
    poor_fun_facts = []
    for i, q in enumerate(questions):
        fun_fact = q.get('fun_fact_de', '').lower().strip()
        answer = q.get('answer_de', '').lower().strip()
        if fun_fact and answer and (answer in fun_fact or fun_fact == answer):
            poor_fun_facts.append(i)

    print(f"❌ Fun facts that just restate answer: {len(poor_fun_facts)} questions")
    if poor_fun_facts[:3]:  # Show first 3 examples
        for idx in poor_fun_facts[:3]:
            q = questions[idx]
            print(f"   Answer: '{q.get('answer_de', '')}' | Fun fact: '{q.get('fun_fact_de', '')}'")

    # Check for # characters in answers
    hash_answers = []
    for i, q in enumerate(questions):
        answer = q.get('answer_de', '')
        if '#' in answer:
            hash_answers.append(i)

    print(f"❌ Answers with # characters: {len(hash_answers)} questions")
    if hash_answers[:5]:  # Show first 5 examples
        for idx in hash_answers[:5]:
            print(f"   Answer: '{questions[idx].get('answer_de', '')}'")

    # Summary
    print(f"\n🎉 QUALITY SUMMARY:")
    total_issues = len(empty_text) + len(empty_answer) + len(poor_fun_facts) + len(hash_answers)
    quality_percentage = ((total_questions - total_issues) / total_questions) * 100
    print(f"Questions with issues: {total_issues:,}")
    print(f"Clean questions: {total_questions - total_issues:,}")
    print(f"Quality rate: {quality_percentage:.1f}%")

if __name__ == "__main__":
    analyze_reddit_final()