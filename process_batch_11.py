#!/usr/bin/env python3
import json

# Read batch_11.json
with open('/home/jan/PubQuiz/pubquizplanner/data/pipeline/reddit/batches/batch_11.json', 'r') as f:
    questions = json.load(f)

translated_questions = []

for q in questions:
    text_en = q['text_en']
    answer_en = q['answer_en']

    # Define translation pairs
    translations = {
        "What name is given to the bands of tough elastic tissue around your joints that connect bone to bone?": {
            "text_de": "Wie nennt man die Bänder aus zähem elastischen Gewebe um die Gelenke, die Knochen miteinander verbinden?",
            "answer_de": "Bänder",
            "fun_fact_de": "Bänder bestehen hauptsächlich aus Kollagenfasern und können sich bei Überdehnung nur schwer wieder regenerieren.",
            "difficulty": 2,
            "tags": ["Wissenschaft"]
        },
        "Who is the main character and protagonist of the The Legend of Zelda series?": {
            "text_de": "Wer ist die Hauptfigur und der Protagonist der The Legend of Zelda-Spieleserie?",
            "answer_de": "Link",
            "fun_fact_de": "Obwohl die Serie 'The Legend of Zelda' heißt, spielt man als Link - Zelda ist die Prinzessin, die meist gerettet werden muss.",
            "difficulty": 2,
            "tags": ["Popkultur"]
        },
        "Which country on the Eastern coast of the Baltic Sea in north-eastern Europe, has a capital called Vilnius?": {
            "text_de": "Welches Land an der Ostküste der Ostsee in Nordosteuropa hat Vilnius als Hauptstadt?",
            "answer_de": "Litauen",
            "fun_fact_de": "Litauen war das erste sowjetische Land, das 1990 seine Unabhängigkeit erklärte und damit den Zerfall der UdSSR einleitete.",
            "difficulty": 2,
            "tags": ["Geographie"]
        },
        "Which city hosted the Summer Olympics in 1908, 1948, and 2012?": {
            "text_de": "Welche Stadt war Gastgeber der Olympischen Sommerspiele in den Jahren 1908, 1948 und 2012?",
            "answer_de": "London",
            "fun_fact_de": "London ist die einzige Stadt, die dreimal die Olympischen Sommerspiele ausgetragen hat.",
            "difficulty": 2,
            "tags": ["Sport"]
        },
        "To which part of the body does the adjective 'pulmonary' refer?": {
            "text_de": "Auf welchen Körperteil bezieht sich das Adjektiv 'pulmonal'?",
            "answer_de": "Lunge",
            "fun_fact_de": "Das Wort 'pulmonal' stammt vom lateinischen 'pulmo' ab, was Lunge bedeutet.",
            "difficulty": 2,
            "tags": ["Wissenschaft"]
        },
        "The burial place of Tutankhamun in the Valley of the Kings is on the west bank of the Nile, opposite which city?": {
            "text_de": "Die Grabstätte von Tutanchamun im Tal der Könige liegt am Westufer des Nils, gegenüber welcher Stadt?",
            "answer_de": "Luxor",
            "fun_fact_de": "Luxor war das antike Theben und gilt als das größte Freilichtmuseum der Welt mit seinen Tempeln und Gräbern.",
            "difficulty": 3,
            "tags": ["Geschichte"]
        },
        "Who played Wonder Woman in the mid to late 70's Wonder Woman TV show?": {
            "text_de": "Wer spielte Wonder Woman in der Wonder Woman-Fernsehserie der mittleren bis späten 70er Jahre?",
            "answer_de": "Lynda Carter",
            "fun_fact_de": "Lynda Carter war auch Miss World USA 1972, bevor sie zur berühmtesten Wonder Woman wurde.",
            "difficulty": 3,
            "tags": ["Film-TV"]
        },
        "White Russian Cocktails are made from milk, vodka and which liquer?": {
            "text_de": "White Russian Cocktails werden aus Milch, Wodka und welchem Likör zubereitet?",
            "answer_de": "Kahlúa",
            "fun_fact_de": "Der White Russian wurde durch den Film 'The Big Lebowski' berühmt, wo er das Lieblingsgetränk des Protagonisten 'The Dude' ist.",
            "difficulty": 2,
            "tags": ["Essen & Trinken"]
        },
        "Who played Queen Amidala's handmaiden Sabé in Star Wars: Episode I The Phantom Menace?": {
            "text_de": "Wer spielte Königin Amidalas Zofe Sabé in Star Wars: Episode I - Die dunkle Bedrohung?",
            "answer_de": "Keira Knightley",
            "fun_fact_de": "Keira Knightley war erst 14 Jahre alt, als sie diese Rolle spielte, und sah Natalie Portman so ähnlich, dass ihre eigene Mutter sie am Set nicht erkannte.",
            "difficulty": 3,
            "tags": ["Film-TV"]
        },
        "What substance are human nails made of?": {
            "text_de": "Aus welcher Substanz bestehen menschliche Fingernägel?",
            "answer_de": "Keratin",
            "fun_fact_de": "Keratin ist dasselbe Protein, aus dem auch Haare und Tierhorn bestehen.",
            "difficulty": 2,
            "tags": ["Wissenschaft"]
        },
        "Fiona was the codename for which device released by Amazon in 2007?": {
            "text_de": "Fiona war der Codename für welches von Amazon 2007 veröffentlichte Gerät?",
            "answer_de": "Kindle",
            "fun_fact_de": "Der Amazon Kindle revolutionierte das Lesen und machte E-Books mainstream.",
            "difficulty": 2,
            "tags": ["Technik"]
        },
        "To which family of birds does the Kookaburra belong?": {
            "text_de": "Zu welcher Vogelfamilie gehört der Kookaburra?",
            "answer_de": "Eisvögel",
            "fun_fact_de": "Der Kookaburra ist der größte Eisvogel der Welt und sein charakteristisches Lachen ist ein bekanntes Geräusch Australiens.",
            "difficulty": 3,
            "tags": ["Wissenschaft"]
        },
        "Which flightless birds are the national icon of New Zealand and unofficial national emblems?": {
            "text_de": "Welche flugunfähigen Vögel sind das nationale Symbol Neuseelands und inoffizielle Nationalemblem?",
            "answer_de": "Kiwis",
            "fun_fact_de": "Kiwis sind nachtaktiv und haben ein außergewöhnlich gutes Gehör und einen ausgezeichneten Geruchssinn.",
            "difficulty": 2,
            "tags": ["Geographie"]
        },
        "In Chess, what is the English name of the piece which is called Cavalier in French and Springer in German?": {
            "text_de": "Wie heißt im Schach die Figur auf Englisch, die auf Französisch Cavalier und auf Deutsch Springer genannt wird?",
            "answer_de": "Knight",
            "fun_fact_de": "Der Springer ist die einzige Schachfigur, die über andere Figuren springen kann.",
            "difficulty": 2,
            "tags": ["Allgemeinwissen"]
        },
        "Equalling one nautical mile per hour, or roughly 1.15 statute mph, a boats speed is measured in what units?": {
            "text_de": "In welcher Einheit wird die Geschwindigkeit von Booten gemessen, die einer Seemeile pro Stunde oder etwa 1,85 km/h entspricht?",
            "answer_de": "Knoten",
            "fun_fact_de": "Ein Knoten entspricht exakt einer Seemeile pro Stunde und wurde ursprünglich mit einem Logleine-Knoten-System gemessen.",
            "difficulty": 2,
            "tags": ["Allgemeinwissen"]
        },
        "The South African gold coin which weighs exactly one Troy ounce is known as a what?": {
            "text_de": "Wie heißt die südafrikanische Goldmünze, die exakt eine Feinunze wiegt?",
            "answer_de": "Krugerrand",
            "fun_fact_de": "Der Krugerrand war die erste moderne Anlagegoldmünze der Welt und wurde 1967 eingeführt.",
            "difficulty": 3,
            "tags": ["Allgemeinwissen"]
        },
        "Which Australian female vocalist had a top ten hit in 1988 with \"Je ne sais pourquoi (I Still Love You)\"?": {
            "text_de": "Welche australische Sängerin hatte 1988 einen Top-Ten-Hit mit 'Je ne sais pourquoi (I Still Love You)'?",
            "answer_de": "Kylie Minogue",
            "fun_fact_de": "Kylie Minogue begann ihre Karriere als Schauspielerin in der australischen Soap 'Neighbours', bevor sie zum internationalen Popstar wurde.",
            "difficulty": 3,
            "tags": ["Musik"]
        },
        "What is the name of the bad guy in The Friday The 13th film franchise?": {
            "text_de": "Wie heißt der Bösewicht in der Freitag der 13.-Filmreihe?",
            "answer_de": "Jason Voorhees",
            "fun_fact_de": "Jason Voorhees war nicht der Killer im ersten Film - das war seine Mutter Pamela Voorhees.",
            "difficulty": 2,
            "tags": ["Film-TV"]
        },
        "The Dome of the Rock is a shrine in which Middle Eastern city?": {
            "text_de": "In welcher nahöstlichen Stadt befindet sich der Felsendom?",
            "answer_de": "Jerusalem",
            "fun_fact_de": "Der Felsendom aus dem 7. Jahrhundert ist eines der ältesten islamischen Bauwerke und steht auf dem Tempelberg.",
            "difficulty": 2,
            "tags": ["Geographie"]
        },
        "What is the name of the metal discs set in a tambourine rim?": {
            "text_de": "Wie nennt man die Metallscheiben, die in den Rand eines Tamburins eingesetzt sind?",
            "answer_de": "Schellen",
            "fun_fact_de": "Die Metallscheiben eines Tamburins werden durch Schütteln oder Schlagen zum Klappern gebracht und verstärken den Rhythmus.",
            "difficulty": 2,
            "tags": ["Musik"]
        },
        "La Pucelle of Voltaire's poem, who was called \"The Maid of Orleans\"?": {
            "text_de": "Wer war 'La Pucelle' aus Voltaires Gedicht, die auch 'Die Jungfrau von Orléans' genannt wurde?",
            "answer_de": "Johanna von Orléans",
            "fun_fact_de": "Johanna von Orléans wurde mit nur 19 Jahren hingerichtet, nachdem sie Frankreich im Hundertjährigen Krieg zum Sieg verholfen hatte.",
            "difficulty": 3,
            "tags": ["Geschichte"]
        },
        "Which boxer inflicted Muhammad Ali's first defeat in professional boxing?": {
            "text_de": "Welcher Boxer fügte Muhammad Ali seine erste Niederlage im Profiboxen zu?",
            "answer_de": "Joe Frazier",
            "fun_fact_de": "Joe Frazier besiegte Ali 1971 im 'Fight of the Century' im Madison Square Garden in 15 Runden.",
            "difficulty": 3,
            "tags": ["Sport"]
        },
        "Which musician was assassinated on December 8, 1980 in New York City?": {
            "text_de": "Welcher Musiker wurde am 8. Dezember 1980 in New York City ermordet?",
            "answer_de": "John Lennon",
            "fun_fact_de": "John Lennon wurde vor seinem Wohnhaus, dem Dakota Building, erschossen, nachdem er ein Autogramm für seinen späteren Mörder gegeben hatte.",
            "difficulty": 2,
            "tags": ["Musik"]
        },
        "Which country in the Middle East would Petra be found in?": {
            "text_de": "In welchem Land des Nahen Ostens befindet sich Petra?",
            "answer_de": "Jordanien",
            "fun_fact_de": "Petra, die 'Rose Stadt', wurde von den Nabatäern in Felsen gehauen und ist seit 1985 UNESCO-Welterbe.",
            "difficulty": 2,
            "tags": ["Geographie"]
        },
        "When South Sudan gained independence from Sudan in 2011 which city became its capital?": {
            "text_de": "Welche Stadt wurde zur Hauptstadt, als der Südsudan 2011 seine Unabhängigkeit vom Sudan erlangte?",
            "answer_de": "Juba",
            "fun_fact_de": "Juba liegt am Weißen Nil und war bereits während der Kolonialzeit ein wichtiger Handelsposten.",
            "difficulty": 3,
            "tags": ["Geographie"]
        },
        "France celebrates its National Day, Bastille Day, on the 14th of which month?": {
            "text_de": "Frankreich feiert seinen Nationalfeiertag, den Bastille-Tag, am 14. welches Monats?",
            "answer_de": "Juli",
            "fun_fact_de": "Der 14. Juli erinnert an den Sturm auf die Bastille 1789, der als Beginn der Französischen Revolution gilt.",
            "difficulty": 1,
            "tags": ["Geschichte"]
        },
        "What martial art is considered the national sport of South Korea?": {
            "text_de": "Welche Kampfkunst gilt als Nationalsport Südkoreas?",
            "answer_de": "Taekwondo",
            "fun_fact_de": "Taekwondo wurde in den 1940er und 50er Jahren in Korea entwickelt und ist seit 2000 olympische Disziplin.",
            "difficulty": 2,
            "tags": ["Sport"]
        },
        "What type of skiing is the national sport of Norway?": {
            "text_de": "Welche Art des Skifahrens ist der Nationalsport Norwegens?",
            "answer_de": "Langlauf",
            "fun_fact_de": "Langlauf ist die ursprünglichste Form des Skifahrens und in Norwegen seit über 4000 Jahren bekannt.",
            "difficulty": 2,
            "tags": ["Sport"]
        },
        "Seemingly Fidel Castro was an accomplished player, what is the national sport of Cuba?": {
            "text_de": "Was ist der Nationalsport Kubas, in dem angeblich auch Fidel Castro sehr gut war?",
            "answer_de": "Baseball",
            "fun_fact_de": "Baseball kam Ende des 19. Jahrhunderts nach Kuba und wurde dort populärer als in jedem anderen lateinamerikanischen Land.",
            "difficulty": 2,
            "tags": ["Sport"]
        },
        "With their first international match taking place in 1910, what is the national sport of Italy?": {
            "text_de": "Was ist der Nationalsport Italiens, dessen erstes Länderspiel 1910 stattfand?",
            "answer_de": "Fußball",
            "fun_fact_de": "Italien gewann viermal die Fußball-Weltmeisterschaft und ist eine der erfolgreichsten Fußballnationen der Welt.",
            "difficulty": 1,
            "tags": ["Sport"]
        },
        "With no formal clubs in the country, Bhutan is the only country in the world where what is the national sport?": {
            "text_de": "Bhutan ist das einzige Land der Welt, in dem was der Nationalsport ist, obwohl es keine offiziellen Vereine gibt?",
            "answer_de": "Bogenschießen",
            "fun_fact_de": "In Bhutan wird traditionelles Bogenschießen mit selbstgemachten Bögen aus Bambus praktiziert, oft begleitet von Gesang und Tanz.",
            "difficulty": 3,
            "tags": ["Sport"]
        },
        "Despite not being a particularly tall nation of people, what is the national sport of Estonia?": {
            "text_de": "Was ist der Nationalsport Estlands, obwohl die Esten nicht besonders große Menschen sind?",
            "answer_de": "Basketball",
            "fun_fact_de": "Estland ist überraschend erfolgreich im Basketball und qualifizierte sich mehrfach für große internationale Turniere.",
            "difficulty": 3,
            "tags": ["Sport"]
        },
        "In mythology, who flew too close to the sun and melted the wax on his wings?": {
            "text_de": "Wer flog in der Mythologie zu nah an die Sonne und schmolz dabei das Wachs seiner Flügel?",
            "answer_de": "Ikarus",
            "fun_fact_de": "Die Geschichte von Ikarus ist eine Warnung vor Hybris - der Überheblichkeit gegenüber den Göttern.",
            "difficulty": 2,
            "tags": ["Allgemeinwissen"]
        },
        "What company was formed by the Swede, Ingvar Kamprad, one of the richest men in the world?": {
            "text_de": "Welches Unternehmen wurde von dem Schweden Ingvar Kamprad gegründet, einem der reichsten Männer der Welt?",
            "answer_de": "IKEA",
            "fun_fact_de": "IKEA steht für Ingvar Kamprad Elmtaryd Agunnaryd - die Initialen des Gründers und seiner Heimat in Schweden.",
            "difficulty": 2,
            "tags": ["Allgemeinwissen"]
        },
        "Which country is also the world's largest archipelago by area?": {
            "text_de": "Welches Land ist gleichzeitig der flächenmäßig größte Archipel der Welt?",
            "answer_de": "Indonesien",
            "fun_fact_de": "Indonesien besteht aus über 17.000 Inseln und erstreckt sich über drei Zeitzonen.",
            "difficulty": 2,
            "tags": ["Geographie"]
        },
        "Produced by the pancreas, Fredrick Sanger discovered which medical life saver?": {
            "text_de": "Welches medizinische lebensrettende Mittel, das von der Bauchspeicheldrüse produziert wird, entdeckte Frederick Sanger?",
            "answer_de": "Insulin",
            "fun_fact_de": "Frederick Sanger erhielt zweimal den Nobelpreis für Chemie, unter anderem für seine Arbeit zur Insulinstruktur.",
            "difficulty": 3,
            "tags": ["Wissenschaft"]
        },
        "The part of the human eye that controls the size of the pupil is called the what?": {
            "text_de": "Wie heißt der Teil des menschlichen Auges, der die Größe der Pupille kontrolliert?",
            "answer_de": "Iris",
            "fun_fact_de": "Die Iris ist verantwortlich für die Augenfarbe und kann die Pupillengröße je nach Lichteinfall anpassen.",
            "difficulty": 2,
            "tags": ["Wissenschaft"]
        }
    }

    # Skip questions that are very US-specific
    us_specific = ["Sharing its name with a famous pop family, what is the state capital of Mississippi?",
                  "Which American state, known for producing potatoes, has Boise as its capital?"]

    if text_en in us_specific:
        continue  # Skip US state capitals

    # Skip questions about rally racing (too specific)
    if "Which sport, featuring a navigator, is the national sport of Finland?" == text_en:
        continue  # Rally racing too specific

    # Translate if we have it in our dictionary
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

# Write to output file
with open('/home/jan/PubQuiz/pubquizplanner/data/pipeline/reddit/batches/batch_11_output.json', 'w') as f:
    json.dump(translated_questions, f, indent=2, ensure_ascii=False)

print(f"Processed {len(questions)} questions, translated {len(translated_questions)} questions")