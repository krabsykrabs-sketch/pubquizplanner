#!/usr/bin/env python3
"""
jeopardy_filter.py
Filter Jeopardy! dataset for food/drink and pop culture questions.
Removes US-specific content and outputs JSON ready for CC translation pipeline.

Usage:
    python3 jeopardy_filter.py <input_tsv> [--output-dir <dir>]
"""

import csv
import json
import re
import sys
import os
from collections import Counter

# ─── Category keyword patterns ───────────────────────────────────────────────

FOOD_KEYWORDS = [
    r'\bfood\b', r'\bdrink', r'\bbeverage', r'\bpotable', r'\bcuisine',
    r'\bwine\b', r'\bbeer\b', r'\bcook', r'\bbak(?:e|ing)\b',
    r'\bchocolate', r'\bcheese', r'\bfruit', r'\bspice', r'\bcocktail',
    r'\brestaurant', r'\bkitchen\b', r'\bdessert', r'\bbread\b',
    r'\bcoffee', r'\btea\b', r'\bcandy\b', r'\bsnack', r'\bmeat\b',
    r'\bfish\b', r'\bpasta\b', r'\bpizza', r'\bsushi', r'\bgrill',
    r'\bherbs?\b', r'\bvegetab', r'\bbreakfast', r'\bdinner\b',
    r'\blunch\b', r'\bappetit', r'\bdish\b', r'\bdishes\b', r'\brecipe',
    r'\bchef\b', r'\bgastro', r'\bflavor', r'\btaste\b',
    r'\bsoup\b', r'\bsalad', r'\bsauce', r'\bgrain\b', r'\bcereal',
    r'\bdairy', r'\bolive\b', r'\bsugar', r'\bhoney\b', r'\bpickle',
    r'\bbutter\b', r'\bcream\b', r'\bmilk\b', r'\begg\b', r'\beggs\b',
    r'\bbrunch', r'\bwhiskey', r'\bbourbon', r'\bvodka', r'\brum\b',
    r'\btequila', r'\bchampagne', r'\bscotch\b', r'\bbrandy',
    r'\bgin\b(?! rummy| mill| joint)', r'\bmartini',
    r'\bnuts\b', r'\bpie\b', r'\bpies\b', r'\bice cream',
    r'\bbarbecue', r'\bbbq\b', r'\bdeli\b', r'\bsausage', r'\bsteak',
    r'\bchicken\b', r'\bpork\b', r'\blamb\b',
    r'\bvegan', r'\borganic\b', r'\bfast food', r'\bjunk food',
    r'\bcomfort food', r'\bworld cuisine', r'\binternational food',
    r'\bcondiment', r'\bvinegar', r'\bmushroom', r'\btruffle',
    r'\boyster', r'\blobster', r'\bshrimp', r'\bcrab\b',
    r'\bnoodle', r'\brice\b', r'\bcurry', r'\bchili\b', r'\bpepper',
    r'\bgarlic', r'\bonion\b', r'\btomato', r'\bpotato', r'\bcarrot',
    r'\blemon\b', r'\bapple\b', r'\bapples\b',
    r'\bbanana', r'\bgrape\b', r'\bgrapes\b', r'\bberry\b', r'\bberries\b',
    r'\bmelon\b', r'\bmango\b', r'\bavocado',
]

# Categories to explicitly EXCLUDE even if keywords match
FOOD_CATEGORY_BLACKLIST = re.compile(
    r'big apple|peanuts\b(?!.*butter)|the onion\b|animal.{0,5}vegetable|'
    r'scrabble|rotten tomato|let.*begin|games begin|minute',
    re.IGNORECASE
)

POPKULTUR_KEYWORDS = [
    r'pop culture', r'pop music', r'celebrity', r'celebrities', r'reality tv',
    r'reality show', r'viral', r'social media', r'meme', r'instagram',
    r'tiktok', r'youtube', r'influencer', r'trending', r'tabloid', r'gossip',
    r'paparazz', r'red carpet', r'grammy', r'oscar', r'emmy', r'tony award',
    r'golden globe', r'billboard', r'mtv', r'award show', r'entertainment',
    r'box office', r'blockbuster', r'hit song', r'number.?one hit',
    r'chart.?topp', r'best.?sell', r'superstar', r'megastar', r'fame',
    r'famous', r'idol', r'fan\b', r'fandom', r'super bowl halftime',
    r'fashion', r'trend', r'zeitgeist', r'icon', r'iconic',
    r'platinum', r'gold record', r'debut album',
]

# ─── US-specific rejection patterns ──────────────────────────────────────────

US_STATES = [
    'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado',
    'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho',
    'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana',
    'maine', 'maryland', 'massachusetts', 'michigan', 'minnesota',
    'mississippi', 'missouri', 'montana', 'nebraska', 'nevada',
    'new hampshire', 'new jersey', 'new mexico', 'new york', 'north carolina',
    'north dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania',
    'rhode island', 'south carolina', 'south dakota', 'tennessee', 'texas',
    'utah', 'vermont', 'virginia', 'washington', 'west virginia',
    'wisconsin', 'wyoming',
]

US_REJECT_PATTERNS = [
    # US states (allow "New York" in certain universal contexts)
    r'\b(?:' + '|'.join(re.escape(s) for s in US_STATES if s not in ['new york', 'california', 'texas']) + r')\b',
    # US-specific references
    r'\bthis (?:u\.?s\.?|american)\b',
    r'\bamerican (?:president|general|senator|congressman|governor|city|state|league|football|baseball)\b',
    r'\b(?:nfl|nba|mlb|nhl|nascar|ncaa|super bowl|world series|stanley cup)\b',
    r'\b(?:walmart|target|costco|kroger|safeway|publix|trader joe\'?s|whole foods)\b',
    r'\b(?:u\.?s\.? (?:state|president|senator|city|highway|interstate|constitution|congress))\b',
    r'\b(?:fourth of july|thanksgiving|memorial day|labor day|independence day)\b',
    r'\b(?:republican|democrat|gop|dnc|rnc)\b',
    r'\b(?:fda|epa|fbi|cia|dea|atf|usda|fcc|sec|irs)\b',
    # US fast food / brands that are too US-centric
    r'\b(?:wendy\'?s|arby\'?s|chick-?fil-?a|in-?n-?out|waffle house|denny\'?s|ihop|applebee\'?s|olive garden|red lobster|outback steakhouse|cracker barrel|sonic drive|jack in the box|carl\'?s jr|hardee\'?s|white castle|five guys|chipotle|panera|dunkin)\b',
    # US-specific food references
    r'\b(?:girl scout cookie|county fair|state fair)\b',
    # American sports figures in food context
    r'\b(?:tailgat|homecoming)\b',
]

# Compile patterns
FOOD_PATTERN = re.compile('|'.join(FOOD_KEYWORDS), re.IGNORECASE)
POP_PATTERN = re.compile('|'.join(POPKULTUR_KEYWORDS), re.IGNORECASE)
US_REJECT_PATTERN = re.compile('|'.join(US_REJECT_PATTERNS), re.IGNORECASE)

# ─── Additional quality filters ──────────────────────────────────────────────

def is_us_specific(clue_text: str, answer_text: str) -> bool:
    """Check if a clue is too US-specific for a German pub quiz."""
    combined = f"{clue_text} {answer_text}"
    return bool(US_REJECT_PATTERN.search(combined))


def is_too_obscure(clue_text: str, answer_text: str) -> bool:
    """Reject clues that are likely too obscure or niche for a German audience."""
    combined = f"{clue_text} {answer_text}".lower()
    obscure_patterns = [
        r'\bthis tv (?:chef|host|show)\b',  # US TV chefs mostly unknown in DE
        r'\bon "(?:the )?\w+ show"',  # specific US TV show references
        r'\bfood network\b',
        r'\bthis (?:sitcom|soap opera)\b',
        r'\bsnl\b',
        r'\bjeopardy\b',
    ]
    for pat in obscure_patterns:
        if re.search(pat, combined, re.IGNORECASE):
            return True
    return False


def is_wordplay_dependent(clue_text: str) -> bool:
    """Reject clues that depend on English wordplay/puns — untranslatable."""
    wordplay_signals = [
        r'\brhymes with\b',
        r'\bsounds like\b',
        r'\bletter[s]?\b.*\bword\b',
        r'\banagram\b',
        r'\bstarts with\b.*\bletter\b',
        r'\bends with\b.*\bletter\b',
        r'\bspell(?:ed|ing)?\b',
        r'"[^"]+"\s*&\s*"[^"]+"',  # quoted word pairs often = pun categories
        r'\bpun\b',
        r'\bhomophone\b',
        r'\b[A-Z]"s\b',  # "B"s, "C"s etc — letter-themed categories
    ]
    for pat in wordplay_signals:
        if re.search(pat, clue_text, re.IGNORECASE):
            return True
    return False


def is_image_audio_dependent(clue_text: str, category: str) -> bool:
    """Reject clues that seem to reference visual/audio content."""
    signals = [
        r'\b(?:seen here|shown here|pictured here)\b',
        r'\b(?:this picture|this photo|this image|this map)\b',
        r'\b(?:listen|hear|audio|sound|clip)\b',
        r'\b(?:video clue)\b',
    ]
    for pat in signals:
        if re.search(pat, clue_text, re.IGNORECASE):
            return True
    return False


# ─── Main filter logic ────────────────────────────────────────────────────────

def categorize_clue(category: str) -> list[str]:
    """Return list of matching PQP categories for this Jeopardy category."""
    matches = []
    if FOOD_PATTERN.search(category) and not FOOD_CATEGORY_BLACKLIST.search(category):
        matches.append('essen_trinken')
    if POP_PATTERN.search(category):
        matches.append('popkultur')
    return matches


def convert_jeopardy_to_question(clue_text: str) -> str:
    """
    Light cleanup of Jeopardy clue format.
    Full conversion to German question format happens in CC translation step.
    """
    # Remove escaped quotes
    text = clue_text.replace('\\"', '"').replace("\\'", "'")
    # Remove leading "This" / "These" if it starts a definition-style clue
    # (CC will handle full reformatting during translation)
    return text.strip()


def process_dataset(input_path: str, output_dir: str):
    """Main processing function."""
    os.makedirs(output_dir, exist_ok=True)

    results = {
        'essen_trinken': [],
        'popkultur': [],
    }

    stats = {
        'total_rows': 0,
        'food_matched': 0,
        'pop_matched': 0,
        'rejected_final_jeopardy': 0,
        'rejected_us_specific': 0,
        'rejected_obscure': 0,
        'rejected_wordplay': 0,
        'rejected_image_audio': 0,
        'rejected_too_short': 0,
        'accepted_food': 0,
        'accepted_pop': 0,
    }

    rejection_examples = {
        'us_specific': [],
        'obscure': [],
        'wordplay': [],
    }

    with open(input_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter='\t')

        for row in reader:
            stats['total_rows'] += 1

            category = row.get('category', '')
            clue = row.get('answer', '')      # Jeopardy "answer" = the clue/prompt
            answer = row.get('question', '')   # Jeopardy "question" = correct response
            round_num = row.get('round', '')
            air_date = row.get('air_date', '')
            clue_value = row.get('clue_value', '')

            # Skip Final Jeopardy (often multi-part / convoluted)
            if round_num == '3':
                stats['rejected_final_jeopardy'] += 1
                continue

            # Match categories
            matches = categorize_clue(category)
            if not matches:
                continue

            if 'essen_trinken' in matches:
                stats['food_matched'] += 1
            if 'popkultur' in matches:
                stats['pop_matched'] += 1

            # Quality filters
            if is_image_audio_dependent(clue, category):
                stats['rejected_image_audio'] += 1
                continue

            if is_wordplay_dependent(clue) or is_wordplay_dependent(category):
                stats['rejected_wordplay'] += 1
                if len(rejection_examples['wordplay']) < 5:
                    rejection_examples['wordplay'].append(f"[{category}] {clue} → {answer}")
                continue

            if is_us_specific(clue, answer):
                stats['rejected_us_specific'] += 1
                if len(rejection_examples['us_specific']) < 5:
                    rejection_examples['us_specific'].append(f"[{category}] {clue} → {answer}")
                continue

            if is_too_obscure(clue, answer):
                stats['rejected_obscure'] += 1
                if len(rejection_examples['obscure']) < 5:
                    rejection_examples['obscure'].append(f"[{category}] {clue} → {answer}")
                continue

            # Skip very short answers (likely abbreviations or too terse)
            if len(answer.strip()) < 2:
                stats['rejected_too_short'] += 1
                continue

            # Build output entry
            entry = {
                'text_en': convert_jeopardy_to_question(clue),
                'answer_en': answer.strip(),
                'source': f"Jeopardy {air_date}",
                'jeopardy_category': category,
                'jeopardy_value': clue_value,
                'jeopardy_round': round_num,
            }

            for cat in matches:
                results[cat].append(entry)
                if cat == 'essen_trinken':
                    stats['accepted_food'] += 1
                else:
                    stats['accepted_pop'] += 1

    # Deduplicate by clue text
    for cat in results:
        seen = set()
        deduped = []
        for entry in results[cat]:
            key = entry['text_en'].lower().strip()
            if key not in seen:
                seen.add(key)
                deduped.append(entry)
        original = len(results[cat])
        results[cat] = deduped
        print(f"  {cat}: deduplicated {original} → {len(deduped)} ({original - len(deduped)} dupes)")

    # Write outputs
    for cat, entries in results.items():
        out_path = os.path.join(output_dir, f'jeopardy_{cat}.json')
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(entries, f, indent=2, ensure_ascii=False)
        print(f"  → Wrote {len(entries)} entries to {out_path}")

    # Write stats
    stats_path = os.path.join(output_dir, 'jeopardy_filter_stats.json')
    with open(stats_path, 'w', encoding='utf-8') as f:
        json.dump({
            'stats': stats,
            'rejection_examples': rejection_examples,
        }, f, indent=2, ensure_ascii=False)
    print(f"  → Stats written to {stats_path}")

    # Print summary
    print("\n" + "=" * 60)
    print("JEOPARDY FILTER SUMMARY")
    print("=" * 60)
    print(f"Total rows scanned:      {stats['total_rows']:,}")
    print(f"Food/drink matched:      {stats['food_matched']:,}")
    print(f"Pop culture matched:     {stats['pop_matched']:,}")
    print(f"")
    print(f"Rejected - Final Jeop:   {stats['rejected_final_jeopardy']:,}")
    print(f"Rejected - US-specific:  {stats['rejected_us_specific']:,}")
    print(f"Rejected - Obscure:      {stats['rejected_obscure']:,}")
    print(f"Rejected - Wordplay:     {stats['rejected_wordplay']:,}")
    print(f"Rejected - Image/Audio:  {stats['rejected_image_audio']:,}")
    print(f"Rejected - Too short:    {stats['rejected_too_short']:,}")
    print(f"")
    print(f"ACCEPTED Essen & Trinken: {len(results['essen_trinken']):,}")
    print(f"ACCEPTED Popkultur:       {len(results['popkultur']):,}")
    print("=" * 60)

    # Show rejection examples
    for reason, examples in rejection_examples.items():
        if examples:
            print(f"\nSample {reason} rejections:")
            for ex in examples[:3]:
                print(f"  ✗ {ex}")


if __name__ == '__main__':
    input_file = sys.argv[1] if len(sys.argv) > 1 else 'combined_season1-41.tsv'
    output_dir = sys.argv[2] if len(sys.argv) > 2 else 'jeopardy_filtered'

    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found")
        sys.exit(1)

    print(f"Processing {input_file}...")
    process_dataset(input_file, output_dir)
