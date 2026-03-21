import { readFileSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';
import { Pool } from 'pg';

// Load .env.local for DATABASE_URL
config({ path: resolve(__dirname, '..', '.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

function parseArgs(): { csvPath: string; category: string } {
  const args = process.argv.slice(2);
  let csvPath = '';
  let category = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--category' && args[i + 1]) {
      category = args[i + 1];
      i++;
    } else if (!csvPath) {
      csvPath = args[i];
    }
  }

  if (!csvPath || !category) {
    console.error('Usage: npx tsx scripts/import-csv.ts <path-to-csv> --category <slug>');
    process.exit(1);
  }

  return { csvPath: resolve(csvPath), category };
}

async function main() {
  const { csvPath, category } = parseArgs();

  // Look up category
  const catResult = await pool.query('SELECT id FROM categories WHERE slug = $1', [category]);
  if (catResult.rows.length === 0) {
    console.error(`Category "${category}" not found in database.`);
    await pool.end();
    process.exit(1);
  }
  const categoryId: number = catResult.rows[0].id;

  // Parse CSV
  const content = readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter((l) => l.trim() !== '');
  const headerFields = parseCsvLine(lines[0]);

  const colIndex: Record<string, number> = {};
  headerFields.forEach((h, i) => { colIndex[h.trim()] = i; });

  const required = ['text_de', 'answer_de', 'difficulty', 'status'];
  for (const col of required) {
    if (!(col in colIndex)) {
      console.error(`Missing required CSV column: ${col}`);
      await pool.end();
      process.exit(1);
    }
  }

  const dataRows = lines.slice(1).map(parseCsvLine);

  // Filter to approved/corrected
  const eligible = dataRows.filter((row) => {
    const status = (row[colIndex['status']] ?? '').trim().toLowerCase();
    return status === 'approved' || status === 'corrected';
  });

  console.log(`Found ${dataRows.length} total rows, ${eligible.length} approved/corrected.`);

  let inserted = 0;
  let skipped = 0;

  for (const row of eligible) {
    const textDe = row[colIndex['text_de']]?.trim() ?? '';
    const answerDe = row[colIndex['answer_de']]?.trim() ?? '';
    const difficulty = parseInt(row[colIndex['difficulty']]?.trim() ?? '0', 10);

    if (!textDe || !answerDe || difficulty < 1 || difficulty > 4) {
      console.warn(`Skipping invalid row: "${textDe.slice(0, 50)}..."`);
      skipped++;
      continue;
    }

    const wrongRaw = row[colIndex['wrong_answers_de']]?.trim() ?? '';
    const wrongAnswersDe = wrongRaw ? wrongRaw.split('|').map((s) => s.trim()).filter(Boolean) : null;

    const funFactDe = row[colIndex['fun_fact_de']]?.trim() || null;

    const tagsRaw = row[colIndex['tags']]?.trim() ?? '';
    const tags = tagsRaw ? tagsRaw.split('|').map((s) => s.trim()).filter(Boolean) : null;

    // Skip duplicates by text_de within this category
    const existing = await pool.query(
      'SELECT id FROM questions WHERE text_de = $1 AND category_id = $2 LIMIT 1',
      [textDe, categoryId]
    );
    if (existing.rows.length > 0) {
      skipped++;
      continue;
    }

    await pool.query(
      `INSERT INTO questions (category_id, text_de, answer_de, wrong_answers_de, fun_fact_de, difficulty, tags, round_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'standard')`,
      [categoryId, textDe, answerDe, wrongAnswersDe, funFactDe, difficulty, tags]
    );
    inserted++;
  }

  console.log(`Done. Inserted: ${inserted}, Skipped: ${skipped}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  pool.end();
  process.exit(1);
});
