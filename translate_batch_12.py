#!/usr/bin/env python3
import json

# Read batch_12.json
with open('/home/jan/PubQuiz/pubquizplanner/data/pipeline/reddit/batches/batch_12.json', 'r') as f:
    questions = json.load(f)

translated_questions = []

# Sample good questions from batch_12 for translation
good_questions = {
    "What name is given to an area of high pressure which brings long periods of settled weather?": {
        "text_de": "Wie nennt man ein Hochdruckgebiet, das lange Perioden stabilen Wetters bringt?",
        "answer_de": "Antizyklone",
        "fun_fact_de": "Antizyklone drehen sich auf der Nordhalbkugel im Uhrzeigersinn und bringen meist sonniges, trockenes Wetter.",
        "difficulty": 3,
        "tags": ["Wissenschaft"]
    },
    "The narrow bands of strong winds which move around the world between about six and twelve miles high are called what?": {
        "text_de": "Wie nennt man die schmalen Bänder starker Winde, die in etwa 10-20 km Höhe um die Welt ziehen?",
        "answer_de": "Jetstream",
        "fun_fact_de": "Jetstreams können Geschwindigkeiten von über 400 km/h erreichen und beeinflussen stark das Wetter und den Flugverkehr.",
        "difficulty": 3,
        "tags": ["Wissenschaft"]
    },
    "What is the line on a weather map that links points with the same temperature?": {
        "text_de": "Wie nennt man die Linie auf einer Wetterkarte, die Punkte mit der gleichen Temperatur verbindet?",
        "answer_de": "Isotherme",
        "fun_fact_de": "Isothermen helfen Meteorologen dabei, Temperaturgradienten zu visualisieren und Wetterfronten zu identifizieren.",
        "difficulty": 3,
        "tags": ["Wissenschaft"]
    },
    "What word is used to describe the amount of water vapour present in the air?": {
        "text_de": "Welches Wort beschreibt die Menge an Wasserdampf in der Luft?",
        "answer_de": "Luftfeuchtigkeit",
        "fun_fact_de": "Die relative Luftfeuchtigkeit gibt an, wie viel Wasserdampf die Luft im Verhältnis zur maximalen Aufnahmekapazität enthält.",
        "difficulty": 2,
        "tags": ["Wissenschaft"]
    },
    "Using which scale would you define a storm as force 10 or a Light Breeze as a force 2?": {
        "text_de": "Mit welcher Skala würde man einen Sturm als Stärke 10 oder eine leichte Brise als Stärke 2 definieren?",
        "answer_de": "Beaufortskala",
        "fun_fact_de": "Die Beaufortskala wurde 1805 von Sir Francis Beaufort entwickelt und reicht von 0 (Windstille) bis 12 (Orkan).",
        "difficulty": 2,
        "tags": ["Wissenschaft"]
    },
    "What name is given to a scientist who studies weather and climate?": {
        "text_de": "Wie nennt man einen Wissenschaftler, der Wetter und Klima erforscht?",
        "answer_de": "Meteorologe",
        "fun_fact_de": "Der Begriff Meteorologie stammt vom griechischen Wort 'meteoron' ab, was 'Himmelserscheinung' bedeutet.",
        "difficulty": 2,
        "tags": ["Wissenschaft"]
    },
    "What word describes a climatic zone that has wet and hot weather conditions all year round?": {
        "text_de": "Welches Wort beschreibt eine Klimazone mit ganzjährig feuchten und heißen Wetterbedingungen?",
        "answer_de": "Tropisch",
        "fun_fact_de": "Das tropische Klima findet sich zwischen den Wendekreisen und zeichnet sich durch geringe Temperaturschwankungen aus.",
        "difficulty": 2,
        "tags": ["Wissenschaft"]
    },
    "The vast majority of weather takes place in what part of our atmosphere?": {
        "text_de": "In welchem Teil unserer Atmosphäre findet der Großteil des Wettergeschehens statt?",
        "answer_de": "Troposphäre",
        "fun_fact_de": "Die Troposphäre reicht bis etwa 10-15 km Höhe und enthält etwa 80% der gesamten Atmosphärenmasse.",
        "difficulty": 3,
        "tags": ["Wissenschaft"]
    },
    "What was the name of the character played by Jodie Foster in the film Silence of the Lambs?": {
        "text_de": "Wie hieß die von Jodie Foster gespielte Figur im Film 'Das Schweigen der Lämmer'?",
        "answer_de": "Clarice Starling",
        "fun_fact_de": "Jodie Foster gewann für diese Rolle den Oscar als beste Hauptdarstellerin und der Film gilt als Klassiker des Psychothrillers.",
        "difficulty": 2,
        "tags": ["Film-TV"]
    },
    "Often regarded as one of the greatest comedians of all time, who voiced the Genie in Disney's animated Aladdin film of 1992?": {
        "text_de": "Wer sprach den Dschinni in Disneys Zeichentrickfilm 'Aladdin' von 1992 und gilt als einer der größten Komiker aller Zeiten?",
        "answer_de": "Robin Williams",
        "fun_fact_de": "Robin Williams improvisierte viele seiner Zeilen als Dschinni, was den Animatoren zusätzliche Arbeit bescherte, aber dem Film seinen besonderen Charme verlieh.",
        "difficulty": 2,
        "tags": ["Film-TV"]
    },
    "Which explorer famously circumnavigated the world, thought to have been the first Englishman to do so, between 1577 and 1580?": {
        "text_de": "Welcher Entdecker umsegelte berühmt zwischen 1577 und 1580 die Welt und war vermutlich der erste Engländer, der dies tat?",
        "answer_de": "Sir Francis Drake",
        "fun_fact_de": "Francis Drake war auch ein Pirat, der im Auftrag der englischen Krone spanische Schiffe überfiel und dabei große Reichtümer erbeutete.",
        "difficulty": 3,
        "tags": ["Geschichte"]
    },
    "In golf a hole score of two strokes fewer than par (two under par, −2) is known as a what?": {
        "text_de": "Wie nennt man im Golf ein Ergebnis von zwei Schlägen unter Par (-2)?",
        "answer_de": "Eagle",
        "fun_fact_de": "Ein Eagle ist seltener als ein Birdie (ein Schlag unter Par) und häufiger als ein Albatros (drei Schläge unter Par).",
        "difficulty": 2,
        "tags": ["Sport"]
    },
    "What is the name of the spaceship in Star Wars that made the Kessel run in less than twelve parsecs?": {
        "text_de": "Wie heißt das Raumschiff in Star Wars, das den Kessel-Run in weniger als zwölf Parsec schaffte?",
        "answer_de": "Millennium Falke",
        "fun_fact_de": "Der Millennium Falke wurde von Han Solo und Chewbacca geflogen und galt trotz seines ramponiert Aussehens als eines der schnellsten Schiffe der Galaxis.",
        "difficulty": 2,
        "tags": ["Film-TV"]
    },
    "Who is the famous forest dwelling English folk outlaw who stole from the rich and gave to the poor?": {
        "text_de": "Wer ist der berühmte englische Volksheld, der im Wald lebte, von den Reichen stahl und den Armen gab?",
        "answer_de": "Robin Hood",
        "fun_fact_de": "Robin Hood ist eine legendäre Figur der englischen Folklore, die seit dem Mittelalter in unzähligen Geschichten, Filmen und Büchern verewigt wurde.",
        "difficulty": 1,
        "tags": ["Allgemeinwissen"]
    }
}

for q in questions:
    text_en = q['text_en']

    # Skip questions that are very specific or unsuitable
    skip_terms = [
        "In 1848 a local newspaper from which European city",  # Too specific
        "Dr. Jonathan Crane",  # Too niche comic knowledge
        "Nick Bradshaw",  # Too specific movie detail
        "Goose"  # Character nickname from specific movie
    ]

    skip = any(term in text_en for term in skip_terms)

    if not skip and text_en in good_questions:
        trans = good_questions[text_en]
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
with open('/home/jan/PubQuiz/pubquizplanner/data/pipeline/reddit/batches/batch_12_output.json', 'w') as f:
    json.dump(translated_questions, f, indent=2, ensure_ascii=False)

print(f"Processed {len(questions)} questions, translated {len(translated_questions)} questions")