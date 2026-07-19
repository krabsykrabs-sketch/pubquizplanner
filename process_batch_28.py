#!/usr/bin/env python3
import json

def review_question(q):
    """Review a single question and return cleaned version or None if rejected"""
    text = q.get("text_de", "").strip()
    answer = q.get("answer_de", "").strip()
    batch_index = q.get("_batch_index")

    # Skip empty or malformed questions
    if not text or not answer:
        return None

    # Skip multiple choice indicators
    if any(phrase in text.lower() for phrase in [
        "was ist keine", "welche rechtschreibung", "welche der folgenden",
        "was ist falsch", "was ist richtig", "welche aussage", "was trifft nicht zu"
    ]):
        return None

    # Skip ambiguous or problematic questions
    skip_patterns = [
        "schätzen sie",  # estimation questions often too subjective
        "etwa wie viele", # vague quantitative questions
        "ungefähr wie", # approximations
        "ca. wie", # approximations
    ]

    if any(pattern in text.lower() for pattern in skip_patterns):
        if "schätzen sie: wieviel zeit verschlafen wir" in text.lower():
            # This is actually a reasonable trivia question with a clear answer
            pass
        else:
            return None

    # Skip very specific technical questions that are too niche
    if "linus torvald" in text.lower() and "linux" in text.lower():
        # Fix the typo in Torvalds name but keep it
        text = text.replace("Linus Torvald", "Linus Torvalds")
        answer = "Linus Torvalds"

    # Skip date-specific questions that are now outdated
    if "(frage vom" in text.lower() or "heute ist" in text.lower():
        return None

    # Skip if answer seems incomplete or wrong
    if len(answer) < 2:
        return None

    # Determine category mapping
    category_map = {
        "sport": "Sport",
        "technik": "Technik",
        "literatur": "Literatur",
        "geographie": "Geographie",
        "wissenschaft": "Wissenschaft",
        "allgemeinwissen": "Allgemeinwissen",
        "geschichte": "Geschichte",
        "musik": "Musik",
        "film&tv": "Film&TV"
    }

    source_cat = q.get("_source_category", "")
    category = category_map.get(source_cat, "Allgemeinwissen")

    # Determine difficulty
    difficulty = q.get("difficulty", 2)
    if difficulty < 1:
        difficulty = 1
    elif difficulty > 3:
        difficulty = 3

    # Generate fun facts
    fun_facts = {
        2800: "Slicks wurden 1998 wieder eingeführt und sind heute Standard in der Formel 1.",
        2801: "Die UEFA-Computerrangliste berechnete die Stärke der Vereine basierend auf internationalen Erfolgen.",
        2802: "Deutschland siegte im Finale gegen Tschechien mit einem Golden Goal von Oliver Bierhoff.",
        2803: "Uruguay war der erste Weltmeister 1930, nach dem Krieg fand die nächste WM in Brasilien statt.",
        2804: "Helmut Rahn erzielte das entscheidende 3:2 im WM-Finale gegen Ungarn - das 'Wunder von Bern'.",
        2805: "Das Golden Goal wurde 1996-2004 verwendet und bedeutete sofortiges Spielende bei einem Tor.",
        2806: "Der Europapokal der Pokalsieger existierte von 1960-1999 und wurde dann eingestellt.",
        2807: "1998 war das erste Mal, dass 32 Mannschaften an einer WM teilnahmen.",
        2808: "Beckenbauer spielte von 1964-1977 in der Bundesliga und war einer der besten Liberos.",
        2809: "Energie Cottbus erreichte 1997 das DFB-Pokal Halbfinale als Drittligist.",
        2810: "Die WM 1978 fand während der Militärdiktatur in Argentinien statt.",
        2811: "Deutschland gewann die EM 1972, 1980 und 1996 - ein Rekord zu dieser Zeit.",
        2812: "Footix war ein blauer Hahn, das Symbol Frankreichs, und wurde zum beliebten Maskottchen.",
        2813: "La Ola entstand tatsächlich bei der WM 1986 in Mexiko, nicht Spanien.",
        2814: "Brasilien besiegte Italien 1994 im Finale durch Elfmeterschießen 3-2.",
        2815: "Jordan Letchkov köpfte 1994 das Siegtor für Bulgarien gegen Deutschland ins Halbfinale.",
        2816: "Ein Fußballtor ist exakt 7,32 Meter breit und 2,44 Meter hoch.",
        2817: "Bayern München gewann 1996 erstmals den UEFA-Cup, heute Europa League.",
        2818: "Berti Vogts bekam seinen Spitznamen durch seinen aggressiven, bissigen Spielstil.",
        2819: "Dieses dramatische 4:3 sicherte Deutschland die WM-Qualifikation 1998.",
        2820: "Tuvalu verdient Millionen durch die TV-Domain, obwohl das Land nur 12.000 Einwohner hat.",
        2821: "Eine Audio-CD fasst 74 Minuten Musik oder etwa 650-750 MB Daten.",
        2822: "Der ZX81 kostete nur 99 Pfund und brachte Computing in viele Haushalte.",
        2823: "IBMs erste Festplatte RAMAC wog 971 kg und speicherte 5 MB.",
        2824: "Linus Torvalds war nur 21 Jahre alt, als er Linux als Hobby-Projekt startete.",
        2825: "Ein Nibble sind 4 Bits - halb so viel wie ein Byte (8 Bits).",
        2826: "Das binäre System wurde bereits im 3. Jahrhundert v.Chr. in China entwickelt.",
        2827: "Tim Berners-Lee schuf 1990 die erste Website am CERN in der Schweiz.",
        2828: "Jacquards Webstuhl mit Lochkarten war ein Vorläufer der Computerprogrammierung.",
        2829: "Der Vatikan hat eine der kleinsten Internet-Domains der Welt mit nur wenigen Websites.",
        2830: "Colossus half beim Knacken deutscher Enigma-Codes im Zweiten Weltkrieg.",
        2831: "Intel wurde 1968 gegründet und entwickelte den ersten Mikroprozessor 4004.",
        2832: "Symbolics.com war die erste .com-Domain, registriert am 15. März 1985."
    }

    # Get or generate fun fact
    fun_fact = fun_facts.get(batch_index, "")
    if not fun_fact:
        # Generate basic fun fact based on content
        if "fußball" in text.lower() or "wm" in text.lower():
            fun_fact = "Fußball ist die beliebteste Sportart der Welt mit über 4 Milliarden Fans."
        elif "computer" in text.lower() or "internet" in text.lower():
            fun_fact = "Das Internet entwickelte sich aus dem militärischen ARPANET der 1960er Jahre."
        else:
            fun_fact = "Wissen macht Spaß - besonders beim Pub Quiz mit Freunden!"

    # Fix common typos and issues
    text = text.replace("Mannschften", "Mannschaften")
    text = text.replace("gegn", "gegen")
    text = text.replace("hiess", "hieß")
    text = text.replace("Spinnennetzt", "Spinnennetz")

    # Clean up punctuation
    if not text.endswith("?"):
        text += "?"

    # Generate tags based on content
    tags = []
    if any(word in text.lower() for word in ["fußball", "wm", "em", "bundesliga"]):
        tags.append("fußball")
    if any(word in text.lower() for word in ["computer", "internet", "software"]):
        tags.append("technologie")
    if "deutschland" in text.lower() or "deutsche" in text.lower():
        tags.append("deutschland")
    if any(word in text.lower() for word in ["musik", "komponist", "lied"]):
        tags.append("musik")

    # Remove duplicates and limit to 3 tags
    tags = list(set(tags))[:3]

    return {
        "_batch_index": batch_index,
        "text_de": text,
        "answer_de": answer,
        "category": category,
        "difficulty": difficulty,
        "fun_fact_de": fun_fact,
        "tags": tags
    }

def main():
    # Read the input file
    with open('/home/jan/PubQuiz/pubquizplanner/data/pipeline/quizpro_batches/batch_28.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)

    # Review each question
    approved_questions = []
    for q in questions:
        reviewed = review_question(q)
        if reviewed:
            approved_questions.append(reviewed)

    # Write the output file
    with open('/home/jan/PubQuiz/pubquizplanner/data/pipeline/quizpro_batches/batch_28_reviewed.json', 'w', encoding='utf-8') as f:
        json.dump(approved_questions, f, ensure_ascii=False, indent=2)

    print(f"Processed {len(questions)} questions, approved {len(approved_questions)}")

if __name__ == "__main__":
    main()