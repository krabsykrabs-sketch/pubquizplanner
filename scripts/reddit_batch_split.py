#!/usr/bin/env python3
"""
reddit_batch_split.py
Split filtered Reddit quiz questions into batches for CC translation.
Same pattern as jeopardy_batch_split.py.

Usage:
    python3 reddit_batch_split.py [--batch-size 200]
"""

import json
import math
import os
import sys

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "pipeline", "reddit")
INPUT_PATH = os.path.join(DATA_DIR, "reddit_filtered.json")
OUTPUT_DIR = os.path.join(DATA_DIR, "batches")


def split_batches(batch_size=200):
    with open(INPUT_PATH) as f:
        data = json.load(f)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    num_batches = math.ceil(len(data) / batch_size)
    pad = len(str(num_batches))

    for i in range(num_batches):
        batch = data[i * batch_size : (i + 1) * batch_size]
        batch_file = os.path.join(OUTPUT_DIR, f"batch_{str(i).zfill(pad)}.json")
        with open(batch_file, "w", encoding="utf-8") as f:
            json.dump(batch, f, indent=2, ensure_ascii=False)

    print(f"Split {len(data)} entries into {num_batches} batches of ~{batch_size}")
    print(f"Output: {OUTPUT_DIR}/")
    return num_batches


if __name__ == "__main__":
    batch_size = 200
    for i, arg in enumerate(sys.argv):
        if arg == "--batch-size" and i + 1 < len(sys.argv):
            batch_size = int(sys.argv[i + 1])

    split_batches(batch_size)
