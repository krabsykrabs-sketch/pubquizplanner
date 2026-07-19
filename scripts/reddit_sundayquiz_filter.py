#!/usr/bin/env python3
"""
reddit_sundayquiz_filter.py
Filter parsed Reddit quiz questions for international relevance.

Auto-rejects:
- UK-specific (UK geography, British TV, Premier League, cricket, UK politics)
- Too-obscure questions
- Wordplay/pun-dependent questions

Keeps:
- Internationally relevant questions
- Focus on food/drink and pop culture

Output: data/pipeline/reddit/reddit_filtered.json
"""

import json
import os
import re

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "pipeline", "reddit")
INPUT_PATH = os.path.join(DATA_DIR, "parsed_questions.json")
OUTPUT_PATH = os.path.join(DATA_DIR, "reddit_filtered.json")

# UK-specific terms that signal questions not suitable for international audience
UK_REJECT_PATTERNS = [
    # UK Geography
    r"\b(?:county|counties)\b.*\b(?:england|wales|scotland|ireland)\b",
    r"\b(?:england|wales|scotland|northern ireland|welsh|scottish)\b",
    r"\bbritish\s+(?:city|cities|town|county|counties|isle|isles|village)\b",
    r"\b(?:london borough|m25|a\d{1,4}\s+(?:road|motorway))\b",
    r"\b(?:cotswolds|lake district|peak district|yorkshire|cornwall|devon|sussex|kent|surrey|essex|norfolk|suffolk|dorset|somerset|lancashire|cheshire)\b",
    # British TV
    r"\b(?:eastenders|coronation street|emmerdale|hollyoaks|bake off|strictly come dancing|countdown|gogglebox|love island uk|taskmaster|pointless|the chase|tipping point|only fools and horses|fawlty towers|blackadder)\b",
    r"\bbbc\s+(?:one|two|three|four|iplayer)\b",
    r"\b(?:itv|channel\s*[45]|sky\s+one)\b",
    # UK Sports
    r"\b(?:premier league|championship|league one|league two|fa cup|carabao cup|efl)\b",
    r"\bcricket\b",
    r"\b(?:ashes|test match|county cricket)\b",
    r"\b(?:six nations|rugby union|rugby league)\b",
    r"\b(?:snooker|darts)\b",
    # UK Politics
    r"\b(?:prime minister(?:s)?|tory|tories|labour party|conservative party|lib dem|parliament|westminster|downing street|house of commons|house of lords)\b",
    r"\b(?:nhs|ofsted|gcse|a-levels|a level)\b",
    # UK-specific culture
    r"\b(?:panto|pantomime|bonfire night|guy fawkes|boxing day)\b",
    r"\b(?:pounds? sterling|pence|quid)\b",
]

# Wordplay / pun indicators
WORDPLAY_PATTERNS = [
    r"\bpun\b",
    r"\banagram\b",
    r"\bword(?:play|s?\s+game)\b",
    r"\brhyme\b",
    r"\bspelling\b",
    r"\bletter[s]?\s+(?:of|in)\b",
    r"\bhomophone\b",
    r"\babbreviat",
    r"\brearrange\b",
    r"\bfirst letters?\b",
    r"\binitials?\b.*\bstand\s+for\b",
]

# Obscurity indicators (very specific UK/niche references)
OBSCURE_PATTERNS = [
    r"\b(?:which|what)\s+(?:uk|british)\b",
    r"\b(?:in britain|in the uk|in england)\b",
    r"\bbritish monarch\b",
    r"\bking(?:s)?\s+(?:of england|of britain)\b",
    r"\bqueen(?:s)?\s+(?:of england|of britain)\b",
]


def is_uk_specific(text, answer):
    """Check if question + answer is UK-specific."""
    combined = f"{text} {answer}".lower()
    for pat in UK_REJECT_PATTERNS:
        if re.search(pat, combined, re.IGNORECASE):
            return True
    return False


def is_wordplay(text):
    """Check if question relies on wordplay."""
    text_lower = text.lower()
    for pat in WORDPLAY_PATTERNS:
        if re.search(pat, text_lower):
            return True
    return False


def is_too_obscure(text, answer):
    """Check if question is too obscure for international audience."""
    combined = f"{text} {answer}".lower()
    for pat in OBSCURE_PATTERNS:
        if re.search(pat, combined, re.IGNORECASE):
            return True
    # Very short answers that are likely names of obscure people/places
    if len(answer) < 3 and not answer.isdigit():
        return True
    return False


def is_low_quality(text, answer):
    """Reject questions that are too short or malformed."""
    if len(text) < 15:
        return True
    if len(answer) < 1:
        return True
    if not text.rstrip().endswith("?") and len(text) < 30:
        return True
    return False


def filter_questions():
    with open(INPUT_PATH) as f:
        questions = json.load(f)

    stats = {"total": len(questions), "uk_specific": 0, "wordplay": 0, "obscure": 0, "low_quality": 0, "kept": 0}
    filtered = []

    for q in questions:
        text = q["text_en"]
        answer = q["answer_en"]

        if is_low_quality(text, answer):
            stats["low_quality"] += 1
        elif is_uk_specific(text, answer):
            stats["uk_specific"] += 1
        elif is_wordplay(text):
            stats["wordplay"] += 1
        elif is_too_obscure(text, answer):
            stats["obscure"] += 1
        else:
            filtered.append(q)
            stats["kept"] += 1

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(filtered, f, indent=2, ensure_ascii=False)

    print(f"Filter results:")
    print(f"  Total input:    {stats['total']}")
    print(f"  UK-specific:    -{stats['uk_specific']}")
    print(f"  Wordplay:       -{stats['wordplay']}")
    print(f"  Too obscure:    -{stats['obscure']}")
    print(f"  Low quality:    -{stats['low_quality']}")
    print(f"  Kept:           {stats['kept']}")
    print(f"Output: {OUTPUT_PATH}")
    return filtered


if __name__ == "__main__":
    filter_questions()
