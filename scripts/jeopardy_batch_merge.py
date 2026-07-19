#!/usr/bin/env python3
"""
jeopardy_batch_merge.py
Merge CC-processed batch outputs into a single JSON file.

Usage:
    python3 jeopardy_batch_merge.py <batches_dir> <output_file>

Example:
    python3 jeopardy_batch_merge.py jeopardy_tiered/jeopardy_essen_trinken_tier1_batches/ jeopardy_essen_trinken_final.json

Expects each batch file to contain a JSON array of approved questions.
Handles: bare JSON arrays, markdown-wrapped JSON, files with BOM, empty files.
"""

import json
import sys
import os
import glob
import re


def extract_json_array(text: str) -> list:
    """Extract JSON array from text that might have markdown wrappers."""
    text = text.strip()
    # Remove BOM
    if text.startswith('\ufeff'):
        text = text[1:]
    # Remove markdown code fences
    text = re.sub(r'^```(?:json)?\s*\n?', '', text)
    text = re.sub(r'\n?```\s*$', '', text)
    text = text.strip()

    if not text or text == '[]':
        return []

    try:
        data = json.loads(text)
        if isinstance(data, list):
            return data
        return []
    except json.JSONDecodeError as e:
        print(f"  WARNING: JSON parse error: {e}")
        return []


def merge_batches(batches_dir: str, output_file: str):
    """Merge all batch output files."""
    # Find processed files (CC output files, not input batches)
    # Convention: CC writes output to same filename or with _output suffix
    patterns = [
        os.path.join(batches_dir, 'batch_*_output.json'),
        os.path.join(batches_dir, 'batch_*.json'),
    ]

    files = []
    for pattern in patterns:
        files.extend(sorted(glob.glob(pattern)))

    # Deduplicate (prefer _output files)
    seen_bases = set()
    final_files = []
    for f in files:
        base = re.sub(r'_output\.json$', '.json', f)
        if base not in seen_bases:
            seen_bases.add(base)
            final_files.append(f)

    if not final_files:
        print(f"No batch files found in {batches_dir}")
        sys.exit(1)

    all_questions = []
    stats = {'files': 0, 'questions': 0, 'empty': 0, 'errors': 0}

    for filepath in sorted(final_files):
        filename = os.path.basename(filepath)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        questions = extract_json_array(content)
        stats['files'] += 1

        if not questions:
            stats['empty'] += 1
            print(f"  {filename}: empty or no valid questions")
        else:
            stats['questions'] += len(questions)
            all_questions.extend(questions)
            print(f"  {filename}: {len(questions)} questions")

    # Deduplicate by text_de
    seen = set()
    deduped = []
    for q in all_questions:
        key = q.get('text_de', '').lower().strip()
        if key and key not in seen:
            seen.add(key)
            deduped.append(q)

    dupes = len(all_questions) - len(deduped)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(deduped, f, indent=2, ensure_ascii=False)

    print(f"\n{'=' * 50}")
    print(f"MERGE COMPLETE")
    print(f"  Files processed:  {stats['files']}")
    print(f"  Empty/error:      {stats['empty']}")
    print(f"  Total questions:  {stats['questions']}")
    print(f"  After dedup:      {len(deduped)} ({dupes} duplicates removed)")
    print(f"  Output:           {output_file}")
    print(f"{'=' * 50}")


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python3 jeopardy_batch_merge.py <batches_dir> <output_file>")
        sys.exit(1)

    merge_batches(sys.argv[1], sys.argv[2])
