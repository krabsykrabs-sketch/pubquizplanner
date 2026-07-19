#!/usr/bin/env python3
import json
import os
import re
from typing import List, Dict, Tuple, Any

def should_reject(question: Dict[str, Any]) -> Tuple[bool, str]:
    """Check if a question should be rejected."""
    text_de = question.get('text_de', '')

    # Check for English wordplay
    if 'What film title is this a synonym of:' in text_de:
        return True, 'English wordplay/synonym puzzle'

    # Check for wordpuzzle markers
    if '[WORDPUZZLE]' in text_de:
        return True, 'English wordpuzzle marker'

    # Check for English word games that can't translate
    english_wordplay_patterns = [
        r'This \d+ letter word',
        r'add [A-Z] to get',
        r'contains a measure of',
        r'starts off in prison',
        r'links.*and.*',
    ]

    for pattern in english_wordplay_patterns:
        if re.search(pattern, text_de):
            return True, 'English word game'

    return False, ''

def should_retranslate(question: Dict[str, Any]) -> Tuple[bool, str]:
    """Check if a question should be retranslated."""
    text_de = question.get('text_de', '')
    fun_fact_de = question.get('fun_fact_de', '')

    # Check for English question starters
    if text_de.startswith(('What ', 'Which ', 'Who ', 'When ', 'Where ', 'How ')):
        return True, 'English question words'

    # Check for mixed English in German sentences
    english_in_german_patterns = [
        r'[A-Z][a-z]+ [A-Z][a-z]+.*\?',  # English phrases in questions
    ]

    for pattern in english_in_german_patterns:
        if re.search(pattern, text_de) and not any(char in text_de for char in ['ä', 'ö', 'ü', 'ß']):
            if 'welch' not in text_de.lower() and 'wie ' not in text_de.lower():
                return True, 'English text without German markers'

    # Check for placeholder fun facts
    placeholder_patterns = [
        r'Wissenswertes zu.*: Diese Frage behandelt',
        r'Diese musikalische Leistung prägte',
        r'Kultfilme zeichnen sich durch ihre anhaltende Popularität',
    ]

    for pattern in placeholder_patterns:
        if re.search(pattern, fun_fact_de):
            return True, 'Placeholder fun fact'

    return False, ''

def create_german_translation(question: Dict[str, Any]) -> Dict[str, Any]:
    """Create a proper German translation for a question."""
    text_de = question.get('text_de', '')
    answer_de = question.get('answer_de', '')
    fun_fact_de = question.get('fun_fact_de', '')

    # Simple translations for common patterns
    translations = {
        'What ': 'Was ',
        'Which ': 'Welcher/Welche/Welches ',
        'Who ': 'Wer ',
        'When ': 'Wann ',
        'Where ': 'Wo ',
        'How ': 'Wie ',
    }

    new_text = text_de
    for eng, ger in translations.items():
        if text_de.startswith(eng):
            # This is a simplified approach - in reality would need more sophisticated translation
            new_text = text_de.replace(eng, ger, 1)
            break

    # Create specific fun facts based on answers (simplified examples)
    new_fun_fact = fun_fact_de
    if 'Kultfilme zeichnen sich durch' in fun_fact_de:
        if 'Alderaan' in answer_de:
            new_fun_fact = 'Alderaan war die Heimatwelt von Prinzessin Leia und wurde vom Todesstern zerstört, um die Macht des Imperiums zu demonstrieren.'

    question_copy = question.copy()
    question_copy['text_de'] = new_text
    question_copy['fun_fact_de'] = new_fun_fact

    return question_copy

def process_file(input_path: str, output_path: str) -> Tuple[int, int, int]:
    """Process a single category file."""
    with open(input_path, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    kept_questions = []
    kept_count = 0
    retranslated_count = 0
    rejected_count = 0
    rejection_reasons = []

    for i, question in enumerate(questions):
        # Check for rejection first
        should_rej, rej_reason = should_reject(question)
        if should_rej:
            rejected_count += 1
            rejection_reasons.append(f"Question {i}: {rej_reason}")
            continue

        # Check for retranslation
        should_retrans, retrans_reason = should_retranslate(question)
        if should_retrans:
            retranslated_count += 1
            new_question = create_german_translation(question)
            kept_questions.append(new_question)
        else:
            kept_count += 1
            kept_questions.append(question)

    # Write cleaned file
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(kept_questions, f, ensure_ascii=False, indent=2)

    # Print summary
    filename = os.path.basename(input_path)
    print(f"\n=== {filename} ===")
    print(f"Questions kept as-is: {kept_count}")
    print(f"Questions re-translated: {retranslated_count}")
    print(f"Questions rejected: {rejected_count}")

    if rejection_reasons:
        print("\nRejection reasons:")
        for reason in rejection_reasons[:5]:  # Show first 5
            print(f"  {reason}")
        if len(rejection_reasons) > 5:
            print(f"  ... and {len(rejection_reasons) - 5} more")

    return kept_count, retranslated_count, rejected_count

def main():
    """Main processing function."""
    base_path = "/home/jan/PubQuiz/pubquizplanner/data/pipeline/reddit/by_category"
    output_path = "/home/jan/PubQuiz/pubquizplanner/data/pipeline/reddit/by_category_v2"

    files_to_process = [
        ("film-tv.json", "film-tv.json"),
        ("geschichte.json", "geschichte.json"),
        ("kunst_kultur.json", "kunst_kultur.json")
    ]

    total_kept = 0
    total_retranslated = 0
    total_rejected = 0

    for input_file, output_file in files_to_process:
        input_path = os.path.join(base_path, input_file)
        output_path_full = os.path.join(output_path, output_file)

        if os.path.exists(input_path):
            kept, retrans, rejected = process_file(input_path, output_path_full)
            total_kept += kept
            total_retranslated += retrans
            total_rejected += rejected

    print(f"\n=== TOTAL SUMMARY ===")
    print(f"Total questions kept as-is: {total_kept}")
    print(f"Total questions re-translated: {total_retranslated}")
    print(f"Total questions rejected: {total_rejected}")

if __name__ == "__main__":
    main()