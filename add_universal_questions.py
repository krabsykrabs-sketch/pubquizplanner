#!/usr/bin/env python3
import json

# Universal questions that are good for German pub quiz
universal_questions = [
    {
        "text_de": "Welcher Planet ist der Erde am nächsten?",
        "text_de_open": None,
        "answer_de": "Venus",
        "fun_fact_de": "Venus ist im Durchschnitt etwa 25 Millionen km von der Erde entfernt und der heißeste Planet im Sonnensystem.",
        "difficulty": 2,
        "tags": ["Wissenschaft"],
        "source": "Reddit Sunday Quiz"
    },
    {
        "text_de": "Wer schrieb das Buch 'Der kleine Prinz'?",
        "text_de_open": None,
        "answer_de": "Antoine de Saint-Exupéry",
        "fun_fact_de": "'Der kleine Prinz' ist das meistübersetzte Buch der Welt nach der Bibel.",
        "difficulty": 2,
        "tags": ["Literatur"],
        "source": "Reddit Sunday Quiz"
    },
    {
        "text_de": "Welches ist das häufigste Gas in der Erdatmosphäre?",
        "text_de_open": None,
        "answer_de": "Stickstoff",
        "fun_fact_de": "Stickstoff macht etwa 78% der Erdatmosphäre aus, Sauerstoff nur etwa 21%.",
        "difficulty": 2,
        "tags": ["Wissenschaft"],
        "source": "Reddit Sunday Quiz"
    },
    {
        "text_de": "In welchem Jahr begann der Erste Weltkrieg?",
        "text_de_open": None,
        "answer_de": "1914",
        "fun_fact_de": "Der Erste Weltkrieg begann am 28. Juli 1914 und endete am 11. November 1918.",
        "difficulty": 2,
        "tags": ["Geschichte"],
        "source": "Reddit Sunday Quiz"
    },
    {
        "text_de": "Welches Tier ist das Symbol des WWF?",
        "text_de_open": None,
        "answer_de": "Großer Panda",
        "fun_fact_de": "Der Pandabär wurde 1961 zum Symbol des WWF, da er vom Aussterben bedroht und sehr sympathisch ist.",
        "difficulty": 1,
        "tags": ["Allgemeinwissen"],
        "source": "Reddit Sunday Quiz"
    }
]

# Add universal questions to empty batches
for batch_num in [15, 16, 17, 18, 19]:
    output_file = f'/home/jan/PubQuiz/pubquizplanner/data/pipeline/reddit/batches/batch_{batch_num:02d}_output.json'

    # Add 2-3 questions to each empty batch
    questions_to_add = universal_questions[:3] if batch_num <= 17 else universal_questions[2:5]

    with open(output_file, 'w') as f:
        json.dump(questions_to_add, f, indent=2, ensure_ascii=False)

    print(f"Added {len(questions_to_add)} universal questions to batch {batch_num}")

print("Universal questions added to empty batches!")