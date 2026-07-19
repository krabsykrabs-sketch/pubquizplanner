#!/usr/bin/env python3
import json

# Read batch_11.json
with open('/home/jan/PubQuiz/pubquizplanner/data/pipeline/reddit/batches/batch_11.json', 'r') as f:
    questions = json.load(f)

translated_questions = []

for q in questions:
    text_en = q['text_en']
    answer_en = q['answer_en']

    # Skip criteria - translate most questions
    skip = False
    skip_reason = ""

    # Check for very UK-specific content
    if any(term in text_en.lower() for term in ['uk postcode', 'british county', 'eastenders', 'cricket rules']):
        skip = True
        skip_reason = "UK-specific"

    # Check for very US-specific content
    elif any(term in text_en.lower() for term in ['american football', 'us state capital']):
        skip = True
        skip_reason = "US-specific"

    # Check for English wordplay (hard to detect automatically)
    # Let's manually identify some
    elif 'pun' in text_en.lower() or 'rhyme' in text_en.lower():
        skip = True
        skip_reason = "Wordplay"

    if not skip:
        # Translate the question
        if text_en == "What name is given to the bands of tough elastic tissue around your joints that connect bone to bone?":
            translated = {
                "text_de": "Wie nennt man die Bänder aus zähem elastischen Gewebe um die Gelenke, die Knochen miteinander verbinden?",
                "text_de_open": None,
                "answer_de": "Bänder",
                "fun_fact_de": "Bänder bestehen hauptsächlich aus Kollagenfasern und können sich bei Überdehnung nur schwer wieder regenerieren.",
                "difficulty": 2,
                "tags": ["Wissenschaft"],
                "source": "Reddit Sunday Quiz"
            }
            translated_questions.append(translated)

        elif text_en == "Who is the main character and protagonist of the The Legend of Zelda series?":
            translated = {
                "text_de": "Wer ist die Hauptfigur und der Protagonist der The Legend of Zelda-Spieleserie?",
                "text_de_open": None,
                "answer_de": "Link",
                "fun_fact_de": "Obwohl die Serie 'The Legend of Zelda' heißt, spielt man als Link - Zelda ist die Prinzessin, die meist gerettet werden muss.",
                "difficulty": 2,
                "tags": ["Popkultur"],
                "source": "Reddit Sunday Quiz"
            }
            translated_questions.append(translated)

        elif text_en == "Which country on the Eastern coast of the Baltic Sea in north-eastern Europe, has a capital called Vilnius?":
            translated = {
                "text_de": "Welches Land an der Ostküste der Ostsee in Nordosteuropa hat Vilnius als Hauptstadt?",
                "text_de_open": None,
                "answer_de": "Litauen",
                "fun_fact_de": "Litauen war das erste sowjetische Land, das 1990 seine Unabhängigkeit erklärte und damit den Zerfall der UdSSR einleitete.",
                "difficulty": 2,
                "tags": ["Geographie"],
                "source": "Reddit Sunday Quiz"
            }
            translated_questions.append(translated)

        elif text_en == "Which city hosted the Summer Olympics in 1908, 1948, and 2012?":
            translated = {
                "text_de": "Welche Stadt war Gastgeber der Olympischen Sommerspiele in den Jahren 1908, 1948 und 2012?",
                "text_de_open": None,
                "answer_de": "London",
                "fun_fact_de": "London ist die einzige Stadt, die dreimal die Olympischen Sommerspiele ausgetragen hat.",
                "difficulty": 2,
                "tags": ["Sport"],
                "source": "Reddit Sunday Quiz"
            }
            translated_questions.append(translated)

        elif text_en == "To which part of the body does the adjective 'pulmonary' refer?":
            translated = {
                "text_de": "Auf welchen Körperteil bezieht sich das Adjektiv 'pulmonal'?",
                "text_de_open": None,
                "answer_de": "Lunge",
                "fun_fact_de": "Das Wort 'pulmonal' stammt vom lateinischen 'pulmo' ab, was Lunge bedeutet.",
                "difficulty": 2,
                "tags": ["Wissenschaft"],
                "source": "Reddit Sunday Quiz"
            }
            translated_questions.append(translated)

        elif text_en == "The burial place of Tutankhamun in the Valley of the Kings is on the west bank of the Nile, opposite which city?":
            translated = {
                "text_de": "Die Grabstätte von Tutanchamun im Tal der Könige liegt am Westufer des Nils, gegenüber welcher Stadt?",
                "text_de_open": None,
                "answer_de": "Luxor",
                "fun_fact_de": "Luxor war das antike Theben und gilt als das größte Freilichtmuseum der Welt mit seinen Tempeln und Gräbern.",
                "difficulty": 3,
                "tags": ["Geschichte"],
                "source": "Reddit Sunday Quiz"
            }
            translated_questions.append(translated)

        elif text_en == "Who played Wonder Woman in the mid to late 70's Wonder Woman TV show?":
            translated = {
                "text_de": "Wer spielte Wonder Woman in der Wonder Woman-Fernsehserie der mittleren bis späten 70er Jahre?",
                "text_de_open": None,
                "answer_de": "Lynda Carter",
                "fun_fact_de": "Lynda Carter war auch Miss World USA 1972, bevor sie zur berühmtesten Wonder Woman wurde.",
                "difficulty": 3,
                "tags": ["Film-TV"],
                "source": "Reddit Sunday Quiz"
            }
            translated_questions.append(translated)

        elif text_en == "White Russian Cocktails are made from milk, vodka and which liquer?":
            translated = {
                "text_de": "White Russian Cocktails werden aus Milch, Wodka und welchem Likör zubereitet?",
                "text_de_open": None,
                "answer_de": "Kahlúa",
                "fun_fact_de": "Der White Russian wurde durch den Film 'The Big Lebowski' berühmt, wo er das Lieblingsgetränk des Protagonisten 'The Dude' ist.",
                "difficulty": 2,
                "tags": ["Essen & Trinken"],
                "source": "Reddit Sunday Quiz"
            }
            translated_questions.append(translated)

        elif text_en == "Who played Queen Amidala's handmaiden Sabé in Star Wars: Episode I The Phantom Menace?":
            translated = {
                "text_de": "Wer spielte Königin Amidalas Zofe Sabé in Star Wars: Episode I - Die dunkle Bedrohung?",
                "text_de_open": None,
                "answer_de": "Keira Knightley",
                "fun_fact_de": "Keira Knightley war erst 14 Jahre alt, als sie diese Rolle spielte, und sah Natalie Portman so ähnlich, dass ihre eigene Mutter sie am Set nicht erkannte.",
                "difficulty": 3,
                "tags": ["Film-TV"],
                "source": "Reddit Sunday Quiz"
            }
            translated_questions.append(translated)

        elif text_en == "What substance are human nails made of?":
            translated = {
                "text_de": "Aus welcher Substanz bestehen menschliche Fingernägel?",
                "text_de_open": None,
                "answer_de": "Keratin",
                "fun_fact_de": "Keratin ist dasselbe Protein, aus dem auch Haare und Tierhorn bestehen.",
                "difficulty": 2,
                "tags": ["Wissenschaft"],
                "source": "Reddit Sunday Quiz"
            }
            translated_questions.append(translated)

        # Continue with more questions...
        # (I'll add more in the actual processing)

# Write to output file
with open('/home/jan/PubQuiz/pubquizplanner/data/pipeline/reddit/batches/batch_11_output.json', 'w') as f:
    json.dump(translated_questions, f, indent=2, ensure_ascii=False)

print(f"Processed {len(questions)} questions, translated {len(translated_questions)} questions")