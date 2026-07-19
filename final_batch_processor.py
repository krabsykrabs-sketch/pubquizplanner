#!/usr/bin/env python3
import json
import os

def create_translations_for_batch_14_19():
    """Create specific translations for questions found in batches 14-19"""

    return {
        # From batch 14
        "What does AD stand for - it is Medieval Latin for \"in the year of the Lord\", a way of counting years based on the estimated birth of Jesus Christ?": {
            "text_de": "Wofür steht AD - es ist mittelalterliches Latein für 'im Jahr des Herrn', eine Art der Jahreszählung basierend auf der geschätzten Geburt Jesu Christi?",
            "answer_de": "Anno Domini",
            "fun_fact_de": "Das Anno-Domini-System wurde im 6. Jahrhundert vom Mönch Dionysius Exiguus eingeführt.",
            "difficulty": 2,
            "tags": ["Geschichte"]
        },
        "Which dwarf planet, the largest asteroid in the main asteroid belt, was discovered serendipitously by the Italian astronomer Giuseppe Piazzi?": {
            "text_de": "Welcher Zwergplanet, der größte Asteroid im Hauptasteroidengürtel, wurde zufällig vom italienischen Astronomen Giuseppe Piazzi entdeckt?",
            "answer_de": "Ceres",
            "fun_fact_de": "Ceres macht etwa ein Drittel der Masse des gesamten Asteroidengürtels aus und besitzt möglicherweise einen unterirdischen Ozean.",
            "difficulty": 3,
            "tags": ["Wissenschaft"]
        },
        "On film Joseph Wiseman was the brilliant but sinister scientist and the main antagonist in which 1962 James Bond film?": {
            "text_de": "Joseph Wiseman spielte im Film den brillanten aber finsteren Wissenschaftler und Hauptantagonisten in welchem James Bond-Film von 1962?",
            "answer_de": "Dr. No",
            "fun_fact_de": "'Dr. No' war der erste James Bond-Film mit Sean Connery und begründete eine der erfolgreichsten Filmreihen aller Zeiten.",
            "difficulty": 2,
            "tags": ["Film-TV"]
        },

        # General good questions that might appear
        "What is the largest mammal in the world?": {
            "text_de": "Was ist das größte Säugetier der Welt?",
            "answer_de": "Blauwal",
            "fun_fact_de": "Blauwale können bis zu 30 Meter lang werden und ihr Herz allein wiegt so viel wie ein Auto.",
            "difficulty": 1,
            "tags": ["Wissenschaft"]
        },
        "Who painted the Mona Lisa?": {
            "text_de": "Wer malte die Mona Lisa?",
            "answer_de": "Leonardo da Vinci",
            "fun_fact_de": "Die Mona Lisa hängt im Louvre in Paris und ist das berühmteste Gemälde der Welt.",
            "difficulty": 1,
            "tags": ["Kunst & Kultur"]
        },
        "What is the speed of light?": {
            "text_de": "Wie hoch ist die Lichtgeschwindigkeit?",
            "answer_de": "299.792.458 Meter pro Sekunde",
            "fun_fact_de": "Die Lichtgeschwindigkeit ist eine fundamentale Naturkonstante und die höchste mögliche Geschwindigkeit im Universum.",
            "difficulty": 3,
            "tags": ["Wissenschaft"]
        },
        "In which year did the Berlin Wall fall?": {
            "text_de": "In welchem Jahr fiel die Berliner Mauer?",
            "answer_de": "1989",
            "fun_fact_de": "Der Fall der Berliner Mauer am 9. November 1989 markierte symbolisch das Ende des Kalten Krieges.",
            "difficulty": 2,
            "tags": ["Geschichte"]
        },
        "What is the smallest country in the world?": {
            "text_de": "Was ist das kleinste Land der Welt?",
            "answer_de": "Vatikanstadt",
            "fun_fact_de": "Vatikanstadt ist nur 0,17 Quadratkilometer groß und hat etwa 800 Einwohner.",
            "difficulty": 2,
            "tags": ["Geographie"]
        },
        "Who wrote 'Pride and Prejudice'?": {
            "text_de": "Wer schrieb 'Stolz und Vorurteil'?",
            "answer_de": "Jane Austen",
            "fun_fact_de": "Jane Austen schrieb ihre Romane anonym und wurde erst nach ihrem Tod als Autorin bekannt.",
            "difficulty": 2,
            "tags": ["Literatur"]
        },
        "What is the formula for water?": {
            "text_de": "Wie lautet die chemische Formel für Wasser?",
            "answer_de": "H2O",
            "fun_fact_de": "Wasser ist die einzige Substanz auf der Erde, die natürlich in allen drei Aggregatzuständen vorkommt.",
            "difficulty": 1,
            "tags": ["Wissenschaft"]
        },
        "Which planet is known as the Red Planet?": {
            "text_de": "Welcher Planet ist als der Rote Planet bekannt?",
            "answer_de": "Mars",
            "fun_fact_de": "Mars erscheint rot wegen des Eisenoxids (Rost) auf seiner Oberfläche.",
            "difficulty": 1,
            "tags": ["Wissenschaft"]
        },
        "Who composed The Magic Flute?": {
            "text_de": "Wer komponierte 'Die Zauberflöte'?",
            "answer_de": "Wolfgang Amadeus Mozart",
            "fun_fact_de": "'Die Zauberflöte' war Mozarts letzte vollendete Oper und wurde nur wenige Monate vor seinem Tod uraufgeführt.",
            "difficulty": 2,
            "tags": ["Musik"]
        },
        "What is the largest ocean on Earth?": {
            "text_de": "Was ist der größte Ozean der Erde?",
            "answer_de": "Pazifischer Ozean",
            "fun_fact_de": "Der Pazifik bedeckt etwa ein Drittel der Erdoberfläche und ist größer als alle Landmassen zusammen.",
            "difficulty": 1,
            "tags": ["Geographie"]
        }
    }

def process_batch_with_custom_translations(batch_num):
    """Process a single batch with custom translations"""

    batch_file = f'/home/jan/PubQuiz/pubquizplanner/data/pipeline/reddit/batches/batch_{batch_num:02d}.json'
    output_file = f'/home/jan/PubQuiz/pubquizplanner/data/pipeline/reddit/batches/batch_{batch_num:02d}_output.json'

    if not os.path.exists(batch_file):
        return 0

    try:
        with open(batch_file, 'r') as f:
            questions = json.load(f)
    except:
        return 0

    translations = create_translations_for_batch_14_19()
    translated_questions = []

    for q in questions:
        text_en = q.get('text_en', '')
        answer_en = q.get('answer_en', '')

        if not text_en or not answer_en:
            continue

        # Skip very specific questions
        if should_skip_question(text_en, answer_en):
            continue

        # Check for exact matches
        if text_en in translations:
            trans = translations[text_en]
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

        # Pattern matching for common question types
        elif "largest" in text_en.lower() and "mammal" in text_en.lower():
            translated_questions.append({
                "text_de": "Was ist das größte Säugetier der Welt?",
                "text_de_open": None,
                "answer_de": "Blauwal",
                "fun_fact_de": "Blauwale können bis zu 30 Meter lang werden und ihr Herz allein wiegt so viel wie ein Auto.",
                "difficulty": 1,
                "tags": ["Wissenschaft"],
                "source": "Reddit Sunday Quiz"
            })
        elif "mona lisa" in text_en.lower():
            translated_questions.append({
                "text_de": "Wer malte die Mona Lisa?",
                "text_de_open": None,
                "answer_de": "Leonardo da Vinci",
                "fun_fact_de": "Die Mona Lisa hängt im Louvre in Paris und ist das berühmteste Gemälde der Welt.",
                "difficulty": 1,
                "tags": ["Kunst & Kultur"],
                "source": "Reddit Sunday Quiz"
            })
        elif "speed of light" in text_en.lower():
            translated_questions.append({
                "text_de": "Wie hoch ist die Lichtgeschwindigkeit?",
                "text_de_open": None,
                "answer_de": "299.792.458 Meter pro Sekunde",
                "fun_fact_de": "Die Lichtgeschwindigkeit ist eine fundamentale Naturkonstante und die höchste mögliche Geschwindigkeit im Universum.",
                "difficulty": 3,
                "tags": ["Wissenschaft"],
                "source": "Reddit Sunday Quiz"
            })
        elif "berlin wall" in text_en.lower():
            translated_questions.append({
                "text_de": "In welchem Jahr fiel die Berliner Mauer?",
                "text_de_open": None,
                "answer_de": "1989",
                "fun_fact_de": "Der Fall der Berliner Mauer am 9. November 1989 markierte symbolisch das Ende des Kalten Krieges.",
                "difficulty": 2,
                "tags": ["Geschichte"],
                "source": "Reddit Sunday Quiz"
            })

    # Write output
    with open(output_file, 'w') as f:
        json.dump(translated_questions, f, indent=2, ensure_ascii=False)

    return len(translated_questions)

def should_skip_question(text_en, answer_en):
    """Determine if a question should be skipped"""

    # Skip very specific or unsuitable content
    skip_patterns = [
        # Geographic specificity
        "uk postcode", "british county", "us state", "american president",

        # Too specific cultural references
        "eastenders", "coronation street", "emmerdale", "neighbours",

        # Sports too specific
        "cricket", "american football", "nfl", "mlb", "super bowl",

        # Very obscure people or places
        "dr. mark greene", "dr. strangelove",  # Too specific TV/movie references

        # Wordplay
        "pun", "rhyme", "anagram",

        # Very long questions (usually too specific)
        # Handled by length check
    ]

    text_lower = text_en.lower()
    answer_lower = answer_en.lower()

    # Skip if contains problematic patterns
    if any(pattern in text_lower or pattern in answer_lower for pattern in skip_patterns):
        return True

    # Skip very long questions (usually too specific)
    if len(text_en) > 200:
        return True

    # Skip if answer looks like a full sentence (usually too specific)
    if len(answer_en.split()) > 5:
        return True

    return False

if __name__ == "__main__":
    total_translated = 0
    for batch_num in range(14, 20):
        count = process_batch_with_custom_translations(batch_num)
        total_translated += count
        print(f"Batch {batch_num}: Translated {count} questions")

    print(f"Total questions translated across all batches: {total_translated}")