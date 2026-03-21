import { config } from 'dotenv';
import { resolve } from 'path';
import { Pool } from 'pg';

config({ path: resolve(__dirname, '..', '.env.local') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  console.log('Running migration: add status and generation_batch_id...');

  await pool.query(`
    ALTER TABLE questions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved';
  `);
  await pool.query(`
    ALTER TABLE questions ADD COLUMN IF NOT EXISTS generation_batch_id VARCHAR(50);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_questions_batch ON questions(generation_batch_id);
  `);

  console.log('Migration complete.');
  await pool.end();
}

migrate().catch((err) => {
  console.error(err);
  pool.end();
  process.exit(1);
});
