#!/usr/bin/env python3
"""
reddit_sundayquiz_parser.py
Parse Q&A pairs from u/sundayquiz raw Reddit posts.

Handles common formats:
- Numbered questions (1. / 1) / Q1:) with answers in a separate section
- Spoiler-tagged answers (>!answer!<)
- "Answers" heading followed by numbered answers

Output: data/pipeline/reddit/parsed_questions.json
"""

import json
import os
import re
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "pipeline", "reddit")
INPUT_PATH = os.path.join(DATA_DIR, "raw_posts.json")
OUTPUT_PATH = os.path.join(DATA_DIR, "parsed_questions.json")


def extract_category_from_title(title):
    """Try to extract a theme/category from the post title."""
    title_lower = title.lower()
    # Common patterns: "Sunday Quiz: Topic", "Topic Quiz", "Quiz #123 - Topic"
    patterns = [
        r"sunday quiz[:\s-]+(.+?)(?:\s*#?\d+|\s*$)",
        r"quiz[:\s#]+\d+[:\s-]+(.+)",
        r"^(.+?)\s+quiz",
        r"quiz[:\s-]+(.+)",
    ]
    for pat in patterns:
        m = re.search(pat, title_lower)
        if m:
            cat = m.group(1).strip(" -–—:,.")
            if cat and len(cat) > 2 and len(cat) < 60:
                return cat.title()
    return None


def clean_spoiler(text):
    """Remove Reddit spoiler tags >!...!< and strip trailing # characters"""
    cleaned = re.sub(r">!(.+?)!<", r"\1", text).strip()
    # Strip trailing # characters from Reddit spoiler formatting
    cleaned = re.sub(r"#+$", "", cleaned).strip()
    return cleaned


def parse_post(post):
    """Extract Q&A pairs from a single post."""
    body = post.get("selftext", "")
    title = post.get("title", "")
    created = datetime.utcfromtimestamp(post.get("created_utc", 0)).strftime("%Y-%m-%d")
    subreddit = post.get("subreddit", "trivia")

    if not body or len(body) < 50:
        return []

    # Skip answer-only posts, link posts
    title_lower = title.lower()
    if re.match(r"^answers?\s", title_lower) and "question" not in title_lower:
        return []

    body = body.replace("\r\n", "\n").replace("\r", "\n")

    # Strategy 1: Questions and answers in separate sections
    # Split on "Answers" heading
    answers_split = re.split(
        r"\n\s*\**\s*answers?\s*:?\s*\**\s*\n", body, flags=re.IGNORECASE
    )

    questions_text = answers_split[0] if len(answers_split) >= 2 else body
    answers_text = answers_split[1] if len(answers_split) >= 2 else None

    # Extract numbered questions
    q_pattern = r"(?:^|\n)\s*(?:Q?\s*)?(\d{1,2})\s*[.):\-]\s*(.+?)(?=\n\s*(?:Q?\s*)?\d{1,2}\s*[.):\-]|\n\s*\**\s*answers?|\Z)"
    q_matches = re.findall(q_pattern, questions_text, re.DOTALL | re.IGNORECASE)

    if not q_matches:
        # Try simpler line-by-line numbered pattern
        q_matches = []
        for line in questions_text.split("\n"):
            m = re.match(r"\s*(?:Q?\s*)?(\d{1,2})\s*[.):\-]\s*(.+)", line.strip())
            if m:
                q_matches.append((m.group(1), m.group(2).strip()))

    if not q_matches:
        return []

    # Extract answers
    answers = {}
    if answers_text:
        # Numbered answers in answers section
        a_matches = re.findall(
            r"(?:^|\n)\s*(?:A?\s*)?(\d{1,2})\s*[.):\-]\s*(.+?)(?=\n|$)",
            answers_text,
        )
        for num, ans in a_matches:
            answers[int(num)] = clean_spoiler(ans.strip())

    # If no separate answers section, look for inline spoiler answers
    if not answers:
        for line in body.split("\n"):
            m = re.match(
                r"\s*(?:Q?\s*)?(\d{1,2})\s*[.):\-]\s*.+?>!(.+?)!<", line.strip()
            )
            if m:
                answers[int(m.group(1))] = m.group(2).strip()

    if not answers:
        return []

    category = extract_category_from_title(title)
    source = f"r/{subreddit} - {title} ({created})"
    results = []

    for num_str, q_text in q_matches:
        num = int(num_str)
        q_text = clean_spoiler(q_text.strip())
        # Clean up question text
        q_text = re.sub(r"\s+", " ", q_text).strip()
        if num in answers and len(q_text) > 10:
            results.append(
                {
                    "text_en": q_text,
                    "answer_en": answers[num],
                    "source": source,
                    "reddit_category": category,
                }
            )

    return results


def parse_all():
    with open(INPUT_PATH) as f:
        posts = json.load(f)

    all_questions = []
    posts_with_qa = 0
    seen_questions = set()  # For deduplication by text_en

    for post in posts:
        qa_pairs = parse_post(post)
        if qa_pairs:
            posts_with_qa += 1
            # Deduplicate by text_en during parsing
            for qa in qa_pairs:
                text_key = qa["text_en"].strip().lower()
                if text_key not in seen_questions:
                    seen_questions.add(text_key)
                    all_questions.append(qa)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, indent=2, ensure_ascii=False)

    total_before_dedup = sum(len(parse_post(post)) for post in posts)
    duplicates_removed = total_before_dedup - len(all_questions)

    print(f"Parsed {len(posts)} posts")
    print(f"Posts with Q&A: {posts_with_qa}")
    print(f"Total questions before deduplication: {total_before_dedup}")
    print(f"Duplicates removed: {duplicates_removed}")
    print(f"Unique questions extracted: {len(all_questions)}")
    print(f"Output: {OUTPUT_PATH}")
    return all_questions


if __name__ == "__main__":
    parse_all()
