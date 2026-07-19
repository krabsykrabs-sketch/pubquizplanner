#!/usr/bin/env python3
import json

def generate_fun_fact(text, answer, category):
    """Generate appropriate fun facts for questions"""
    text_lower = text.lower()
    answer_lower = answer.lower()

    # Geography facts
    if category == 'Geographie':
        if 'taschkent' in answer_lower:
            return "Taschkent ist mit über 2,5 Millionen Einwohnern die größte Stadt Zentralasiens."
        elif 'abu dhabi' in answer_lower:
            return "Abu Dhabi besitzt etwa 8% der weltweiten Ölreserven."
        elif 'washington' in answer_lower:
            return "Washington D.C. wurde nach George Washington benannt und liegt zwischen Maryland und Virginia."
        elif 'minsk' in answer_lower:
            return "Minsk wurde im Zweiten Weltkrieg fast vollständig zerstört und später wieder aufgebaut."
        elif 'bangui' in answer_lower:
            return "Bangui liegt am Ubangi-Fluss und ist das wichtigste Handelszentrum der Zentralafrikanischen Republik."
        elif 'kanada' in answer_lower:
            return "Neufundland war die zehnte kanadische Provinz, die 1949 der Konföderation beitrat."
        elif 'frankreich' in answer_lower:
            return "Martinique ist ein französisches Überseedepartement und verwendet den Euro als Währung."

    # Film & TV facts
    elif category == 'Film&TV':
        if 'mount rushmore' in answer_lower:
            return "Die Verfolgungsjagd am Mount Rushmore wurde teilweise mit Miniaturmodellen gedreht."
        elif 'john mcclane' in answer_lower:
            return "Bruce Willis improvisierte viele seiner Dialoge als John McClane in 'Stirb langsam'."
        elif 'han solo' in answer_lower:
            return "Harrison Ford bat George Lucas ursprünglich, Han Solo in 'Das Imperium schlägt zurück' sterben zu lassen."
        elif 'goldfinger' in answer_lower:
            return "Gert Fröbe sprach kein Englisch und wurde in 'Goldfinger' nachsynchronisiert."
        elif 'orson welles' in answer_lower:
            return "Orson Welles improvisierte seine berühmte 'Kuckucksuhr'-Rede in 'Der dritte Mann'."
        elif 'vertigo' in answer_lower:
            return "Hitchcock litt selbst unter Höhenangst, was ihn zu 'Vertigo' inspirierte."

    # Science facts
    elif category == 'Wissenschaft':
        if 'blei' in answer_lower:
            return "Blei war den Römern als 'plumbum' bekannt - daher stammt das chemische Symbol Pb."
        elif 'radfahren' in answer_lower:
            return "Der Moderne Fünfkampf umfasst Fechten, Schwimmen, Reiten, Laufen und Schießen."

    # Food & Drink facts
    elif category == 'Essen&Trinken':
        if 'zimt' in answer_lower:
            return "Zimt war im Mittelalter wertvoller als Gold und wurde als Gewürz und Heilmittel verwendet."

    # History facts
    elif category == 'Geschichte':
        if 'heinrich brüning' in answer_lower:
            return "Heinrich Brüning wurde 'Hungerkanzler' genannt wegen seiner harten Sparpolitik während der Weltwirtschaftskrise."

    # General knowledge facts
    elif category == 'Allgemeinwissen':
        if 'adler' in answer_lower:
            return "Seeadlernester können bis zu 2 Meter breit und 3 Meter hoch werden und über Jahre genutzt werden."
        elif '6 stunden' in answer_lower:
            return "Ebbe und Flut entstehen durch die Gravitationskraft des Mondes auf die Ozeane der Erde."

    # Default fun facts by category
    if category == 'Film&TV':
        return "Dieser Film gehört zu den Klassikern des Kinos der 70er und 80er Jahre."
    elif category == 'Geographie':
        return "Diese geografische Tatsache ist wichtiges Grundwissen für jeden Weltenbummler."
    elif category == 'Geschichte':
        return "Diese historische Tatsache zeigt wichtige Wendepunkte der deutschen Geschichte auf."
    elif category == 'Wissenschaft':
        return "Dieses Wissen stammt aus den Grundlagen der Naturwissenschaften."
    else:
        return "Ein interessantes Detail aus dem Bereich des Allgemeinwissens."

def should_skip_question(text, answer):
    """Determine if a question should be skipped based on criteria"""
    text_lower = text.lower()
    answer_lower = answer.lower()

    # Skip multiple choice indicators
    if any(phrase in text_lower for phrase in [
        'was ist keine', 'welche rechtschreibung', 'was ist kein',
        'welche schreibweise', 'welche sportart gehört nicht'
    ]):
        return True

    # Skip problematic/ambiguous questions
    problematic_answers = [
        'alle tragen elfenbein',
        'whity weisman',  # Potentially incorrect/outdated
    ]
    if any(phrase in answer_lower for phrase in problematic_answers):
        return True

    # Skip garbled or unclear questions
    if text.count('?') > 1 or text.startswith('?') or len(text.strip()) < 10:
        return True

    # Skip incomplete questions that are just place names
    if (len(text.split()) <= 4 and
        not text.strip().endswith('?') and
        not any(word in text_lower for word in ['was', 'wie', 'wer', 'wo', 'welch', 'wann', 'warum', 'wieviel'])):
        return True

    return False

def clean_question_text(text):
    """Clean up question text"""
    text = text.strip()

    # Fix incomplete geography questions
    geography_fixes = {
        'Vereinigte Arabische Emirate?': 'Was ist die Hauptstadt der Vereinigten Arabischen Emirate?',
        'Vereinigte Staaten von Amerika?': 'Was ist die Hauptstadt der Vereinigten Staaten von Amerika?',
        'Zentralafrikanische Republik?': 'Was ist die Hauptstadt der Zentralafrikanischen Republik?'
    }

    if text in geography_fixes:
        return geography_fixes[text]

    return text

def determine_difficulty(text, answer, original_difficulty):
    """Determine appropriate difficulty level"""
    text_lower = text.lower()
    answer_lower = answer.lower()

    # Easy questions (difficulty 1)
    easy_indicators = [
        'washington', 'taschkent', 'vatikanstadt', 'minsk',  # Major capitals
        'zimt', 'schlangen', 'han solo', 'john mcclane',  # Very well-known facts
        '16'  # Basic chess knowledge
    ]

    # Hard questions (difficulty 3)
    hard_indicators = [
        'plumbum', 'blei', 'heinrich brüning', 'bangui',  # Specialized knowledge
        'la mamma morta', 'eloy', 'whity weisman',  # Obscure movie details
        '5 dollar'  # Very specific film details
    ]

    if any(indicator in answer_lower for indicator in easy_indicators):
        return 1
    elif any(indicator in answer_lower for indicator in hard_indicators):
        return 3
    else:
        return 2  # Medium difficulty

def process_questions():
    """Main processing function"""
    # Read the input file
    with open('data/pipeline/quizpro_batches/batch_09.json', 'r', encoding='utf-8') as f:
        questions = json.load(f)

    approved_questions = []

    category_mapping = {
        'geographie': 'Geographie',
        'film&tv': 'Film&TV',
        'essen&trinken': 'Essen&Trinken',
        'wissenschaft': 'Wissenschaft',
        'geschichte': 'Geschichte',
        'allgemeinwissen': 'Allgemeinwissen',
        'sport': 'Sport',
        'musik': 'Musik',
        'literatur': 'Literatur',
        'kunst&kultur': 'Kunst&Kultur',
        'technik': 'Technik',
        'sprache': 'Sprache',
        'popkultur': 'Popkultur',
        'logik&mathe': 'Logik&Mathe'
    }

    for q in questions:
        text = q['text_de']
        answer = q['answer_de']

        # Skip problematic questions
        if should_skip_question(text, answer):
            continue

        # Clean up text and answer
        cleaned_text = clean_question_text(text)
        cleaned_answer = answer.strip()

        # Determine category
        category = category_mapping.get(q['_source_category'], 'Allgemeinwissen')

        # Determine difficulty
        difficulty = determine_difficulty(cleaned_text, cleaned_answer, q.get('difficulty', 2))

        # Generate tags
        tags = []
        if 'hauptstadt' in cleaned_text.lower():
            tags.append('Hauptstädte')
        if category == 'Film&TV':
            if any(word in cleaned_text.lower() for word in ['bond', 'james']):
                tags.append('James Bond')
            else:
                tags.append('Klassiker')
        if 'element' in cleaned_text.lower() or 'lateinisch' in cleaned_text.lower():
            tags.append('Chemie')

        # Generate fun fact
        fun_fact = generate_fun_fact(cleaned_text, cleaned_answer, category)

        # Create cleaned question
        cleaned_question = {
            '_batch_index': q['_batch_index'],
            'text_de': cleaned_text,
            'answer_de': cleaned_answer,
            'category': category,
            'difficulty': difficulty,
            'fun_fact_de': fun_fact,
            'tags': tags
        }

        approved_questions.append(cleaned_question)

    # Write output file
    with open('data/pipeline/quizpro_batches/batch_09_reviewed.json', 'w', encoding='utf-8') as f:
        json.dump(approved_questions, f, indent=2, ensure_ascii=False)

    print(f"Processed {len(questions)} questions")
    print(f"Approved {len(approved_questions)} questions")
    print(f"Rejected {len(questions) - len(approved_questions)} questions")

    return approved_questions

if __name__ == '__main__':
    approved = process_questions()