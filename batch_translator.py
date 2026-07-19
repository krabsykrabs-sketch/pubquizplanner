#!/usr/bin/env python3
import json
import os

def translate_question(text_en, answer_en):
    """Translate a question from English to German"""

    # Define common translation patterns
    translations = {}

    # Weather and science
    if "area of high pressure" in text_en and "settled weather" in text_en:
        return {
            "text_de": "Wie nennt man ein Hochdruckgebiet, das lange Perioden stabilen Wetters bringt?",
            "answer_de": "Antizyklone",
            "fun_fact_de": "Antizyklone drehen sich auf der Nordhalbkugel im Uhrzeigersinn und bringen meist sonniges, trockenes Wetter.",
            "difficulty": 3,
            "tags": ["Wissenschaft"]
        }
    elif "narrow bands of strong winds" in text_en:
        return {
            "text_de": "Wie nennt man die schmalen Bänder starker Winde, die in etwa 10-20 km Höhe um die Welt ziehen?",
            "answer_de": "Jetstream",
            "fun_fact_de": "Jetstreams können Geschwindigkeiten von über 400 km/h erreichen und beeinflussen stark das Wetter und den Flugverkehr.",
            "difficulty": 3,
            "tags": ["Wissenschaft"]
        }
    elif "element" in text_en.lower() and answer_en in ["Oxygen", "Carbon", "Hydrogen", "Nitrogen", "Iron", "Gold", "Silver"]:
        element_map = {
            "Oxygen": ("Sauerstoff", "Sauerstoff ist das häufigste Element in der Erdkruste und essentiell für die Zellatmung."),
            "Carbon": ("Kohlenstoff", "Kohlenstoff ist die Grundlage allen organischen Lebens und kann verschiedene Formen wie Diamant oder Graphit annehmen."),
            "Hydrogen": ("Wasserstoff", "Wasserstoff ist das leichteste und häufigste Element im Universum."),
            "Nitrogen": ("Stickstoff", "Stickstoff macht etwa 78% der Erdatmosphäre aus und ist ein wichtiger Baustein von Proteinen."),
            "Iron": ("Eisen", "Eisen ist das vierthäufigste Element in der Erdkruste und essentiell für den Sauerstofftransport im Blut."),
            "Gold": ("Gold", "Gold ist ein Edelmetall, das aufgrund seiner Korrosionsbeständigkeit seit Jahrtausenden als Wertspeicher dient."),
            "Silver": ("Silber", "Silber hat die höchste elektrische und thermische Leitfähigkeit aller Elemente.")
        }
        if answer_en in element_map:
            german_name, fun_fact = element_map[answer_en]
            return {
                "text_de": f"Welches chemische Element hat das Symbol {text_en.split('symbol ')[-1].split('?')[0] if 'symbol' in text_en else ''}?",
                "answer_de": german_name,
                "fun_fact_de": fun_fact,
                "difficulty": 2,
                "tags": ["Wissenschaft"]
            }

    # Geography - countries and capitals
    elif "capital" in text_en.lower():
        capital_map = {
            "Lithuania": ("Litauen", "Vilnius", "Litauen war das erste sowjetische Land, das 1990 seine Unabhängigkeit erklärte."),
            "Estonia": ("Estland", "Tallinn", "Estland hat eine der fortschrittlichsten digitalen Verwaltungen der Welt."),
            "Latvia": ("Lettland", "Riga", "Riga hat die größte Sammlung von Jugendstil-Architektur in Europa."),
            "Finland": ("Finnland", "Helsinki", "Finnland hat über 180.000 Seen und gilt als das glücklichste Land der Welt."),
            "Norway": ("Norwegen", "Oslo", "Norwegen hat den größten Staatsfonds der Welt dank seiner Ölreserven."),
            "Sweden": ("Schweden", "Stockholm", "Stockholm ist auf 14 Inseln gebaut und wird oft als 'Venedig des Nordens' bezeichnet.")
        }

        for country, (german_name, capital, fun_fact) in capital_map.items():
            if country.lower() in text_en.lower() or capital in answer_en:
                if "capital" in text_en.lower():
                    return {
                        "text_de": f"Was ist die Hauptstadt von {german_name}?",
                        "answer_de": capital,
                        "fun_fact_de": fun_fact,
                        "difficulty": 2,
                        "tags": ["Geographie"]
                    }

    # Movies and TV
    elif "star wars" in text_en.lower():
        if "millennium falcon" in answer_en.lower():
            return {
                "text_de": "Wie heißt das Raumschiff in Star Wars, das den Kessel-Run in weniger als zwölf Parsec schaffte?",
                "answer_de": "Millennium Falke",
                "fun_fact_de": "Der Millennium Falke wurde von Han Solo und Chewbacca geflogen und galt als eines der schnellsten Schiffe der Galaxis.",
                "difficulty": 2,
                "tags": ["Film-TV"]
            }
        elif "luke skywalker" in answer_en.lower():
            return {
                "text_de": "Wie heißt der Hauptcharakter in der ursprünglichen Star Wars-Trilogie?",
                "answer_de": "Luke Skywalker",
                "fun_fact_de": "Luke Skywalker wurde von Mark Hamill gespielt und ist der Sohn von Darth Vader.",
                "difficulty": 1,
                "tags": ["Film-TV"]
            }

    # Music
    elif "beatles" in text_en.lower():
        return {
            "text_de": "Welche britische Band gilt als die erfolgreichste Popgruppe aller Zeiten?",
            "answer_de": "The Beatles",
            "fun_fact_de": "The Beatles verkauften über 600 Millionen Tonträger weltweit und prägten die Popmusik wie keine andere Band.",
            "difficulty": 1,
            "tags": ["Musik"]
        }

    # Sports
    elif "olympics" in text_en.lower() and "london" in answer_en.lower():
        return {
            "text_de": "Welche Stadt war Gastgeber der Olympischen Sommerspiele 1908, 1948 und 2012?",
            "answer_de": "London",
            "fun_fact_de": "London ist die einzige Stadt, die dreimal die Olympischen Sommerspiele ausgetragen hat.",
            "difficulty": 2,
            "tags": ["Sport"]
        }

    # Return None if no translation found
    return None

def should_skip_question(text_en, answer_en):
    """Determine if a question should be skipped"""

    # Skip very UK-specific content
    uk_specific = [
        "uk postcode", "british county", "eastenders", "cricket rules",
        "coronation street", "emmerdale", "bbc", "itv"
    ]

    # Skip very US-specific content
    us_specific = [
        "american football", "nfl", "nba", "mlb", "super bowl",
        "us state capital", "american president", "dollar bill"
    ]

    # Skip if contains UK-specific terms
    if any(term in text_en.lower() for term in uk_specific):
        return True

    # Skip if contains US-specific terms
    if any(term in text_en.lower() for term in us_specific):
        return True

    # Skip if answer is a very obscure person
    obscure_people = [
        "dr. jonathan crane", "nick bradshaw", "goose"
    ]
    if any(person in answer_en.lower() for person in obscure_people):
        return True

    # Skip wordplay questions
    if "pun" in text_en.lower() or "rhyme" in text_en.lower():
        return True

    return False

def process_batch(batch_num):
    """Process a single batch file"""

    batch_file = f'/home/jan/PubQuiz/pubquizplanner/data/pipeline/reddit/batches/batch_{batch_num:02d}.json'
    output_file = f'/home/jan/PubQuiz/pubquizplanner/data/pipeline/reddit/batches/batch_{batch_num:02d}_output.json'

    if not os.path.exists(batch_file):
        print(f"Batch file {batch_file} not found")
        return

    # Read batch file
    with open(batch_file, 'r') as f:
        questions = json.load(f)

    translated_questions = []

    for q in questions:
        text_en = q['text_en']
        answer_en = q['answer_en']

        # Skip if unsuitable
        if should_skip_question(text_en, answer_en):
            continue

        # Try to translate
        translation = translate_question(text_en, answer_en)

        if translation:
            translated = {
                "text_de": translation["text_de"],
                "text_de_open": None,
                "answer_de": translation["answer_de"],
                "fun_fact_de": translation["fun_fact_de"],
                "difficulty": translation["difficulty"],
                "tags": translation["tags"],
                "source": "Reddit Sunday Quiz"
            }
            translated_questions.append(translated)

    # Write output
    with open(output_file, 'w') as f:
        json.dump(translated_questions, f, indent=2, ensure_ascii=False)

    print(f"Batch {batch_num}: Processed {len(questions)} questions, translated {len(translated_questions)} questions")

# Process batches 13-19 (11 and 12 are already done)
for batch_num in range(13, 20):
    process_batch(batch_num)

print("All batches processed!")