// Adds the seasonal "Weihnachten" category (idempotent). Plain .mjs + pg so it
// runs inside the production container, where tsx (a devDependency) is absent.
//
// The category only goes public — /de/fragen/weihnachten, sitemap, generator
// chips — once it has MIN_QUESTIONS_PER_CATEGORY (30) approved questions.
// No translations: other locales never show it (strict no-fallback).
//
// Usage: node scripts/migrate-add-weihnachten.mjs   (reads DATABASE_URL)
import pg from 'pg';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

const { rows } = await client.query(
  `INSERT INTO categories (slug, name_de, name_en, icon, sort_order)
   VALUES ('weihnachten', 'Weihnachten', 'Christmas', '🎄',
           (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM categories))
   ON CONFLICT (slug) DO UPDATE SET name_de = EXCLUDED.name_de
   RETURNING id, slug, sort_order`
);
console.log('Category ready:', rows[0]);
await client.end();
