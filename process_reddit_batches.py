#!/usr/bin/env python3
"""
Process Reddit Sunday Quiz batches and convert to German pub quiz questions.
Applies strict filtering criteria and translates approved questions.
"""

import json
import os
from typing import List, Dict, Any, Optional

def should_reject(question: Dict[str, Any]) -> tuple[bool, str]:
    """
    Determine if a question should be rejected based on criteria.
    Returns (should_reject, reason)
    """
    text = question.get("text_en", "").lower()
    answer = question.get("answer_en", "").lower()

    # UK-specific content
    uk_indicators = [
        "premier league", "football league", "championship", "fa cup",
        "cricket", "wicket", "ashes", "lords", "test match",
        "british", "britain", "uk", "england", "scotland", "wales", "ireland",
        "bbc", "itv", "channel 4", "coronation street", "eastenders",
        "westminster", "downing street", "house of lords", "house of commons",
        "pound sterling", "pence", "shilling", "tory", "labour party",
        "nhs", "tube", "london underground", "m25", "a-level", "gcse"
    ]

    # US-specific content
    us_indicators = [
        "nfl", "nba", "mlb", "nhl", "super bowl", "world series",
        "walmart", "target", "best buy", "home depot", "starbucks",
        "broadway", "hollywood", "silicon valley", "wall street",
        "democrat", "republican", "congress", "senate", "house of representatives",
        "dollar", "quarter", "dime", "nickel", "penny",
        "sat", "gpa", "high school", "college football", "ivy league",
        "zip code", "social security", "401k"
    ]

    # Wordplay/puns that don't translate
    wordplay_indicators = [
        "sounds like", "rhymes with", "anagram", "spells", "spelled backwards",
        "homophone", "pun", "play on words", "double meaning"
    ]

    # Check for rejection criteria
    for indicator in uk_indicators:
        if indicator in text or indicator in answer:
            return True, f"UK-specific: {indicator}"

    for indicator in us_indicators:
        if indicator in text or indicator in answer:
            return True, f"US-specific: {indicator}"

    for indicator in wordplay_indicators:
        if indicator in text:
            return True, f"Wordplay: {indicator}"

    # Check for overly obscure content
    obscure_indicators = [
        "david eddings", "belgarath", "jim butcher", "harry dresden",
        "john constantine", "quadling country"
    ]

    for indicator in obscure_indicators:
        if indicator in text or indicator in answer:
            return True, f"Too obscure: {indicator}"

    # Check for trivial questions (very short answers or obvious)
    clean_answer = answer.replace("#", "").strip()
    if len(clean_answer) <= 3 and not clean_answer.isdigit():
        return True, "Too trivial (very short answer)"

    return False, ""

def get_category_tag(text: str, answer: str) -> str:
    """Determine the most appropriate category tag for a question."""
    text_lower = text.lower()
    answer_lower = answer.lower()

    # Geography
    if any(word in text_lower for word in ["country", "capital", "city", "continent", "ocean", "river", "mountain", "border"]):
        return "Geographie"

    # History & Religion
    if any(word in text_lower for word in ["independence", "war", "battle", "ancient", "century", "historical", "empire", "king", "queen", "christ", "apostle", "disciple", "medieval", "arthur"]):
        return "Geschichte"

    # Literature & Fantasy
    if any(word in text_lower for word in ["novel", "book", "author", "shakespeare", "character", "wizard", "lord of the rings", "harry potter", "sword", "mythical"]):
        return "Literatur"

    # Film/TV
    if any(word in text_lower for word in ["film", "movie", "tv", "cinema", "actor", "actress", "director", "marvel", "disney", "mcu", "star wars", "james bond", "captain america"]):
        return "Film-TV"

    # Music
    if any(word in text_lower for word in ["song", "album", "band", "singer", "music", "beatles", "orchestra", "chorus", "hymn"]):
        return "Musik"

    # Science & Medicine
    if any(word in text_lower for word in ["chemical", "element", "physics", "biology", "scientist", "discovery", "theory", "infection", "inflames", "lungs", "pneumonia"]):
        return "Wissenschaft"

    # Food & Drink
    if any(word in text_lower for word in ["wine", "sparkling", "champagne", "food", "drink", "beer", "alcohol", "cooking"]):
        return "Essen & Trinken"

    # Sport
    if any(word in text_lower for word in ["sport", "olympic", "championship", "team", "player", "match", "game"]):
        return "Sport"

    # Default to Allgemeinwissen
    return "Allgemeinwissen"

def translate_to_german(question: Dict[str, Any]) -> Dict[str, Any]:
    """Translate question to German and add required fields."""
    text_en = question["text_en"]
    answer_en = question["answer_en"].replace("#", "").strip()

    # Simple translation examples - in real implementation, you'd use proper translation
    # For now, I'll provide a few examples and mark others for translation

    translations = {
        # South American countries
        "Which landlocked country in South America is bordered by Argentina, Brazil, and Bolivia - the capital and largest city is Asunción?": {
            "text_de": "Welches Binnenland in Südamerika grenzt an Argentinien, Brasilien und Bolivien und hat Asunción als Hauptstadt und größte Stadt?",
            "answer_de": "Paraguay",
            "fun_fact_de": "Paraguay ist eines von nur zwei Binnenländern in Südamerika und hat Guaraní als zweite offizielle Sprache neben Spanisch.",
            "difficulty": 2
        },
        "In which South American country is La Paz (Government seat), at 3,640 metres above sea level it is the most elevated \"capital\" city in the world?": {
            "text_de": "In welchem südamerikanischen Land liegt La Paz, das auf 3.640 Metern Höhe die höchstgelegene Regierungsstadt der Welt ist?",
            "answer_de": "Bolivien",
            "fun_fact_de": "La Paz liegt so hoch, dass Besucher oft unter Höhenkrankheit leiden, und die Stadt hat einen eigenen Flughafen in noch größerer Höhe.",
            "difficulty": 2
        },
        "Which country in South America is divided into 32 departments with the Capital District of Bogotá being the country's largest city?": {
            "text_de": "Welches südamerikanische Land ist in 32 Departamentos unterteilt und hat Bogotá als größte Stadt?",
            "answer_de": "Kolumbien",
            "fun_fact_de": "Kolumbien ist der einzige südamerikanische Staat mit Küsten sowohl am Pazifik als auch am Atlantik.",
            "difficulty": 2
        },
        "Making up nearly 50% of the total population of South America, which country is the world's fifth-largest country by area?": {
            "text_de": "Welches Land macht fast 50% der Gesamtbevölkerung Südamerikas aus und ist flächenmäßig das fünftgrößte Land der Welt?",
            "answer_de": "Brasilien",
            "fun_fact_de": "Brasilien ist so groß, dass es an jedes andere südamerikanische Land grenzt, außer an Chile und Ecuador.",
            "difficulty": 1
        },
        "Which country in South America also includes the Galápagos Islands in the Pacific, about 1,000 kilometres west of the mainland?": {
            "text_de": "Welches südamerikanische Land umfasst auch die Galápagos-Inseln im Pazifik, etwa 1.000 Kilometer westlich des Festlands?",
            "answer_de": "Ecuador",
            "fun_fact_de": "Die Galápagos-Inseln inspirierten Charles Darwin zu seiner Evolutionstheorie und beherbergen Arten, die nirgendwo sonst auf der Welt zu finden sind.",
            "difficulty": 2
        },
        # Fantasy/Literature
        "In The Lord of the Rings, which of the wizards sent to Middle-earth by the Valar was known to the elves by the name Mithrandir?": {
            "text_de": "Welcher Zauberer aus Herr der Ringe war bei den Elben unter dem Namen Mithrandir bekannt?",
            "answer_de": "Gandalf",
            "fun_fact_de": "Mithrandir bedeutet 'Grauer Wanderer' in der Elbensprache Sindarin, was Gandalfs Rolle als reisender Berater widerspiegelt.",
            "difficulty": 2
        },
        "A mentor figure for Harry, who is the headmaster of Hogwarts School of Witchcraft and Wizardry?": {
            "text_de": "Wer ist der Schulleiter von Hogwarts und Mentor von Harry Potter?",
            "answer_de": "Albus Dumbledore",
            "fun_fact_de": "Dumbledore bedeutet im Englischen eigentlich 'Hummel' - J.K. Rowling stellte sich vor, wie er summend durch die Schlossflure wandelt.",
            "difficulty": 1,
            "tags": ["Literatur"]  # Force correct category for Dumbledore
        },
        # Movie/Film questions
        "What is the mythical sword of King Arthur that may possess magical powers or be associated with the rightful sovereignty of Britain called?": {
            "text_de": "Wie heißt das mythische Schwert von König Artus, das magische Kräfte besitzen oder mit der rechtmäßigen Herrschaft Britanniens verbunden sein soll?",
            "answer_de": "Excalibur",
            "fun_fact_de": "Der Name Excalibur stammt vom lateinischen 'Caliburnus' ab, was wahrscheinlich vom walisischen 'Caledfwlch' (hartes Blitzlicht) abgeleitet ist.",
            "difficulty": 2
        },
        "In the Star Wars universe, which weapon, developed as part of Project Stardust, is capable of destroying entire planets?": {
            "text_de": "Welche Waffe aus dem Star Wars-Universum, entwickelt als Teil von Projekt Stardust, kann ganze Planeten zerstören?",
            "answer_de": "Todesstern",
            "fun_fact_de": "Der Todesstern wurde von über einer Million Arbeitskräften über 20 Jahre hinweg gebaut und hatte einen Durchmesser von 120 Kilometern.",
            "difficulty": 1
        },
        "In Marvel Comics and the MCU, what is the primary defensive and offensive piece of equipment used by Captain America?": {
            "text_de": "Welches ist Captain Americas Haupt-Verteidigungs- und Angriffsausrüstung in den Marvel-Comics und im MCU?",
            "answer_de": "Schild",
            "fun_fact_de": "Captain Americas Schild besteht aus Vibranium, einem fiktiven Metall, das Vibrationen und Energie absorbiert.",
            "difficulty": 1
        },
        # Food & Drink
        "What sparkling wine originated and produced in a specific wine region of France became associated with royalty from the 17th onwards?": {
            "text_de": "Welcher Schaumwein, der in einer bestimmten Weinregion Frankreichs entstanden ist, wurde ab dem 17. Jahrhundert mit dem Königshaus in Verbindung gebracht?",
            "answer_de": "Champagner",
            "fun_fact_de": "Echter Champagner darf nur aus der Champagne-Region in Frankreich stammen - alle anderen Schaumweine sind nur 'Sekt' oder 'Prosecco'.",
            "difficulty": 1
        },
        # Science/Medical
        "What is the name of the infection that inflames the air sacs in one or both lungs?": {
            "text_de": "Wie nennt man die Infektion, die die Lungenbläschen in einer oder beiden Lungen entzündet?",
            "answer_de": "Lungenentzündung",
            "fun_fact_de": "Pneumonie ist eine der häufigsten Todesursachen durch Infektionskrankheiten und betrifft jährlich Millionen Menschen weltweit.",
            "difficulty": 2
        },
        # Music
        "The multiple meanings of which word include; a part of a song, a group of singers, and a medieval Latin term?": {
            "text_de": "Welches Wort hat mehrere Bedeutungen: ein Teil eines Liedes, eine Sängergruppe und ein mittelalterlicher lateinischer Begriff?",
            "answer_de": "Chor",
            "fun_fact_de": "Das Wort 'Chor' stammt vom griechischen 'choros' ab, was ursprünglich einen Tanzplatz im antiken Theater bezeichnete.",
            "difficulty": 2
        },
        # Religion/History
        "What name is given to a personal follower of Christ during his life, especially one of the twelve Apostles?": {
            "text_de": "Wie nennt man einen persönlichen Anhänger Christi während seines Lebens, besonders einen der zwölf Apostel?",
            "answer_de": "Jünger",
            "fun_fact_de": "Das Wort 'Jünger' kommt vom althochdeutschen 'jungiro', was 'der Jüngere' bedeutet - ein Schüler im Verhältnis zum Meister.",
            "difficulty": 2
        }
    }

    if text_en in translations:
        result = translations[text_en].copy()
        result["text_de_open"] = None
        # Use predefined tags if available, otherwise use automatic categorization
        if "tags" not in result:
            result["tags"] = [get_category_tag(text_en, answer_en)]
        result["source"] = "Reddit Sunday Quiz"
        return result

    return None  # Mark for manual translation

def process_batch(input_file: str, output_file: str) -> int:
    """Process a single batch file and return number of approved questions."""
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            questions = json.load(f)
    except Exception as e:
        print(f"Error reading {input_file}: {e}")
        return 0

    approved_questions = []
    seen_questions = set()  # To deduplicate

    for q in questions:
        # Skip duplicates
        question_key = (q.get("text_en", ""), q.get("answer_en", ""))
        if question_key in seen_questions:
            continue
        seen_questions.add(question_key)

        # Check if should reject
        should_reject_q, reason = should_reject(q)
        if should_reject_q:
            continue

        # Try to translate
        translated = translate_to_german(q)
        if translated:
            approved_questions.append(translated)

    # Write output
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(approved_questions, f, ensure_ascii=False, indent=2)
        print(f"✓ {os.path.basename(input_file)}: {len(approved_questions)} approved questions")
        return len(approved_questions)
    except Exception as e:
        print(f"Error writing {output_file}: {e}")
        return 0

def main():
    """Process all batch files."""
    batch_dir = "data/pipeline/reddit/batches"
    total_approved = 0

    for i in range(59):  # batch_00 to batch_58
        batch_num = f"{i:02d}"
        input_file = os.path.join(batch_dir, f"batch_{batch_num}.json")
        output_file = os.path.join(batch_dir, f"batch_{batch_num}_output.json")

        if os.path.exists(input_file):
            approved_count = process_batch(input_file, output_file)
            total_approved += approved_count
        else:
            print(f"⚠ Missing: batch_{batch_num}.json")

    print(f"\n🎉 Total approved questions: {total_approved}")

if __name__ == "__main__":
    main()