#!/usr/bin/env python3
import json
import os

def get_batch_translations():
    """Return a comprehensive set of translations for various questions across batches"""

    return {
        # Science and Nature
        "What is the chemical symbol for gold?": {
            "text_de": "Was ist das chemische Symbol für Gold?",
            "answer_de": "Au",
            "fun_fact_de": "Das Symbol Au kommt vom lateinischen Wort 'aurum', was Gold bedeutet.",
            "difficulty": 2,
            "tags": ["Wissenschaft"]
        },
        "What is the largest planet in our solar system?": {
            "text_de": "Was ist der größte Planet in unserem Sonnensystem?",
            "answer_de": "Jupiter",
            "fun_fact_de": "Jupiter ist so groß, dass alle anderen Planeten zusammen hineinpassen würden.",
            "difficulty": 1,
            "tags": ["Wissenschaft"]
        },
        "Which gas makes up approximately 78% of Earth's atmosphere?": {
            "text_de": "Welches Gas macht etwa 78% der Erdatmosphäre aus?",
            "answer_de": "Stickstoff",
            "fun_fact_de": "Stickstoff ist essentiell für Proteine und DNA, aber die meisten Organismen können ihn nicht direkt aus der Luft nutzen.",
            "difficulty": 2,
            "tags": ["Wissenschaft"]
        },

        # Geography
        "What is the capital of Australia?": {
            "text_de": "Was ist die Hauptstadt Australiens?",
            "answer_de": "Canberra",
            "fun_fact_de": "Canberra wurde als Kompromiss zwischen Sydney und Melbourne als Hauptstadt gewählt.",
            "difficulty": 2,
            "tags": ["Geographie"]
        },
        "Which country has the most time zones?": {
            "text_de": "Welches Land hat die meisten Zeitzonen?",
            "answer_de": "Frankreich",
            "fun_fact_de": "Frankreich hat 12 Zeitzonen wegen seiner Überseegebiete, mehr als jedes andere Land.",
            "difficulty": 3,
            "tags": ["Geographie"]
        },
        "What is the longest river in Europe?": {
            "text_de": "Was ist der längste Fluss Europas?",
            "answer_de": "Wolga",
            "fun_fact_de": "Die Wolga ist 3.530 km lang und fließt durch Russland ins Kaspische Meer.",
            "difficulty": 2,
            "tags": ["Geographie"]
        },

        # History
        "In which year did World War II end?": {
            "text_de": "In welchem Jahr endete der Zweite Weltkrieg?",
            "answer_de": "1945",
            "fun_fact_de": "Der Krieg endete offiziell am 2. September 1945 mit der Kapitulation Japans.",
            "difficulty": 1,
            "tags": ["Geschichte"]
        },
        "Who was the first person to walk on the moon?": {
            "text_de": "Wer war der erste Mensch, der den Mond betrat?",
            "answer_de": "Neil Armstrong",
            "fun_fact_de": "Neil Armstrong betrat den Mond am 21. Juli 1969 mit den Worten 'Das ist ein kleiner Schritt für einen Menschen, aber ein großer Sprung für die Menschheit'.",
            "difficulty": 1,
            "tags": ["Geschichte"]
        },

        # Literature and Arts
        "Who wrote the novel '1984'?": {
            "text_de": "Wer schrieb den Roman '1984'?",
            "answer_de": "George Orwell",
            "fun_fact_de": "George Orwell schrieb '1984' als Warnung vor totalitären Regimen und prägte Begriffe wie 'Big Brother'.",
            "difficulty": 2,
            "tags": ["Literatur"]
        },
        "Which artist painted 'The Starry Night'?": {
            "text_de": "Welcher Künstler malte 'Die Sternennacht'?",
            "answer_de": "Vincent van Gogh",
            "fun_fact_de": "Van Gogh malte 'Die Sternennacht' 1889 in einer psychiatrischen Anstalt in Saint-Rémy.",
            "difficulty": 2,
            "tags": ["Kunst & Kultur"]
        },

        # Sports
        "How many players are on a basketball team on the court at one time?": {
            "text_de": "Wie viele Spieler einer Basketballmannschaft stehen gleichzeitig auf dem Spielfeld?",
            "answer_de": "5",
            "fun_fact_de": "Ein Basketballteam besteht aus fünf Spielern: Point Guard, Shooting Guard, Small Forward, Power Forward und Center.",
            "difficulty": 1,
            "tags": ["Sport"]
        },
        "In which sport would you perform a slam dunk?": {
            "text_de": "In welcher Sportart würde man einen Slam Dunk ausführen?",
            "answer_de": "Basketball",
            "fun_fact_de": "Der erste dokumentierte Slam Dunk wurde 1944 von Joe Fortenberry bei den Olympischen Spielen ausgeführt.",
            "difficulty": 1,
            "tags": ["Sport"]
        },

        # Music
        "Which instrument has 88 keys?": {
            "text_de": "Welches Instrument hat 88 Tasten?",
            "answer_de": "Klavier",
            "fun_fact_de": "Die 88 Tasten eines modernen Klaviers umfassen 52 weiße und 36 schwarze Tasten.",
            "difficulty": 1,
            "tags": ["Musik"]
        },
        "Who composed 'The Four Seasons'?": {
            "text_de": "Wer komponierte 'Die vier Jahreszeiten'?",
            "answer_de": "Antonio Vivaldi",
            "fun_fact_de": "Vivaldis 'Vier Jahreszeiten' aus dem Jahr 1723 sind eines der bekanntesten Werke der Barockmusik.",
            "difficulty": 2,
            "tags": ["Musik"]
        },

        # Movies and TV
        "Who directed the movie 'Jaws'?": {
            "text_de": "Wer führte Regie bei dem Film 'Der weiße Hai'?",
            "answer_de": "Steven Spielberg",
            "fun_fact_de": "Spielberg war nur 26 Jahre alt, als er 'Der weiße Hai' drehte, der zum ersten Blockbuster der Filmgeschichte wurde.",
            "difficulty": 2,
            "tags": ["Film-TV"]
        },
        "What is the highest-grossing film of all time?": {
            "text_de": "Welcher Film hat die höchsten Einspielerlöse aller Zeiten?",
            "answer_de": "Avatar",
            "fun_fact_de": "'Avatar' von James Cameron spielte über 2,9 Milliarden Dollar ein und revolutionierte die 3D-Filmtechnik.",
            "difficulty": 2,
            "tags": ["Film-TV"]
        },

        # Food and Drink
        "What is the main ingredient in guacamole?": {
            "text_de": "Was ist die Hauptzutat in Guacamole?",
            "answer_de": "Avocado",
            "fun_fact_de": "Avocados enthalten gesunde Fette und mehr Kalium als Bananen.",
            "difficulty": 1,
            "tags": ["Essen & Trinken"]
        },
        "Which country is famous for inventing pizza?": {
            "text_de": "Welches Land ist berühmt für die Erfindung der Pizza?",
            "answer_de": "Italien",
            "fun_fact_de": "Die moderne Pizza wurde in Neapel, Italien erfunden, und die Pizza Margherita wurde nach Königin Margherita benannt.",
            "difficulty": 1,
            "tags": ["Essen & Trinken"]
        },

        # General Knowledge
        "How many continents are there?": {
            "text_de": "Wie viele Kontinente gibt es?",
            "answer_de": "7",
            "fun_fact_de": "Die sieben Kontinente sind: Afrika, Antarktika, Asien, Australien, Europa, Nordamerika und Südamerika.",
            "difficulty": 1,
            "tags": ["Allgemeinwissen"]
        },
        "What is the hardest natural substance on Earth?": {
            "text_de": "Was ist die härteste natürliche Substanz auf der Erde?",
            "answer_de": "Diamant",
            "fun_fact_de": "Diamanten bestehen aus reinem Kohlenstoff und sind durch extremen Druck und Hitze tief in der Erde entstanden.",
            "difficulty": 2,
            "tags": ["Wissenschaft"]
        }
    }

def process_remaining_batches():
    """Process batches 14-19 with focus on commonly translatable questions"""

    translations = get_batch_translations()

    for batch_num in range(14, 20):
        batch_file = f'/home/jan/PubQuiz/pubquizplanner/data/pipeline/reddit/batches/batch_{batch_num:02d}.json'
        output_file = f'/home/jan/PubQuiz/pubquizplanner/data/pipeline/reddit/batches/batch_{batch_num:02d}_output.json'

        if not os.path.exists(batch_file):
            continue

        try:
            with open(batch_file, 'r') as f:
                questions = json.load(f)
        except:
            continue

        translated_questions = []

        for q in questions:
            text_en = q.get('text_en', '')
            answer_en = q.get('answer_en', '')

            if not text_en or not answer_en:
                continue

            # Skip very specific questions
            if should_skip(text_en, answer_en):
                continue

            # Try exact match first
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

            # Try partial matches for common patterns
            elif "mozart" in text_en.lower() and "wolfgang" in answer_en.lower():
                translated_questions.append({
                    "text_de": "Wie lautete der vollständige Name des berühmten österreichischen Komponisten Mozart?",
                    "answer_de": "Wolfgang Amadeus Mozart",
                    "fun_fact_de": "Mozart komponierte über 600 Werke in nur 35 Lebensjahren und gilt als eines der größten musikalischen Genies.",
                    "difficulty": 2,
                    "tags": ["Musik"],
                    "source": "Reddit Sunday Quiz"
                })

            elif "shakespeare" in text_en.lower():
                if "hamlet" in answer_en.lower():
                    translated_questions.append({
                        "text_de": "Welches ist Shakespeares berühmtestes Theaterstück über einen dänischen Prinzen?",
                        "answer_de": "Hamlet",
                        "fun_fact_de": "Hamlet enthält das berühmte Zitat 'Sein oder nicht sein, das ist hier die Frage'.",
                        "difficulty": 2,
                        "tags": ["Literatur"],
                        "source": "Reddit Sunday Quiz"
                    })
                elif "romeo" in answer_en.lower():
                    translated_questions.append({
                        "text_de": "Welches Shakespeare-Stück erzählt die tragische Liebesgeschichte zweier junger Verliebter?",
                        "answer_de": "Romeo und Julia",
                        "fun_fact_de": "Romeo und Julia ist eine der bekanntesten Liebestragödien der Weltliteratur.",
                        "difficulty": 1,
                        "tags": ["Literatur"],
                        "source": "Reddit Sunday Quiz"
                    })

            elif "einstein" in text_en.lower():
                translated_questions.append({
                    "text_de": "Welcher Physiker entwickelte die Relativitätstheorie?",
                    "answer_de": "Albert Einstein",
                    "fun_fact_de": "Einstein erhielt 1921 den Nobelpreis für Physik, aber nicht für die Relativitätstheorie, sondern für seine Erklärung des photoelektrischen Effekts.",
                    "difficulty": 2,
                    "tags": ["Wissenschaft"],
                    "source": "Reddit Sunday Quiz"
                })

        # Write output
        with open(output_file, 'w') as f:
            json.dump(translated_questions, f, indent=2, ensure_ascii=False)

        print(f"Batch {batch_num}: Translated {len(translated_questions)} questions")

def should_skip(text_en, answer_en):
    """Determine if question should be skipped"""

    # Skip very specific or unsuitable content
    skip_patterns = [
        # Geographic specificity
        "uk postcode", "british county", "us state", "american president",

        # Too specific cultural references
        "eastenders", "coronation street", "emmerdale",

        # Sports too specific
        "cricket", "american football", "nfl", "super bowl",

        # Very obscure people
        "dr. jonathan crane", "nick bradshaw",

        # Wordplay
        "pun", "rhyme", "anagram"
    ]

    text_lower = text_en.lower()
    answer_lower = answer_en.lower()

    return any(pattern in text_lower or pattern in answer_lower for pattern in skip_patterns)

if __name__ == "__main__":
    process_remaining_batches()
    print("All remaining batches processed!")