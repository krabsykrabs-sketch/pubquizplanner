import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'pubquizplanner',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

const categories = [
  { slug: 'allgemeinwissen', name_de: 'Allgemeinwissen', name_en: 'General Knowledge', icon: '🧠', sort_order: 1 },
  { slug: 'sport', name_de: 'Sport', name_en: 'Sport', icon: '⚽', sort_order: 2 },
  { slug: 'geschichte', name_de: 'Geschichte', name_en: 'History', icon: '📜', sort_order: 3 },
  { slug: 'geographie', name_de: 'Geographie', name_en: 'Geography', icon: '🌍', sort_order: 4 },
  { slug: 'film-tv', name_de: 'Film & TV', name_en: 'Film & TV', icon: '🎬', sort_order: 5 },
  { slug: 'musik', name_de: 'Musik', name_en: 'Music', icon: '🎵', sort_order: 6 },
  { slug: 'wissenschaft', name_de: 'Wissenschaft & Natur', name_en: 'Science & Nature', icon: '🔬', sort_order: 7 },
  { slug: 'essen-trinken', name_de: 'Essen & Trinken', name_en: 'Food & Drink', icon: '🍕', sort_order: 8 },
  { slug: 'literatur', name_de: 'Literatur', name_en: 'Literature', icon: '📚', sort_order: 9 },
  { slug: 'kunst-kultur', name_de: 'Kunst & Kultur', name_en: 'Art & Culture', icon: '🎨', sort_order: 10 },
  { slug: 'technik', name_de: 'Technik', name_en: 'Technology', icon: '💻', sort_order: 11 },
  { slug: 'popkultur', name_de: 'Popkultur', name_en: 'Pop Culture', icon: '⭐', sort_order: 12 },
  { slug: 'sprache', name_de: 'Sprache & Wörter', name_en: 'Language & Words', icon: '💬', sort_order: 13 },
  { slug: 'logik-mathe', name_de: 'Logik & Mathe', name_en: 'Logic & Maths', icon: '🔢', sort_order: 14 },
];

async function seed() {
  console.log('Creating tables...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(50) UNIQUE NOT NULL,
      name_de VARCHAR(100) NOT NULL,
      name_en VARCHAR(100),
      icon VARCHAR(10),
      sort_order INTEGER DEFAULT 0
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      category_id INTEGER REFERENCES categories(id),
      text_de TEXT NOT NULL,
      text_en TEXT,
      answer_de TEXT NOT NULL,
      answer_en TEXT,
      fun_fact_de TEXT,
      fun_fact_en TEXT,
      difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 4),
      round_type VARCHAR(30) DEFAULT 'standard',
      tags TEXT[],
      image_url TEXT,
      audio_url TEXT,
      is_current_event BOOLEAN DEFAULT FALSE,
      current_event_week VARCHAR(10),
      verified BOOLEAN DEFAULT FALSE,
      times_served INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS example_questions (
      id SERIAL PRIMARY KEY,
      category_id INTEGER REFERENCES categories(id),
      difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 4),
      text_de TEXT NOT NULL,
      text_en TEXT,
      answer_de TEXT NOT NULL,
      answer_en TEXT
    );
  `);

  console.log('Seeding categories...');

  for (const cat of categories) {
    await pool.query(
      `INSERT INTO categories (slug, name_de, name_en, icon, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (slug) DO UPDATE SET name_de = $2, name_en = $3, icon = $4, sort_order = $5`,
      [cat.slug, cat.name_de, cat.name_en, cat.icon, cat.sort_order]
    );
  }

  console.log(`Seeded ${categories.length} categories.`);
  await pool.end();
}

seed().catch(console.error);
