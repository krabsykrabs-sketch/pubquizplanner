#!/usr/bin/env python3
"""
jeopardy_batch_split.py
Split tiered Jeopardy JSON into batches for CC translation.

Usage:
    python3 jeopardy_batch_split.py jeopardy_tiered/jeopardy_essen_trinken_tier1.json --batch-size 200
    python3 jeopardy_batch_split.py jeopardy_tiered/jeopardy_popkultur_tier1.json --batch-size 200
"""

import json
import sys
import os
import math


def split_batches(input_path: str, batch_size: int = 200):
    with open(input_path) as f:
        data = json.load(f)

    basename = os.path.splitext(os.path.basename(input_path))[0]
    output_dir = os.path.join(os.path.dirname(input_path), f'{basename}_batches')
    os.makedirs(output_dir, exist_ok=True)

    num_batches = math.ceil(len(data) / batch_size)
    pad = len(str(num_batches))

    for i in range(num_batches):
        batch = data[i * batch_size : (i + 1) * batch_size]
        batch_file = os.path.join(output_dir, f'batch_{str(i).zfill(pad)}.json')
        with open(batch_file, 'w', encoding='utf-8') as f:
            json.dump(batch, f, indent=2, ensure_ascii=False)

    print(f"Split {len(data)} entries into {num_batches} batches of ~{batch_size}")
    print(f"Output: {output_dir}/")
    return output_dir, num_batches


if __name__ == '__main__':
    input_path = sys.argv[1]
    batch_size = 200
    for i, arg in enumerate(sys.argv):
        if arg == '--batch-size' and i + 1 < len(sys.argv):
            batch_size = int(sys.argv[i + 1])

    split_batches(input_path, batch_size)
