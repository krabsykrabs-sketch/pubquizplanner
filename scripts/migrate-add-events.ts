// Creates the analytics events table. Run inside the production container:
//   npm run db:migrate-events
import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id BIGSERIAL PRIMARY KEY,
      event_type VARCHAR(40) NOT NULL,
      path TEXT,
      referrer TEXT,
      session_id VARCHAR(40),
      meta JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(
    'CREATE INDEX IF NOT EXISTS idx_events_type_time ON events (event_type, created_at)'
  );
  await pool.query(
    'CREATE INDEX IF NOT EXISTS idx_events_session_time ON events (session_id, created_at)'
  );
  console.log('events table ready');
  await pool.end();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
