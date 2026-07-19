#!/usr/bin/env python3
"""
jeopardy_tier.py
Second-pass filter: creates high-confidence international subsets
from jeopardy_filter.py output. Separates into tier1 (international/universal)
and tier2 (possibly US-centric, needs more CC screening).

Usage:
    python3 jeopardy_tier.py [--input-dir jeopardy_filtered] [--output-dir jeopardy_tiered]
"""

import json
import re
import sys
import os
from collections import Counter

# ─── Patterns that suggest US-centric content (stricter than first pass) ──────

US_SOFT_PATTERNS = re.compile(r'|'.join([
    # US cultural references
    r'\bthis (?:TV|television) (?:show|series|sitcom|host|chef)\b',
    r'\bthis (?:actress|actor|comedian|singer|rapper)\b',
    r'\bthis (?:man|woman|lady|guy) who\b',
    r'\b(?:CBS|NBC|ABC|PBS|FOX|HBO|CNN)\b',
    r'\b(?:Broadway|Hollywood|Nashville|Vegas)\b',
    r'\bclue crew\b',
    r'\b(?:she|he) (?:won|starred|played|hosted|appeared)\b',
    # US-specific food brands/chains  
    r'\b(?:kraft|campbell|pillsbury|betty crocker|general mills|kellogg|nabisco)\b',
    r'\b(?:starbucks|mcdonald|burger king|subway|kfc|taco bell|domino)\b',
    r'\b(?:heinz|oscar mayer|sara lee|stouffer|swanson)\b',
    # US sports in pop culture
    r'\b(?:quarterback|touchdown|pitcher|batter|home run|innings?|slam dunk)\b',
    r'\b(?:super bowl|world series|stanley cup|march madness)\b',
    # US politics/government in pop culture
    r'\b(?:first lady|white house|oval office|capitol hill)\b',
    r'\b(?:senator|congressman|governor)\b',
    # US geography references
    r'\b(?:manhattan|brooklyn|queens|bronx|staten island)\b',
    r'\b(?:silicon valley|wall street|beverly hills|malibu)\b',
    # American cultural specifics
    r'\b(?:thanksgiving|fourth of july|halloween)\b',
    r'\b(?:prom|homecoming|tailgat)\b',
    r'\b(?:dollar|cent|dime|nickel|quarter)\b.*\b(?:bill|coin)\b',
]), re.IGNORECASE)

# ─── Patterns that suggest INTERNATIONAL/universal content ────────────────────

INTERNATIONAL_BOOST = re.compile(r'|'.join([
    # International cuisine signals
    r'\b(?:french|italian|japanese|chinese|indian|thai|greek|mexican|spanish|german|korean|vietnamese|turkish|moroccan|ethiopian|persian|lebanese|brazilian|indonesian|russian|scandinavian|british|irish|scottish|hungarian|polish|portuguese|austrian|swiss|dutch|belgian|peruvian|argentinian|cuban|middle eastern|mediterranean|asian|european|african|latin american|south american|caribbean|nordic|balkan)\b',
    # International food terms
    r'\b(?:sushi|ramen|dim sum|tapas|paella|risotto|gnocchi|focaccia|croissant|baguette|crepe|souffl|quiche|couscous|hummus|falafel|tzatziki|kimchi|miso|tempura|wasabi|tofu|wonton|gyoza|pierogi|goulash|schnitzel|bratwurst|pretzel|strudel|marzipan|fondue|raclette|ceviche|empanada|churro|baklava|moussaka|naan|tandoori|masala|biryani|samosa|paneer|dal|chutney|injera|tagine|pho|pad thai|satay|rendang|borscht|blini|stroganoff)\b',
    # International drinks
    r'\b(?:champagne|bordeaux|burgundy|chianti|rioja|prosecco|sake|soju|ouzo|raki|grappa|limoncello|absinthe|cognac|armagnac|calvados|pisco|caipirinha|sangria|mezcal|pulque|schnapps|aquavit)\b',
    # Universal food concepts
    r'\b(?:ferment|preserv|pickl|cured|smoked|aged|distill|brew|vineyard|harvest|season|ingredient|spice|herb|recipe|tradition|ancient|century|origin|discover|invent)\b',
    # Awards with international scope
    r'\b(?:cannes|venice|berlin|sundance|bafta|brit award|sanremo|eurovision|nobel|pulitzer|booker|grammy|oscar|golden globe|palme d.or)\b',
    # International pop culture
    r'\b(?:beatles?|rolling stones|queen|abba|u2|madonna|michael jackson|elvis|david bowie|bob marley|adele|ed sheeran|coldplay|radiohead|depeche mode|kraftwerk|daft punk|bjork)\b',
]), re.IGNORECASE)


def tier_entry(entry: dict, category_type: str) -> int:
    """
    Assign tier 1 (international/universal) or 2 (possibly US-centric).
    Returns 1 or 2.
    """
    text = f"{entry['text_en']} {entry['answer_en']}"
    jep_cat = entry.get('jeopardy_category', '')
    combined = f"{text} {jep_cat}"
    
    has_us_signal = bool(US_SOFT_PATTERNS.search(combined))
    has_intl_signal = bool(INTERNATIONAL_BOOST.search(combined))
    
    # If it has international signals and no US signals → tier 1
    if has_intl_signal and not has_us_signal:
        return 1
    
    # If it has US signals → tier 2
    if has_us_signal:
        return 2
    
    # For food: default to tier 1 (food is often universal)
    if category_type == 'essen_trinken':
        return 1
    
    # For pop culture: default to tier 2 (often US-centric)
    if category_type == 'popkultur':
        return 2
    
    return 2


def process_category(input_path: str, output_dir: str, category_type: str):
    """Process one category file into tiers."""
    with open(input_path) as f:
        data = json.load(f)
    
    tier1 = []
    tier2 = []
    
    for entry in data:
        tier = tier_entry(entry, category_type)
        entry['tier'] = tier
        if tier == 1:
            tier1.append(entry)
        else:
            tier2.append(entry)
    
    # Write tier files
    for tier_num, tier_data in [(1, tier1), (2, tier2)]:
        out_path = os.path.join(output_dir, f'jeopardy_{category_type}_tier{tier_num}.json')
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(tier_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n{category_type}:")
    print(f"  Tier 1 (international): {len(tier1):,}")
    print(f"  Tier 2 (needs review):  {len(tier2):,}")
    
    # Show samples
    import random
    random.seed(42)
    print(f"\n  Sample Tier 1:")
    for e in random.sample(tier1, min(5, len(tier1))):
        print(f"    [{e['jeopardy_category']}] {e['text_en']} → {e['answer_en']}")
    print(f"\n  Sample Tier 2:")
    for e in random.sample(tier2, min(5, len(tier2))):
        print(f"    [{e['jeopardy_category']}] {e['text_en']} → {e['answer_en']}")


def main():
    input_dir = 'jeopardy_filtered'
    output_dir = 'jeopardy_tiered'
    
    for i, arg in enumerate(sys.argv[1:]):
        if arg == '--input-dir' and i + 2 < len(sys.argv):
            input_dir = sys.argv[i + 2]
        if arg == '--output-dir' and i + 2 < len(sys.argv):
            output_dir = sys.argv[i + 2]
    
    os.makedirs(output_dir, exist_ok=True)
    
    print("=" * 60)
    print("JEOPARDY TIER CLASSIFICATION")
    print("=" * 60)
    
    for cat in ['essen_trinken', 'popkultur']:
        input_path = os.path.join(input_dir, f'jeopardy_{cat}.json')
        if os.path.exists(input_path):
            process_category(input_path, output_dir, cat)
    
    print("\n" + "=" * 60)
    print("PIPELINE NEXT STEPS:")
    print("  1. Start with tier1 files — highest conversion rate")
    print("  2. CC batch translate (en→de) in batches of ~200")
    print("  3. CC batch QC fact-check")
    print("  4. Import via /admin/import as pending")
    print("  5. Manual approval pass")
    print("  6. Then repeat with tier2 if more questions needed")
    print("=" * 60)


if __name__ == '__main__':
    main()
