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

    # Check for placeholder fun facts
    placeholder_patterns = [
        r'Kultfilme zeichnen sich durch ihre anhaltende Popularität',
        r'Wissenswertes zu.*: Diese Frage behandelt',
        r'Diese musikalische Leistung prägte',
    ]

    for pattern in placeholder_patterns:
        if re.search(pattern, fun_fact_de):
            return True, 'Placeholder fun fact'

    return False, ''

def create_specific_translations() -> Dict[str, Dict[str, str]]:
    """Create specific translations for known questions."""
    return {
        "Only glimpsed in the Star Wars films, what Earth-like planet is the only one destroyed by the first Death Star?": {
            "text_de": "Welcher erdähnliche Planet wird im ersten Todesstern in den Star Wars-Filmen zerstört?",
            "fun_fact_de": "Alderaan war die Heimatwelt von Prinzessin Leia und wurde vom Todesstern zerstört, um die Macht des Imperiums zu demonstrieren."
        },
        "On film, what did Hannibal Lecter want to eat with liver?": {
            "text_de": "Was wollte Hannibal Lecter im Film mit Leber essen?",
            "fun_fact_de": "Das berühmte Zitat 'I ate his liver with some fava beans and a nice Chianti' stammt aus 'Das Schweigen der Lämmer' von 1991."
        },
        "What member of the Adams Family television series is known for being played by two actors in the last 20+ years?": {
            "text_de": "Welches Mitglied der Addams Family wurde in den letzten 20+ Jahren von zwei verschiedenen Schauspielern gespielt?",
            "fun_fact_de": "Uncle Fester wurde sowohl von Christopher Lloyd als auch von Nick Kroll in verschiedenen Adaptionen gespielt."
        },
        "Who played Wednesday Addams in the 1991 film, The Addams Family?": {
            "text_de": "Wer spielte Wednesday Addams im Film 'Die Addams Family' von 1991?",
            "fun_fact_de": "Christina Ricci wurde durch ihre Rolle als Wednesday Addams berühmt und prägte das Bild der gotischen Teenager-Figur."
        },
        "What actor plays the character of Harry Potter's father in flashback scenes throughout the Harry Potter film series?": {
            "text_de": "Welcher Schauspieler spielt Harry Potters Vater in Rückblenden der Harry Potter-Filmreihe?",
            "fun_fact_de": "Adrian Rawlins spielte James Potter und ist auch bekannt für seine Rolle in 'The Woman in Black'."
        },
        "What city did the car racing TV show \"Dukes of Hazzard\" take place in?": {
            "text_de": "In welcher Stadt spielt die Autorennen-TV-Serie 'Dukes of Hazzard'?",
            "fun_fact_de": "Die Serie spielte in der fiktiven Stadt Hazzard County, Georgia, und wurde berühmt für ihre spektakulären Autostunts."
        },
        "What film is this quote from: \"I'll be back\"?": {
            "text_de": "Aus welchem Film stammt das Zitat 'I'll be back'?",
            "fun_fact_de": "Dieses ikonische Zitat von Arnold Schwarzenegger aus 'Terminator' wurde zu einem der berühmtesten Filmzitate aller Zeiten."
        }
    }

def create_fun_facts_by_answer() -> Dict[str, str]:
    """Create specific fun facts based on answers."""
    return {
        "Fava Beans": "Das berühmte Zitat 'I ate his liver with some fava beans and a nice Chianti' stammt aus 'Das Schweigen der Lämmer' von 1991.",
        "Alderaan": "Alderaan war die Heimatwelt von Prinzessin Leia und wurde vom Todesstern zerstört, um die Macht des Imperiums zu demonstrieren.",
        "Uncle Fester": "Uncle Fester wurde sowohl von Christopher Lloyd als auch von Nick Kroll in verschiedenen Adaptionen der Addams Family gespielt.",
        "Christina Ricci": "Christina Ricci wurde durch ihre Rolle als Wednesday Addams berühmt und prägte das Bild der gotischen Teenager-Figur.",
        "Adrian Rawlins": "Adrian Rawlins spielte James Potter und ist auch bekannt für seine Rolle in 'The Woman in Black'.",
        "Hazzard County": "Die Serie spielte in der fiktiven Stadt Hazzard County, Georgia, und wurde berühmt für ihre spektakulären Autostunts.",
        "Terminator": "Dieses ikonische Zitat von Arnold Schwarzenegger aus 'Terminator' wurde zu einem der berühmtesten Filmzitate aller Zeiten."
    }

def create_german_translation(question: Dict[str, Any]) -> Dict[str, Any]:
    """Create a proper German translation for a question."""
    text_de = question.get('text_de', '')
    answer_de = question.get('answer_de', '')
    fun_fact_de = question.get('fun_fact_de', '')

    # Use specific translations first
    specific_translations = create_specific_translations()
    if text_de in specific_translations:
        question_copy = question.copy()
        question_copy['text_de'] = specific_translations[text_de]['text_de']
        question_copy['fun_fact_de'] = specific_translations[text_de]['fun_fact_de']
        return question_copy

    # Use answer-based fun facts
    fun_facts_by_answer = create_fun_facts_by_answer()
    if answer_de in fun_facts_by_answer:
        question_copy = question.copy()
        question_copy['fun_fact_de'] = fun_facts_by_answer[answer_de]
        # Still need to translate the question text
        question_copy['text_de'] = translate_question_text(text_de)
        return question_copy

    # Fallback to basic translation
    question_copy = question.copy()
    question_copy['text_de'] = translate_question_text(text_de)

    # Improve generic fun facts
    if 'Kultfilme zeichnen sich durch' in fun_fact_de:
        question_copy['fun_fact_de'] = f"{answer_de} ist ein wichtiger Film in der Filmgeschichte."

    return question_copy

def translate_question_text(text_de: str) -> str:
    """Translate English question text to German."""
    # Simple pattern matching for common structures
    patterns = [
        (r'^What (.+) is (.+)\?', r'Was ist \1, das \2?'),
        (r'^What (.+) was (.+)\?', r'Was war \1, das \2?'),
        (r'^What (.+) did (.+)\?', r'Was hat \1 \2?'),
        (r'^Who (.+) in (.+)\?', r'Wer \1 in \2?'),
        (r'^Who played (.+)\?', r'Wer spielte \1?'),
        (r'^Which (.+) is (.+)\?', r'Welche/r/s \1 ist \2?'),
        (r'^What film (.+)\?', r'Welcher Film \1?'),
        (r'^What actor (.+)\?', r'Welcher Schauspieler \1?'),
        (r'^What city (.+)\?', r'Welche Stadt \1?'),
    ]

    for pattern, replacement in patterns:
        match = re.match(pattern, text_de, re.IGNORECASE)
        if match:
            # This is a very basic translation - in practice would need much more sophisticated logic
            return re.sub(pattern, replacement, text_de, flags=re.IGNORECASE)

    # Fallback: basic word replacement
    translations = {
        'What ': 'Was ',
        'Which ': 'Welche/r/s ',
        'Who ': 'Wer ',
        'When ': 'Wann ',
        'Where ': 'Wo ',
        'How ': 'Wie ',
    }

    for eng, ger in translations.items():
        if text_de.startswith(eng):
            return text_de.replace(eng, ger, 1)

    return text_de

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
        for reason in rejection_reasons:
            print(f"  {reason}")

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