#!/usr/bin/env python3
"""
PubQuizPlanner Pre-Filter
Removes junk questions programmatically before AI translation.
No API calls needed — pure pattern matching.

Usage:
  python3 scripts/prefilter.py                    # filter all categories
  python3 scripts/prefilter.py geography music     # filter specific ones
  python3 scripts/prefilter.py --status            # show counts
"""

import json, re, sys, os
from pathlib import Path

RAW_DIR = Path("data/opentriviaqa")
OUT_DIR = Path("data/pipeline/1-prefiltered")

SKIP_CATEGORIES = {
    "celebrities", "television", "video-games", "religion-faith",
    "for-kids", "brain-teasers", "rated", "newest"
}

# ── Skip patterns ──────────────────────────────────────────────

SKIP_ANSWER = re.compile(r"^(true|false)$", re.I)

SKIP_QUESTION_PATTERNS = [
    # MC-only phrasing
    r"which of the following",
    r"all of the above",
    r"none of the above",
    r"all of these",
    r"both a and b",
    # Medical junk
    r"medical term for",
    r"suffix meaning",
    r"prefix meaning",
    r"medical prefix",
    r"medical suffix",
    r"\b(oophoro|blepharo|bucco|phlebo|hepato|nephro|cholecyst)",
    # Medications
    r"\b(zoloft|ambien|propecia|prozac|valium|xanax|adderall|ritalin)\b",
    # Detailed anatomy
    r"\b(femoral artery|circle of willis|carpals|metacarpals|metatarsals)\b",
    r"\b(integumentary system|lymphatic system|endocrine system)\b",
    # US-specific
    r"\bus time zone",
    r"\bus state (drink|bird|flower|slogan|motto|tree|animal)",
    r"which (us |u\.s\. |american )?state ",
    # Slang / abbreviations
    r"\b(afk|btdt|hand|brb|ttyl|rofl|lmao)\b.*(stand|mean|abbreviat)",
    r"abbreviation for",
    r"internet slang",
    r"text message abbreviat",
    # Pregnancy/childbirth
    r"\b(pregnancy|trimester|prenatal|fetus|gestation|placenta|cesarean|epidural)\b",
    # Definitions
    r"^what (does|is) the (word|term|acronym) ",
]

SKIP_QUESTION_RE = [re.compile(p, re.I) for p in SKIP_QUESTION_PATTERNS]


def should_skip(q):
    """Returns reason string if question should be skipped, else None."""
    # True/False
    if SKIP_ANSWER.match(q["correct_answer"]):
        return "true-false"
    if len(q.get("incorrect_answers", [])) == 1 and q["incorrect_answers"][0] in ("True", "False"):
        return "true-false"

    text = q["question"]

    # Too long
    if len(text) > 350:
        return "too-long"

    # Pattern matching
    for pat in SKIP_QUESTION_RE:
        if pat.search(text):
            return f"pattern"

    return None


def process_category(name):
    src = RAW_DIR / f"{name}.json"
    if not src.exists():
        print(f"  ❌ {name}: file not found")
        return 0, 0

    questions = json.loads(src.read_text())
    kept = []
    reasons = {}

    for q in questions:
        reason = should_skip(q)
        if reason:
            reasons[reason] = reasons.get(reason, 0) + 1
        else:
            kept.append(q)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f"{name}.json"
    out.write_text(json.dumps(kept, indent=2, ensure_ascii=False))

    rejected = len(questions) - len(kept)
    pct = (len(kept) / len(questions) * 100) if questions else 0
    print(f"  ✅ {name}: {len(questions)} → {len(kept)} kept ({pct:.0f}%) | {rejected} rejected")
    if reasons:
        for r, c in sorted(reasons.items(), key=lambda x: -x[1]):
            print(f"      {c}× {r}")

    return len(questions), len(kept)


def show_status():
    print("\n📊 Pre-filter Status\n")
    print(f"  {'Category':<25} {'Raw':>6} {'Filtered':>10} {'Rate':>8}")
    print(f"  {'─'*55}")

    total_raw, total_kept = 0, 0
    for f in sorted(RAW_DIR.glob("*.json")):
        name = f.stem
        if name in SKIP_CATEGORIES:
            continue
        raw = len(json.loads(f.read_text()))
        out = OUT_DIR / f"{name}.json"
        kept = len(json.loads(out.read_text())) if out.exists() else 0
        marker = "✅" if kept > 0 else "  "
        rate = f"{kept/raw*100:.0f}%" if raw else "—"
        print(f"  {marker} {name:<23} {raw:>6} {kept or '—':>10} {rate:>8}")
        total_raw += raw
        total_kept += kept

    print(f"  {'─'*55}")
    rate = f"{total_kept/total_raw*100:.0f}%" if total_raw else "—"
    print(f"    {'TOTAL':<23} {total_raw:>6} {total_kept:>10} {rate:>8}")


if __name__ == "__main__":
    args = sys.argv[1:]

    if "--status" in args:
        show_status()
        sys.exit(0)

    if not args:
        # Process all
        categories = [f.stem for f in sorted(RAW_DIR.glob("*.json")) if f.stem not in SKIP_CATEGORIES]
    else:
        categories = args

    print(f"\n🔧 Pre-filtering {len(categories)} categories\n")
    total_raw, total_kept = 0, 0
    for cat in categories:
        r, k = process_category(cat)
        total_raw += r
        total_kept += k

    print(f"\n  Total: {total_raw} → {total_kept} ({total_kept/total_raw*100:.0f}%)")
    print(f"  Output: {OUT_DIR}/")
