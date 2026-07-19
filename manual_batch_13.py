#!/usr/bin/env python3
import json

# Read batch_13.json
with open('/home/jan/PubQuiz/pubquizplanner/data/pipeline/reddit/batches/batch_13.json', 'r') as f:
    questions = json.load(f)

translated_questions = []

# Manual translations for good questions from batch_13
good_translations = {
    "Allium cepa is a perennial herb belonging to the Liliaceae family and one of the worlds most used foods - by what name is it better known?": {
        "text_de": "Allium cepa ist ein mehrjähriges Kraut aus der Familie der Liliengewächse und eines der weltweit am häufigsten verwendeten Lebensmittel - unter welchem Namen ist es besser bekannt?",
        "answer_de": "Zwiebel",
        "fun_fact_de": "Zwiebeln werden seit über 5000 Jahren kultiviert und waren im alten Ägypten so wertvoll, dass sie als Zahlungsmittel verwendet wurden.",
        "difficulty": 2,
        "tags": ["Wissenschaft"]
    },
    "What type of meat is used in the traditional version of the slow cooked Italian dish called Osso buco?": {
        "text_de": "Welche Fleischsorte wird in der traditionellen Version des langsam gekochten italienischen Gerichts Osso buco verwendet?",
        "answer_de": "Kalbfleisch",
        "fun_fact_de": "Osso buco bedeutet 'Knochen mit Loch' und bezieht sich auf die Kalbshaxe mit dem sichtbaren Knochenmark.",
        "difficulty": 2,
        "tags": ["Essen & Trinken"]
    },
    "Billie Eilish won a Best Original Song Oscar for the title track to which 2021 James Bond film?": {
        "text_de": "Billie Eilish gewann einen Oscar für den besten Originalsong für den Titelsong zu welchem James Bond-Film von 2021?",
        "answer_de": "Keine Zeit zu sterben",
        "fun_fact_de": "Billie Eilish war mit 18 Jahren die jüngste Künstlerin, die je einen James Bond-Titelsong aufgenommen hat.",
        "difficulty": 2,
        "tags": ["Musik"]
    },
    "Eminem tried his hand at acting in the film 8 Mile in 2003, that same film earned him his very first Oscar nomination and win — for which original song?": {
        "text_de": "Eminem versuchte sich 2003 als Schauspieler im Film '8 Mile', der ihm seine erste Oscar-Nominierung und seinen ersten Gewinn einbrachte - für welchen Originalsong?",
        "answer_de": "Lose Yourself",
        "fun_fact_de": "Eminem ist der erste Rapper, der einen Oscar gewann, und er erschien nicht zur Verleihung, weil er nicht glaubte zu gewinnen.",
        "difficulty": 2,
        "tags": ["Musik"]
    },
    "Who performed \"Theme from Shaft\", which won the Best Original Song Oscar in 1971 for the film \"Shaft\"?": {
        "text_de": "Wer sang das 'Theme from Shaft', das 1971 den Oscar für den besten Originalsong für den Film 'Shaft' gewann?",
        "answer_de": "Isaac Hayes",
        "fun_fact_de": "Isaac Hayes war der erste Afroamerikaner, der einen Oscar für einen Originalsong gewann.",
        "difficulty": 3,
        "tags": ["Musik"]
    },
    "Which song performed by Lady Gaga and Bradley Cooper from 2018 musical romantic drama \"A Star Is Born\" won a Best Original Song Oscar?": {
        "text_de": "Welcher Song von Lady Gaga und Bradley Cooper aus dem romantischen Musikdrama 'A Star Is Born' von 2018 gewann einen Oscar für den besten Originalsong?",
        "answer_de": "Shallow",
        "fun_fact_de": "Lady Gaga wurde für 'Shallow' sowohl für den Oscar als auch für den Grammy nominiert und gewann beide Preise.",
        "difficulty": 2,
        "tags": ["Musik"]
    },
    "Alan Menken (music) and Tim Rice (lyrics) won the 1992 Best Original Song Oscar with \"A Whole New World\" - from which film?": {
        "text_de": "Alan Menken (Musik) und Tim Rice (Text) gewannen 1992 den Oscar für den besten Originalsong mit 'A Whole New World' - aus welchem Film?",
        "answer_de": "Aladdin",
        "fun_fact_de": "Alan Menken hat insgesamt acht Oscars gewonnen und ist einer der erfolgreichsten Komponisten in der Disney-Geschichte.",
        "difficulty": 2,
        "tags": ["Film-TV"]
    },
    "In The Simpsons, what is the full first name of the only son of Homer and Marge - the brother of Lisa and Maggie?": {
        "text_de": "Wie lautet in den Simpsons der vollständige Vorname des einzigen Sohnes von Homer und Marge - der Bruder von Lisa und Maggie?",
        "answer_de": "Bartholomew",
        "fun_fact_de": "Bart Simpson wurde nach Matt Groenings Bruder benannt, aber sein vollständiger Name Bartholomew ist eine Hommage an den Charakter aus der Dickens-Geschichte.",
        "difficulty": 2,
        "tags": ["Film-TV"]
    }
}

for q in questions:
    text_en = q.get('text_en', '')
    answer_en = q.get('answer_en', '')

    # Skip corrupted entries
    if not text_en or not answer_en:
        continue

    # Skip very specific or unsuitable questions
    skip_reasons = [
        "kvass" in text_en.lower(),  # Too specific Russian cuisine
        "blackthorn" in text_en.lower(),  # Too specific British flora
        "hotel" in text_en.lower() and "montana" in text_en.lower(),  # Too specific location
        "mayfair" in text_en.lower(),  # Too UK-specific
        "gideon" in answer_en.lower(),  # Too specific religious reference
        len(text_en) > 200  # Overly long questions
    ]

    if any(skip_reasons):
        continue

    # Add translation if we have it
    if text_en in good_translations:
        trans = good_translations[text_en]
        translated = {
            "text_de": trans["text_de"],
            "text_de_open": None,
            "answer_de": trans["answer_de"],
            "fun_fact_de": trans["fun_fact_de"],
            "difficulty": trans["difficulty"],
            "tags": trans["tags"],
            "source": "Reddit Sunday Quiz"
        }
        translated_questions.append(translated)

# Write to output file
with open('/home/jan/PubQuiz/pubquizplanner/data/pipeline/reddit/batches/batch_13_output.json', 'w') as f:
    json.dump(translated_questions, f, indent=2, ensure_ascii=False)

print(f"Batch 13: Processed questions, translated {len(translated_questions)} questions")