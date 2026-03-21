import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface SeedQuestion {
  text_de: string;
  answer_de: string;
  fun_fact_de?: string;
  difficulty: number;
}

const questions: Record<string, SeedQuestion[]> = {
  allgemeinwissen: [
    { text_de: 'Wie viele Bundesländer hat Deutschland?', answer_de: '16', fun_fact_de: 'Das kleinste Bundesland ist Bremen mit nur 419 km².', difficulty: 1 },
    { text_de: 'Welche Farbe hat ein Rubin?', answer_de: 'Rot', difficulty: 1 },
    { text_de: 'Was ist die Hauptstadt von Australien?', answer_de: 'Canberra', fun_fact_de: 'Nicht Sydney oder Melbourne – Canberra wurde als Kompromiss zwischen den beiden Städten gewählt.', difficulty: 2 },
    { text_de: 'Wie heißt das größte Organ des menschlichen Körpers?', answer_de: 'Die Haut', difficulty: 2 },
    { text_de: 'In welchem Land liegt Timbuktu?', answer_de: 'Mali', difficulty: 3 },
    { text_de: 'Welches Gas macht den größten Anteil der Erdatmosphäre aus?', answer_de: 'Stickstoff (ca. 78%)', fun_fact_de: 'Sauerstoff macht nur etwa 21% aus.', difficulty: 2 },
    { text_de: 'Wie viele Zähne hat ein erwachsener Mensch normalerweise?', answer_de: '32', difficulty: 1 },
    { text_de: 'Welches Metall ist flüssig bei Raumtemperatur?', answer_de: 'Quecksilber', difficulty: 2 },
    { text_de: 'Wie heißt der höchste Berg Afrikas?', answer_de: 'Kilimandscharo', difficulty: 2 },
    { text_de: 'Was ist die Währung von Japan?', answer_de: 'Yen', difficulty: 1 },
    { text_de: 'Welches Tier kann am längsten ohne Wasser überleben?', answer_de: 'Die Kängururatte (ihr ganzes Leben)', fun_fact_de: 'Sie gewinnt Wasser aus der Nahrung durch metabolische Prozesse.', difficulty: 3 },
    { text_de: 'Wie viele Tasten hat ein Standard-Klavier?', answer_de: '88', difficulty: 2 },
  ],
  sport: [
    { text_de: 'In welchem Land wurde Fußball erfunden?', answer_de: 'England', difficulty: 1 },
    { text_de: 'Wie lang ist ein Marathon in Kilometern?', answer_de: '42,195 km', fun_fact_de: 'Die Distanz wurde 1908 festgelegt, damit das Rennen vor der königlichen Loge enden konnte.', difficulty: 2 },
    { text_de: 'Welches Land hat die meisten Fußball-WM-Titel gewonnen?', answer_de: 'Brasilien (5 Titel)', difficulty: 1 },
    { text_de: 'Wie heißt die höchste Spielklasse im deutschen Fußball?', answer_de: 'Bundesliga', difficulty: 1 },
    { text_de: 'In welcher Sportart gibt es den "Slam Dunk"?', answer_de: 'Basketball', difficulty: 1 },
    { text_de: 'Wie viele Ringe hat das olympische Symbol?', answer_de: 'Fünf', difficulty: 1 },
    { text_de: 'Welcher deutsche Tennisspieler gewann 1985 als jüngster Spieler Wimbledon?', answer_de: 'Boris Becker', fun_fact_de: 'Er war damals erst 17 Jahre alt.', difficulty: 2 },
    { text_de: 'Wie viele Löcher hat eine Standardrunde Golf?', answer_de: '18', difficulty: 2 },
    { text_de: 'Welche Mannschaft gewann die Fußball-WM 2014 in Brasilien?', answer_de: 'Deutschland', difficulty: 1 },
    { text_de: 'Was ist die Höchstpunktzahl beim Snooker mit einem einzigen Stoß?', answer_de: '147 (Maximum Break)', difficulty: 3 },
    { text_de: 'In welcher Stadt fanden die ersten modernen Olympischen Spiele statt?', answer_de: 'Athen (1896)', difficulty: 2 },
    { text_de: 'Wie heißt der berühmte Haka-Tanz der neuseeländischen Rugby-Nationalmannschaft?', answer_de: 'Ka Mate', difficulty: 4 },
  ],
  geschichte: [
    { text_de: 'In welchem Jahr fiel die Berliner Mauer?', answer_de: '1989', difficulty: 1 },
    { text_de: 'Wer war der erste Mensch auf dem Mond?', answer_de: 'Neil Armstrong', fun_fact_de: 'Am 20. Juli 1969 betrat er als erster Mensch den Mond.', difficulty: 1 },
    { text_de: 'Welcher Krieg dauerte von 1914 bis 1918?', answer_de: 'Der Erste Weltkrieg', difficulty: 1 },
    { text_de: 'Wer erfand den Buchdruck mit beweglichen Lettern?', answer_de: 'Johannes Gutenberg', difficulty: 1 },
    { text_de: 'In welchem Jahr wurde das Deutsche Kaiserreich gegründet?', answer_de: '1871', difficulty: 2 },
    { text_de: 'Welche ägyptische Königin war mit Julius Caesar liiert?', answer_de: 'Kleopatra', difficulty: 2 },
    { text_de: 'Wer malte das Deckenfresko der Sixtinischen Kapelle?', answer_de: 'Michelangelo', difficulty: 2 },
    { text_de: 'In welchem Jahr wurde die Französische Revolution begonnen?', answer_de: '1789', difficulty: 2 },
    { text_de: 'Wie hieß das Schiff, mit dem die Pilgerväter nach Amerika segelten?', answer_de: 'Mayflower', difficulty: 2 },
    { text_de: 'Welcher deutsche Kaiser dankte 1918 ab?', answer_de: 'Wilhelm II.', difficulty: 3 },
    { text_de: 'Wie hieß der letzte Zar von Russland?', answer_de: 'Nikolaus II.', difficulty: 3 },
    { text_de: 'In welchem Jahr wurde die Magna Carta unterzeichnet?', answer_de: '1215', fun_fact_de: 'Sie gilt als eines der wichtigsten Dokumente der Verfassungsgeschichte.', difficulty: 3 },
  ],
  geographie: [
    { text_de: 'Welches ist das größte Land der Erde?', answer_de: 'Russland', difficulty: 1 },
    { text_de: 'An welchem Fluss liegt Hamburg?', answer_de: 'Elbe', difficulty: 1 },
    { text_de: 'Wie heißt die größte Insel der Welt?', answer_de: 'Grönland', difficulty: 2 },
    { text_de: 'Welches Land hat die Form eines Stiefels?', answer_de: 'Italien', difficulty: 1 },
    { text_de: 'Was ist der tiefste See der Erde?', answer_de: 'Baikalsee', fun_fact_de: 'Er enthält etwa 20% des weltweiten Süßwassers.', difficulty: 3 },
    { text_de: 'Wie heißt die Hauptstadt von Kanada?', answer_de: 'Ottawa', difficulty: 2 },
    { text_de: 'Welcher Fluss fließt durch die meisten europäischen Hauptstädte?', answer_de: 'Die Donau', fun_fact_de: 'Sie fließt durch Wien, Bratislava, Budapest und Belgrad.', difficulty: 3 },
    { text_de: 'Wie viele Nachbarländer hat Deutschland?', answer_de: 'Neun', difficulty: 1 },
    { text_de: 'In welchem Ozean liegt die Insel Madagaskar?', answer_de: 'Indischer Ozean', difficulty: 2 },
    { text_de: 'Welches ist das bevölkerungsreichste Land der Erde?', answer_de: 'Indien', difficulty: 2 },
    { text_de: 'Wie heißt die Wüste im Süden Afrikas?', answer_de: 'Kalahari', difficulty: 3 },
    { text_de: 'Was ist die Hauptstadt von Neuseeland?', answer_de: 'Wellington', difficulty: 2 },
  ],
  'film-tv': [
    { text_de: 'Wie heißt der Zauberschüler in der berühmten Filmreihe von J.K. Rowling?', answer_de: 'Harry Potter', difficulty: 1 },
    { text_de: 'Welcher Schauspieler spielt Iron Man im Marvel-Universum?', answer_de: 'Robert Downey Jr.', difficulty: 1 },
    { text_de: 'In welchem Film sagt man "Ich bin dein Vater"?', answer_de: 'Star Wars: Das Imperium schlägt zurück', difficulty: 1 },
    { text_de: 'Wie heißt die TV-Serie über eine Chemielehrerin, die Drogen herstellt?', answer_de: 'Breaking Bad', fun_fact_de: 'Die Serie hat 62 Folgen in 5 Staffeln.', difficulty: 1 },
    { text_de: 'Wer führte Regie bei "Pulp Fiction"?', answer_de: 'Quentin Tarantino', difficulty: 2 },
    { text_de: 'In welchem Jahr kam der erste "Jurassic Park" ins Kino?', answer_de: '1993', difficulty: 2 },
    { text_de: 'Wie heißt der Hobbit in "Der Herr der Ringe", der den Ring trägt?', answer_de: 'Frodo Beutlin', difficulty: 1 },
    { text_de: 'Welcher Film hat den höchsten Einspielergebnis aller Zeiten (inflationsbereinigt)?', answer_de: 'Vom Winde verweht', difficulty: 4 },
    { text_de: 'Wer spielt den Joker in "The Dark Knight"?', answer_de: 'Heath Ledger', difficulty: 2 },
    { text_de: 'Wie heißt die Netflix-Serie über ein Schachgenie?', answer_de: 'Das Damengambit', difficulty: 2 },
    { text_de: 'In welchem Studio entstehen die Animationsfilme "Toy Story" und "Findet Nemo"?', answer_de: 'Pixar', difficulty: 1 },
    { text_de: 'Welcher deutsche Film gewann 2007 den Oscar für den besten fremdsprachigen Film?', answer_de: 'Das Leben der Anderen', difficulty: 3 },
  ],
  musik: [
    { text_de: 'Welcher Sänger ist als "King of Pop" bekannt?', answer_de: 'Michael Jackson', difficulty: 1 },
    { text_de: 'Wie viele Saiten hat eine Standardgitarre?', answer_de: 'Sechs', difficulty: 1 },
    { text_de: 'Welche Band sang "Bohemian Rhapsody"?', answer_de: 'Queen', difficulty: 1 },
    { text_de: 'Aus welchem Land kommt ABBA?', answer_de: 'Schweden', difficulty: 1 },
    { text_de: 'Wer komponierte "Die vier Jahreszeiten"?', answer_de: 'Antonio Vivaldi', difficulty: 2 },
    { text_de: 'Welches Instrument spielt ein Schlagzeuger?', answer_de: 'Drums / Schlagzeug', difficulty: 1 },
    { text_de: 'Wie heißt das meistverkaufte Album aller Zeiten?', answer_de: 'Thriller (Michael Jackson)', fun_fact_de: 'Über 70 Millionen verkaufte Exemplare weltweit.', difficulty: 2 },
    { text_de: 'Welche deutsche Band ist für "Du hast" bekannt?', answer_de: 'Rammstein', difficulty: 1 },
    { text_de: 'In welcher Stadt wurde Mozart geboren?', answer_de: 'Salzburg', difficulty: 2 },
    { text_de: 'Welcher Rapper heißt bürgerlich Marshall Mathers?', answer_de: 'Eminem', difficulty: 2 },
    { text_de: 'Wie viele Sinfonien hat Beethoven komponiert?', answer_de: 'Neun', difficulty: 3 },
    { text_de: 'Welches Musikinstrument hat die meisten Saiten?', answer_de: 'Die Harfe (47 Saiten)', difficulty: 3 },
  ],
  wissenschaft: [
    { text_de: 'Wie heißt der rote Planet?', answer_de: 'Mars', difficulty: 1 },
    { text_de: 'Was ist H₂O?', answer_de: 'Wasser', difficulty: 1 },
    { text_de: 'Wie viele Planeten hat unser Sonnensystem?', answer_de: 'Acht', fun_fact_de: 'Pluto wurde 2006 zum Zwergplaneten herabgestuft.', difficulty: 1 },
    { text_de: 'Was ist die härteste natürliche Substanz?', answer_de: 'Diamant', difficulty: 1 },
    { text_de: 'Wer entwickelte die Relativitätstheorie?', answer_de: 'Albert Einstein', difficulty: 1 },
    { text_de: 'Wie heißt der Prozess, bei dem Pflanzen Sonnenlicht in Energie umwandeln?', answer_de: 'Photosynthese', difficulty: 2 },
    { text_de: 'Welches Vitamin produziert der Körper bei Sonneneinstrahlung?', answer_de: 'Vitamin D', difficulty: 2 },
    { text_de: 'Was misst die Richter-Skala?', answer_de: 'Erdbebenstärke', difficulty: 2 },
    { text_de: 'Wie heißt das kleinste Teilchen eines chemischen Elements?', answer_de: 'Atom', difficulty: 2 },
    { text_de: 'Welches Organ filtert das Blut im menschlichen Körper?', answer_de: 'Die Niere', difficulty: 2 },
    { text_de: 'Was ist die Einheit für elektrischen Widerstand?', answer_de: 'Ohm', difficulty: 3 },
    { text_de: 'Wie heißt der größte bekannte Stern im Universum?', answer_de: 'UY Scuti', difficulty: 4 },
  ],
  'essen-trinken': [
    { text_de: 'Aus welchem Land kommt Sushi?', answer_de: 'Japan', difficulty: 1 },
    { text_de: 'Welches Getränk wird aus Hopfen und Malz gebraut?', answer_de: 'Bier', difficulty: 1 },
    { text_de: 'Was ist die Hauptzutat von Hummus?', answer_de: 'Kichererbsen', difficulty: 1 },
    { text_de: 'Aus welcher Frucht wird Wein hauptsächlich hergestellt?', answer_de: 'Trauben', difficulty: 1 },
    { text_de: 'Welches Gewürz ist das teuerste der Welt?', answer_de: 'Safran', fun_fact_de: 'Für ein Kilo Safran braucht man bis zu 200.000 Blüten.', difficulty: 2 },
    { text_de: 'Was ist der Unterschied zwischen Espresso und Lungo?', answer_de: 'Lungo verwendet mehr Wasser und hat eine längere Extraktionszeit', difficulty: 2 },
    { text_de: 'Aus welchem Land kommt der Käse Gouda?', answer_de: 'Niederlande', difficulty: 1 },
    { text_de: 'Wie heißt das japanische Reiswein-Getränk?', answer_de: 'Sake', difficulty: 2 },
    { text_de: 'Welches Land ist der größte Kaffeeproduzent der Welt?', answer_de: 'Brasilien', difficulty: 2 },
    { text_de: 'Was ist "Umami"?', answer_de: 'Die fünfte Geschmacksrichtung (herzhaft/würzig)', difficulty: 3 },
    { text_de: 'Wie heißt der berühmte französische Blauschimmelkäse aus der Auvergne?', answer_de: 'Roquefort', difficulty: 3 },
    { text_de: 'Aus welcher Pflanze wird Tequila hergestellt?', answer_de: 'Blaue Agave', difficulty: 2 },
  ],
  literatur: [
    { text_de: 'Wer schrieb "Romeo und Julia"?', answer_de: 'William Shakespeare', difficulty: 1 },
    { text_de: 'Wie heißt das berühmteste Werk von Antoine de Saint-Exupéry?', answer_de: 'Der kleine Prinz', difficulty: 1 },
    { text_de: 'Wer schrieb "Die unendliche Geschichte"?', answer_de: 'Michael Ende', difficulty: 2 },
    { text_de: 'In welchem Buch kommt die Figur Sherlock Holmes vor?', answer_de: 'In den Romanen von Arthur Conan Doyle', difficulty: 1 },
    { text_de: 'Welcher deutsche Dichter schrieb "Die Leiden des jungen Werthers"?', answer_de: 'Johann Wolfgang von Goethe', difficulty: 2 },
    { text_de: 'Wie heißt der Kontinent in "Game of Thrones" / "Das Lied von Eis und Feuer"?', answer_de: 'Westeros', difficulty: 2 },
    { text_de: 'Wer schrieb "1984"?', answer_de: 'George Orwell', difficulty: 2 },
    { text_de: 'Welche Autorin schrieb "Stolz und Vorurteil"?', answer_de: 'Jane Austen', difficulty: 2 },
    { text_de: 'Wie heißt der Wal in Herman Melvilles berühmtem Roman?', answer_de: 'Moby Dick', difficulty: 2 },
    { text_de: 'Welcher Nobelpreisträger schrieb "Die Blechtrommel"?', answer_de: 'Günter Grass', difficulty: 3 },
    { text_de: 'Wer schrieb "Hundert Jahre Einsamkeit"?', answer_de: 'Gabriel García Márquez', difficulty: 3 },
    { text_de: 'In welchem Jahr erschien Goethes "Faust I"?', answer_de: '1808', difficulty: 4 },
  ],
  'kunst-kultur': [
    { text_de: 'Welcher Maler ist für "Die Sternennacht" bekannt?', answer_de: 'Vincent van Gogh', difficulty: 1 },
    { text_de: 'Wo steht die Freiheitsstatue?', answer_de: 'New York', difficulty: 1 },
    { text_de: 'Welcher Künstler ist für seine Suppendosen-Bilder bekannt?', answer_de: 'Andy Warhol', difficulty: 2 },
    { text_de: 'In welchem Land steht das Kolosseum?', answer_de: 'Italien (Rom)', difficulty: 1 },
    { text_de: 'Welcher Architekt entwarf die Sagrada Familia in Barcelona?', answer_de: 'Antoni Gaudí', difficulty: 2 },
    { text_de: 'Was ist ein Fresko?', answer_de: 'Ein Wandgemälde auf frischem Putz', difficulty: 3 },
    { text_de: 'Welcher Impressionist ist für seine Seerosenbilder berühmt?', answer_de: 'Claude Monet', difficulty: 2 },
    { text_de: 'Wie heißt das größte Kunstmuseum der Welt?', answer_de: 'Der Louvre in Paris', difficulty: 2 },
    { text_de: 'Welcher Bildhauer schuf den "David"?', answer_de: 'Michelangelo', difficulty: 2 },
    { text_de: 'Wie heißt die Kunstrichtung von Picassos "Guernica"?', answer_de: 'Kubismus', difficulty: 3 },
    { text_de: 'Welches Bauwerk ist das Wahrzeichen von Sydney?', answer_de: 'Sydney Opera House', difficulty: 1 },
    { text_de: 'Wer schuf die Installation "The Weather Project" in der Tate Modern?', answer_de: 'Olafur Eliasson', difficulty: 4 },
  ],
  technik: [
    { text_de: 'Wofür steht "HTML"?', answer_de: 'HyperText Markup Language', difficulty: 1 },
    { text_de: 'Welches Unternehmen hat das iPhone entwickelt?', answer_de: 'Apple', difficulty: 1 },
    { text_de: 'Was bedeutet "WiFi"?', answer_de: 'Wireless Fidelity', difficulty: 1 },
    { text_de: 'Wer gilt als Erfinder des World Wide Web?', answer_de: 'Tim Berners-Lee', fun_fact_de: 'Er entwickelte es 1989 am CERN in Genf.', difficulty: 2 },
    { text_de: 'In welcher Programmiersprache wurde die erste Version von Facebook geschrieben?', answer_de: 'PHP', difficulty: 3 },
    { text_de: 'Was ist ein Algorithmus?', answer_de: 'Eine Folge von Anweisungen zur Lösung eines Problems', difficulty: 2 },
    { text_de: 'Wofür steht GPS?', answer_de: 'Global Positioning System', difficulty: 1 },
    { text_de: 'Welches Unternehmen entwickelte Android?', answer_de: 'Google (ursprünglich Android Inc.)', difficulty: 2 },
    { text_de: 'Was ist Blockchain?', answer_de: 'Eine dezentrale, unveränderliche Datenbank-Technologie', difficulty: 3 },
    { text_de: 'In welchem Jahr wurde Wikipedia gegründet?', answer_de: '2001', difficulty: 2 },
    { text_de: 'Was ist der Unterschied zwischen RAM und ROM?', answer_de: 'RAM ist flüchtig (temporär), ROM ist permanent', difficulty: 3 },
    { text_de: 'Wer gründete Tesla Motors?', answer_de: 'Martin Eberhard und Marc Tarpenning (2003)', fun_fact_de: 'Elon Musk kam erst 2004 als Investor dazu.', difficulty: 4 },
  ],
  popkultur: [
    { text_de: 'Wie heißt Baby Yodas eigentlicher Name in "The Mandalorian"?', answer_de: 'Grogu', difficulty: 2 },
    { text_de: 'Welche Farbe hat Pac-Man?', answer_de: 'Gelb', difficulty: 1 },
    { text_de: 'Wie heißt die Hauptfigur in "The Legend of Zelda"?', answer_de: 'Link', fun_fact_de: 'Zelda ist die Prinzessin, nicht der Held!', difficulty: 2 },
    { text_de: 'Welche Band singt den Titelsong von "Friends"?', answer_de: 'The Rembrandts', difficulty: 2 },
    { text_de: 'Wie heißt der Heimatplanet von Superman?', answer_de: 'Krypton', difficulty: 1 },
    { text_de: 'Welcher YouTuber hatte als Erster 100 Millionen Abonnenten?', answer_de: 'PewDiePie', difficulty: 2 },
    { text_de: 'Wie heißt das fiktive Königreich in "Black Panther"?', answer_de: 'Wakanda', difficulty: 1 },
    { text_de: 'Welches Spiel wurde 2020 das meistverkaufte Videospiel aller Zeiten?', answer_de: 'Minecraft', difficulty: 2 },
    { text_de: 'Wie heißt die Hauptfigur in "Grand Theft Auto V"?', answer_de: 'Es gibt drei: Michael, Trevor und Franklin', difficulty: 3 },
    { text_de: 'Welche Serie hatte die meistgesehene Einzelfolge in der TV-Geschichte (USA)?', answer_de: 'M*A*S*H (Finale 1983)', difficulty: 4 },
    { text_de: 'Wie heißt der Nachbar der Simpsons?', answer_de: 'Ned Flanders', difficulty: 1 },
    { text_de: 'Welches Social-Media-Netzwerk hat das Vogel-Logo?', answer_de: 'Twitter', difficulty: 1 },
  ],
  sprache: [
    { text_de: 'Was bedeutet "Carpe Diem" auf Deutsch?', answer_de: 'Nutze den Tag', difficulty: 1 },
    { text_de: 'Welche Sprache wird in Brasilien gesprochen?', answer_de: 'Portugiesisch', difficulty: 1 },
    { text_de: 'Was ist ein Synonym?', answer_de: 'Ein Wort mit gleicher oder ähnlicher Bedeutung', difficulty: 1 },
    { text_de: 'Aus welcher Sprache kommt das Wort "Tsunami"?', answer_de: 'Japanisch', difficulty: 2 },
    { text_de: 'Was bedeutet das lateinische Wort "veni, vidi, vici"?', answer_de: 'Ich kam, ich sah, ich siegte', difficulty: 2 },
    { text_de: 'Wie viele offizielle Amtssprachen hat die Schweiz?', answer_de: 'Vier (Deutsch, Französisch, Italienisch, Rätoromanisch)', difficulty: 2 },
    { text_de: 'Was ist ein Oxymoron?', answer_de: 'Eine Verbindung zweier sich widersprechender Begriffe', fun_fact_de: 'Beispiele: "bittersüß" oder "alter Knabe".', difficulty: 3 },
    { text_de: 'Welche Sprache hat die meisten Muttersprachler weltweit?', answer_de: 'Mandarin-Chinesisch', difficulty: 2 },
    { text_de: 'Was bedeutet das englische Wort "serendipity"?', answer_de: 'Glücklicher Zufall / zufällige Entdeckung', difficulty: 3 },
    { text_de: 'Aus welcher Sprache stammt das Wort "Algebra"?', answer_de: 'Arabisch', difficulty: 3 },
    { text_de: 'Was ist der Unterschied zwischen "das" und "dass"?', answer_de: '"Das" ist Artikel/Pronomen, "dass" ist eine Konjunktion', difficulty: 2 },
    { text_de: 'Wie viele Buchstaben hat das hawaiianische Alphabet?', answer_de: '13 (12 Buchstaben + Okina)', difficulty: 4 },
  ],
  'logik-mathe': [
    { text_de: 'Was ist 15% von 200?', answer_de: '30', difficulty: 1 },
    { text_de: 'Wie viele Seiten hat ein Würfel?', answer_de: 'Sechs', difficulty: 1 },
    { text_de: 'Was kommt als Nächstes: 2, 4, 8, 16, ...?', answer_de: '32', difficulty: 1 },
    { text_de: 'Was ist die Kreiszahl Pi auf zwei Dezimalstellen?', answer_de: '3,14', difficulty: 1 },
    { text_de: 'Wie viele Ecken hat ein Oktagon?', answer_de: 'Acht', difficulty: 2 },
    { text_de: 'Was ergibt 2 hoch 10?', answer_de: '1024', difficulty: 2 },
    { text_de: 'Ein Bauer hat 17 Schafe. Alle bis auf 9 sterben. Wie viele hat er noch?', answer_de: '9', fun_fact_de: 'Ein klassisches Denkrätsel!', difficulty: 2 },
    { text_de: 'Was ist die Fakultät von 5 (5!)?', answer_de: '120', difficulty: 3 },
    { text_de: 'Wie heißt der Satz des Pythagoras?', answer_de: 'a² + b² = c²', difficulty: 2 },
    { text_de: 'Was ist eine Primzahl?', answer_de: 'Eine Zahl, die nur durch 1 und sich selbst teilbar ist', difficulty: 1 },
    { text_de: 'Was ist der goldene Schnitt (ungefähr)?', answer_de: 'Ca. 1,618', difficulty: 3 },
    { text_de: 'Wie viele verschiedene Kombinationen gibt es bei einem 4-stelligen PIN (0-9)?', answer_de: '10.000', difficulty: 3 },
  ],
};

async function seed() {
  console.log('Seeding questions...');

  const result = await pool.query('SELECT id, slug FROM categories');
  const catMap: Record<string, number> = {};
  for (const row of result.rows) {
    catMap[row.slug] = row.id;
  }

  let count = 0;
  for (const [slug, qs] of Object.entries(questions)) {
    const categoryId = catMap[slug];
    if (!categoryId) {
      console.warn(`Category not found: ${slug}`);
      continue;
    }

    for (const q of qs) {
      await pool.query(
        `INSERT INTO questions (category_id, text_de, answer_de, fun_fact_de, difficulty, round_type)
         VALUES ($1, $2, $3, $4, $5, 'standard')
         ON CONFLICT DO NOTHING`,
        [categoryId, q.text_de, q.answer_de, q.fun_fact_de || null, q.difficulty]
      );
      count++;
    }
  }

  console.log(`Seeded ${count} questions.`);
  await pool.end();
}

seed().catch(console.error);
