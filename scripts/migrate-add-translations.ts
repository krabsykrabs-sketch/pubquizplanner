// Multi-language support: translation tables + removal of the legacy
// (never populated) *_en columns. Run: npm run db:migrate-translations
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Dutch category names for the first non-German locale.
const NL_CATEGORY_NAMES: Record<string, string> = {
  allgemeinwissen: 'Algemene kennis',
  sport: 'Sport',
  geschichte: 'Geschiedenis',
  geographie: 'Geografie',
  'film-tv': 'Film & tv',
  musik: 'Muziek',
  wissenschaft: 'Wetenschap & natuur',
  'essen-trinken': 'Eten & drinken',
  literatur: 'Literatuur',
  'kunst-kultur': 'Kunst & cultuur',
  technik: 'Techniek',
  popkultur: 'Popcultuur',
  sprache: 'Taal',
  'logik-mathe': 'Logica & wiskunde',
};

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS question_translations (
      question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      locale      VARCHAR(5) NOT NULL,
      text        TEXT NOT NULL,
      answer      TEXT NOT NULL,
      fun_fact    TEXT,
      status      VARCHAR(20) NOT NULL DEFAULT 'machine',
      source_hash VARCHAR(32) NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (question_id, locale)
    );
  `);
  await pool.query(
    'CREATE INDEX IF NOT EXISTS idx_qt_locale ON question_translations (locale, status)'
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS category_translations (
      category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      locale      VARCHAR(5) NOT NULL,
      name        VARCHAR(100) NOT NULL,
      PRIMARY KEY (category_id, locale)
    );
  `);

  for (const [slug, name] of Object.entries(NL_CATEGORY_NAMES)) {
    await pool.query(
      `INSERT INTO category_translations (category_id, locale, name)
       SELECT id, 'nl', $2 FROM categories WHERE slug = $1
       ON CONFLICT (category_id, locale) DO UPDATE SET name = $2`,
      [slug, name]
    );
  }

  // Legacy per-column translations were never populated; the tables above
  // replace them (approved 2026-07-02).
  await pool.query('ALTER TABLE questions DROP COLUMN IF EXISTS text_en');
  await pool.query('ALTER TABLE questions DROP COLUMN IF EXISTS answer_en');
  await pool.query('ALTER TABLE questions DROP COLUMN IF EXISTS fun_fact_en');
  await pool.query('ALTER TABLE categories DROP COLUMN IF EXISTS name_en');

  console.log('translation tables ready, nl category names seeded, *_en columns dropped');
  await pool.end();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
