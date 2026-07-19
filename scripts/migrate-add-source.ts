import { config } from 'dotenv';
import { resolve } from 'path';
import { Pool } from 'pg';

config({ path: resolve(__dirname, '..', '.env.local') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  console.log('Running migration: add source column...');

  await pool.query(`
    ALTER TABLE questions ADD COLUMN IF NOT EXISTS source TEXT;
  `);

  console.log('Migration complete.');
  await pool.end();
}

migrate().catch((err) => {
  console.error(err);
  pool.end();
  process.exit(1);
});
