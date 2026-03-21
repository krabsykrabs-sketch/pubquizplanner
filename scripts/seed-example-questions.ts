import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'pubquizplanner',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

// Example questions per category (one per difficulty level)
const exampleQuestions: Record<string, { difficulty: number; text_de: string; answer_de: string }[]> = {
  allgemeinwissen: [
    { difficulty: 1, text_de: 'Wie viele Kontinente gibt es?', answer_de: 'Sieben' },
    { difficulty: 2, text_de: 'Welches chemische Element hat das Symbol "Fe"?', answer_de: 'Eisen' },
    { difficulty: 3, text_de: 'In welchem Jahr wurde die Berliner Mauer gebaut?', answer_de: '1961' },
    { difficulty: 4, text_de: 'Wie heißt der längste Fluss Australiens?', answer_de: 'Murray River' },
  ],
  sport: [
    { difficulty: 1, text_de: 'Wie viele Spieler hat eine Fußballmannschaft auf dem Feld?', answer_de: 'Elf' },
    { difficulty: 2, text_de: 'In welcher Stadt fanden die Olympischen Spiele 2012 statt?', answer_de: 'London' },
    { difficulty: 3, text_de: 'Wer hält den Rekord für die meisten Formel-1-Weltmeistertitel?', answer_de: 'Michael Schumacher & Lewis Hamilton (je 7)' },
    { difficulty: 4, text_de: 'Wie heißt der älteste Tennisverein Deutschlands?', answer_de: 'Baden-Badener Tennis-Club 1881' },
  ],
  geschichte: [
    { difficulty: 1, text_de: 'Wer war der erste Bundeskanzler der BRD?', answer_de: 'Konrad Adenauer' },
    { difficulty: 2, text_de: 'In welchem Jahr endete der Zweite Weltkrieg?', answer_de: '1945' },
    { difficulty: 3, text_de: 'Welcher römische Kaiser hat angeblich Rom angezündet?', answer_de: 'Nero' },
    { difficulty: 4, text_de: 'Wie hieß der Friedensvertrag, der den Dreißigjährigen Krieg beendete?', answer_de: 'Westfälischer Friede' },
  ],
  geographie: [
    { difficulty: 1, text_de: 'Was ist die Hauptstadt von Frankreich?', answer_de: 'Paris' },
    { difficulty: 2, text_de: 'Welcher ist der größte Ozean der Erde?', answer_de: 'Pazifischer Ozean' },
    { difficulty: 3, text_de: 'Wie heißt die Hauptstadt von Myanmar?', answer_de: 'Naypyidaw' },
    { difficulty: 4, text_de: 'Welches Land hat die meisten Zeitzonen?', answer_de: 'Frankreich (12 Zeitzonen)' },
  ],
  'film-tv': [
    { difficulty: 1, text_de: 'Wer spielt Jack Sparrow in "Fluch der Karibik"?', answer_de: 'Johnny Depp' },
    { difficulty: 2, text_de: 'Wie heißt die Heimatstadt der Simpsons?', answer_de: 'Springfield' },
    { difficulty: 3, text_de: 'Welcher Film gewann 2020 den Oscar als Bester Film?', answer_de: 'Parasite' },
    { difficulty: 4, text_de: 'Wie heißt der Regisseur von "Stalker" (1979)?', answer_de: 'Andrei Tarkowski' },
  ],
  musik: [
    { difficulty: 1, text_de: 'Aus welchem Land kommen die Beatles?', answer_de: 'England (Liverpool)' },
    { difficulty: 2, text_de: 'Welches Instrument hat 88 Tasten?', answer_de: 'Klavier' },
    { difficulty: 3, text_de: 'Wer komponierte die "Mondscheinsonate"?', answer_de: 'Ludwig van Beethoven' },
    { difficulty: 4, text_de: 'Wie heißt das Debütalbum von Kraftwerk?', answer_de: 'Kraftwerk (1970)' },
  ],
  wissenschaft: [
    { difficulty: 1, text_de: 'Welcher Planet ist der Sonne am nächsten?', answer_de: 'Merkur' },
    { difficulty: 2, text_de: 'Woraus besteht Wasser chemisch?', answer_de: 'H₂O (Wasserstoff und Sauerstoff)' },
    { difficulty: 3, text_de: 'Was ist die Lichtgeschwindigkeit in km/s (ungefähr)?', answer_de: 'Ca. 300.000 km/s' },
    { difficulty: 4, text_de: 'Wie heißt das schwerste natürlich vorkommende Element?', answer_de: 'Uran' },
  ],
  'essen-trinken': [
    { difficulty: 1, text_de: 'Aus welchem Land kommt Pizza?', answer_de: 'Italien' },
    { difficulty: 2, text_de: 'Welche Frucht ist die Hauptzutat von Guacamole?', answer_de: 'Avocado' },
    { difficulty: 3, text_de: 'Was ist der Unterschied zwischen Lager und Ale?', answer_de: 'Untergärig vs. obergärig' },
    { difficulty: 4, text_de: 'Welche japanische Sojasoße wird aus ganzen Sojabohnen hergestellt?', answer_de: 'Tamari' },
  ],
  literatur: [
    { difficulty: 1, text_de: 'Wer schrieb "Faust"?', answer_de: 'Johann Wolfgang von Goethe' },
    { difficulty: 2, text_de: 'Wie heißt der Zauberer in "Der Herr der Ringe"?', answer_de: 'Gandalf' },
    { difficulty: 3, text_de: 'Wer schrieb "Die Verwandlung"?', answer_de: 'Franz Kafka' },
    { difficulty: 4, text_de: 'In welchem Jahr erschien Thomas Manns "Buddenbrooks"?', answer_de: '1901' },
  ],
  'kunst-kultur': [
    { difficulty: 1, text_de: 'Wer malte die Mona Lisa?', answer_de: 'Leonardo da Vinci' },
    { difficulty: 2, text_de: 'In welchem Museum hängt die Mona Lisa?', answer_de: 'Louvre (Paris)' },
    { difficulty: 3, text_de: 'Welcher Kunststil wird mit Salvador Dalí assoziiert?', answer_de: 'Surrealismus' },
    { difficulty: 4, text_de: 'Wie heißt das berühmteste Werk von Marcel Duchamp?', answer_de: 'Fountain (Das Urinal, 1917)' },
  ],
  technik: [
    { difficulty: 1, text_de: 'Wofür steht die Abkürzung "USB"?', answer_de: 'Universal Serial Bus' },
    { difficulty: 2, text_de: 'Wer gründete Microsoft?', answer_de: 'Bill Gates und Paul Allen' },
    { difficulty: 3, text_de: 'In welchem Jahr wurde das iPhone vorgestellt?', answer_de: '2007' },
    { difficulty: 4, text_de: 'Wie heißt das erste kommerziell erfolgreiche Computerbetriebssystem?', answer_de: 'CP/M' },
  ],
  popkultur: [
    { difficulty: 1, text_de: 'Wie heißt der Superheld mit dem Spinnenkostüm?', answer_de: 'Spider-Man' },
    { difficulty: 2, text_de: 'Welches Videospiel hat die Figur Mario bekannt gemacht?', answer_de: 'Donkey Kong' },
    { difficulty: 3, text_de: 'Wie heißt das meistverkaufte Videospiel aller Zeiten?', answer_de: 'Minecraft' },
    { difficulty: 4, text_de: 'Wer hat das Meme "Distracted Boyfriend" fotografiert?', answer_de: 'Antonio Guillem' },
  ],
  sprache: [
    { difficulty: 1, text_de: 'Was bedeutet "Bonjour" auf Deutsch?', answer_de: 'Guten Tag' },
    { difficulty: 2, text_de: 'Aus welcher Sprache stammt das Wort "Kindergarten"?', answer_de: 'Deutsch' },
    { difficulty: 3, text_de: 'Was ist ein Palindrom?', answer_de: 'Ein Wort, das vorwärts und rückwärts gleich gelesen wird' },
    { difficulty: 4, text_de: 'Wie viele Kasus hat die finnische Sprache?', answer_de: '15' },
  ],
  'logik-mathe': [
    { difficulty: 1, text_de: 'Was ist 7 × 8?', answer_de: '56' },
    { difficulty: 2, text_de: 'Was ist die Quadratwurzel von 144?', answer_de: '12' },
    { difficulty: 3, text_de: 'Was ist die Summe aller Zahlen von 1 bis 100?', answer_de: '5050' },
    { difficulty: 4, text_de: 'Was sind die ersten 5 Primzahlen über 100?', answer_de: '101, 103, 107, 109, 113' },
  ],
};

async function seed() {
  console.log('Seeding example questions...');

  // Get category IDs
  const result = await pool.query('SELECT id, slug FROM categories');
  const catMap: Record<string, number> = {};
  for (const row of result.rows) {
    catMap[row.slug] = row.id;
  }

  // Clear existing
  await pool.query('DELETE FROM example_questions');

  for (const [slug, questions] of Object.entries(exampleQuestions)) {
    const categoryId = catMap[slug];
    if (!categoryId) {
      console.warn(`Category not found: ${slug}`);
      continue;
    }

    for (const q of questions) {
      await pool.query(
        `INSERT INTO example_questions (category_id, difficulty, text_de, answer_de)
         VALUES ($1, $2, $3, $4)`,
        [categoryId, q.difficulty, q.text_de, q.answer_de]
      );
    }
  }

  console.log('Done seeding example questions.');
  await pool.end();
}

seed().catch(console.error);
