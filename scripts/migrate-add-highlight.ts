import { config } from 'dotenv';
import { resolve } from 'path';
import { Pool } from 'pg';

config({ path: resolve(__dirname, '..', '.env.local') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  console.log('Running migration: add is_highlight + remap difficulty 4→3...');

  await pool.query(`
    ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_highlight BOOLEAN DEFAULT false;
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_questions_highlight ON questions(is_highlight);
  `);

  const result = await pool.query(`
    UPDATE questions SET difficulty = 3 WHERE difficulty = 4;
  `);
  console.log(`Updated ${result.rowCount} questions from difficulty 4 → 3.`);

  console.log('Migration complete.');
  await pool.end();
}

migrate().catch((err) => {
  console.error(err);
  pool.end();
  process.exit(1);
});
