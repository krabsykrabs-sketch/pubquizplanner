#!/usr/bin/env python3
"""
reddit_cleanup.py
Clean Reddit pipeline category files:
1. Remove questions still in English (text_de is English)
2. Set fun_fact_de to null if it's a generic placeholder
3. Report stats

Usage:
    python3 reddit_cleanup.py <input_dir> <output_dir>
    python3 reddit_cleanup.py data/pipeline/reddit/by_category_final data/pipeline/reddit/by_category_clean
"""

import json
import re
import os
import sys
import glob

# ─── Detection patterns ──────────────────────────────────────────────────────

ENGLISH_START = re.compile(
    r'^(What |Which |Who |Where |When |How |In which |Name the |The |A |An |'
    r'On |From |If |During |After |Before |Is |Are |Was |Were |Do |Does |'
    r'Did |Can |Could |Would |Should |Has |Have |Had |This |That |These |'
    r'Those |It |There |One |Two |Only |According |\[TRANSLATE\]|\[WORDPUZZLE\])',
    re.IGNORECASE
)

# Also catch questions that are clearly English even without standard starters
ENGLISH_BODY = re.compile(
    r'\b(is called|is known|is the|was the|are the|were the|is named|'
    r'was named|is considered|was considered|is famous|was famous|'
    r'is located|was located|is made|was made|to avoid talking)\b',
    re.IGNORECASE
)

GERMAN_MARKERS = re.compile(r'[äöüßÄÖÜ]|^(Welch|Wer |Was |Wie |Wo |Wann |Warum )')

GENERIC_FUN_FACTS = [
    'gehört zur klassischen',
    'gehört zum Bereich',
    'gehört zu den',
    'testet spezifisches Wissen',
    'interessante Frage',
    'Weitere Informationen',
    'verschiedenen Bereichen',
    'Allgemeinbildung',
    'wichtiges Thema',
    'Wissenswertes zu',
    'aus dem Bereich',
    'grundlegendes Wissen',
    'klassischen Allgemeinbildung',
    'Dies ist eine',
    'Diese Frage behandelt',
    'Diese musikalische Leistung',
    'aus einem Online-Quiz',
    'ist ein wichtiger Begriff',
    'interessanten historischen oder kulturellen',
    'wichtiger Begriff mit interessanten',
    'historischen oder kulturellen Hintergründen',
    'prägte eine ganze Generation',
    'erweitert das Allgemeinwissen',
    'naturwissenschaftlichen Bereichen',
    'bezieht sich auf ein wichtiges',
    'wichtiges Element aus Geschichte',
    'politische Persönlichkeit spielte eine wichtige Rolle',
    'spielte eine wichtige Rolle in der internationalen',
]

# Mixed language detection — German start but English body
MIXED_LANG = re.compile(
    r'(welche.*\b(?:scientific|theory|postulates|subatomic|belief|philosophical|involves|rejection|established)\b|'
    r'was\b.*\b(?:element|theory|compound|scientific|belief|philosophical)\b.*\b(?:comes? from|postulates|involves)\b)',
    re.IGNORECASE
)


def is_english(text: str) -> bool:
    """Check if text_de is actually still in English or mixed language garbage."""
    if not text:
        return True
    # Mixed language (German start, English body)
    if MIXED_LANG.search(text):
        return True
    # If it has German umlauts or starts with German question words, it's German
    if GERMAN_MARKERS.search(text):
        return False
    # If it starts with English patterns
    if ENGLISH_START.match(text):
        return True
    # If it has strong English body patterns and no German markers
    if ENGLISH_BODY.search(text) and not GERMAN_MARKERS.search(text):
        return True
    return False


def is_generic_fun_fact(fun_fact: str) -> bool:
    """Check if fun_fact_de is a generic placeholder."""
    if not fun_fact:
        return False
    return any(pattern in fun_fact for pattern in GENERIC_FUN_FACTS)


def clean_file(input_path: str, output_path: str) -> dict:
    """Clean a single category file. Returns stats."""
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    stats = {
        'total': len(data),
        'removed_english': 0,
        'nulled_fun_fact': 0,
        'kept': 0,
    }

    cleaned = []
    for entry in data:
        text = entry.get('text_de', '')
        fun_fact = entry.get('fun_fact_de', '')

        # Remove English questions entirely
        if is_english(text):
            stats['removed_english'] += 1
            continue

        # Null out generic fun facts (keep the question)
        if is_generic_fun_fact(fun_fact):
            entry['fun_fact_de'] = None
            stats['nulled_fun_fact'] += 1

        cleaned.append(entry)

    stats['kept'] = len(cleaned)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned, f, indent=2, ensure_ascii=False)

    return stats


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 reddit_cleanup.py <input_dir> <output_dir>")
        sys.exit(1)

    input_dir = sys.argv[1]
    output_dir = sys.argv[2]
    os.makedirs(output_dir, exist_ok=True)

    files = sorted(glob.glob(os.path.join(input_dir, '*.json')))
    if not files:
        print(f"No JSON files found in {input_dir}")
        sys.exit(1)

    print(f"{'Category':<25} {'Total':>6} {'English':>8} {'GenericFF':>10} {'Kept':>6}")
    print("-" * 60)

    grand_total = 0
    grand_removed = 0
    grand_nulled = 0
    grand_kept = 0

    for filepath in files:
        filename = os.path.basename(filepath)
        output_path = os.path.join(output_dir, filename)
        stats = clean_file(filepath, output_path)

        cat_name = filename.replace('.json', '')
        print(f"{cat_name:<25} {stats['total']:>6} {stats['removed_english']:>8} {stats['nulled_fun_fact']:>10} {stats['kept']:>6}")

        grand_total += stats['total']
        grand_removed += stats['removed_english']
        grand_nulled += stats['nulled_fun_fact']
        grand_kept += stats['kept']

    print("-" * 60)
    print(f"{'TOTAL':<25} {grand_total:>6} {grand_removed:>8} {grand_nulled:>10} {grand_kept:>6}")
    print()
    print(f"Removed (English):     {grand_removed}")
    print(f"Fun facts nulled:      {grand_nulled}")
    print(f"Final clean questions: {grand_kept}")
    print(f"Output: {output_dir}/")


if __name__ == '__main__':
    main()
