import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';
import { Pool } from 'pg';

config({ path: resolve(__dirname, '..', '.env.local') });

const DATA_DIR = resolve(__dirname, '..', 'data', 'opentdb');

// OpenTDB category IDs → filenames
const OPENTDB_CATEGORIES = [
  { id: 9, file: 'general-knowledge' },
  { id: 10, file: 'books' },
  { id: 11, file: 'film' },
  { id: 12, file: 'music' },
  { id: 13, file: 'musicals-theatre' },
  { id: 14, file: 'television' },
  { id: 15, file: 'video-games' },
  { id: 16, file: 'board-games' },
  { id: 17, file: 'science-nature' },
  { id: 18, file: 'computers' },
  { id: 19, file: 'mathematics' },
  { id: 20, file: 'mythology' },
  { id: 21, file: 'sports' },
  { id: 22, file: 'geography' },
  { id: 23, file: 'history' },
  { id: 24, file: 'politics' },
  { id: 25, file: 'art' },
  { id: 26, file: 'celebrities' },
  { id: 27, file: 'animals' },
  { id: 28, file: 'vehicles' },
  { id: 29, file: 'comics' },
  { id: 30, file: 'gadgets' },
  { id: 31, file: 'anime-manga' },
  { id: 32, file: 'cartoons' },
];

function decodeHtml(html: string): string {
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&eacute;/g, 'é')
    .replace(/&ouml;/g, 'ö')
    .replace(/&uuml;/g, 'ü')
    .replace(/&auml;/g, 'ä')
    .replace(/&szlig;/g, 'ß')
    .replace(/&lrm;/g, '')
    .replace(/&rlm;/g, '')
    .replace(/&#\d+;/g, (match) => {
      const code = parseInt(match.replace('&#', '').replace(';', ''));
      return String.fromCharCode(code);
    });
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// --- Fetch ---

async function fetchAll() {
  mkdirSync(DATA_DIR, { recursive: true });

  for (const cat of OPENTDB_CATEGORIES) {
    const questions: {
      question: string;
      correct_answer: string;
      incorrect_answers: string[];
      difficulty: string;
    }[] = [];

    for (const difficulty of ['easy', 'medium', 'hard']) {
      const url = `https://opentdb.com/api.php?amount=50&category=${cat.id}&difficulty=${difficulty}&type=multiple`;
      console.log(`${cat.file} [${difficulty}]...`);

      try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.response_code === 0 && data.results) {
          for (const q of data.results) {
            questions.push({
              question: decodeHtml(q.question),
              correct_answer: decodeHtml(q.correct_answer),
              incorrect_answers: q.incorrect_answers.map(decodeHtml),
              difficulty: q.difficulty,
            });
          }
          console.log(`  ${data.results.length} questions`);
        } else {
          console.log(`  no results (code ${data.response_code})`);
        }
      } catch (err) {
        console.error(`  error: ${err}`);
      }

      // OpenTDB rate limit: 1 request per 5 seconds
      await sleep(5500);
    }

    // Deduplicate
    const seen = new Set<string>();
    const deduped = questions.filter((q) => {
      if (seen.has(q.question)) return false;
      seen.add(q.question);
      return true;
    });

    const outPath = resolve(DATA_DIR, `${cat.file}.json`);
    writeFileSync(outPath, JSON.stringify(deduped, null, 2), 'utf-8');
    console.log(`→ ${deduped.length} saved to ${cat.file}.json\n`);
  }

  console.log('Done.');
}

// --- Import ---

interface TranslatedQuestion {
  text_de: string;
  answer_de: string;
  wrong_answers_de?: string[];
  fun_fact_de?: string;
  difficulty?: number;
  tags?: string[];
}

async function importFile(filePath: string, categorySlug: string) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const catResult = await pool.query('SELECT id FROM categories WHERE slug = $1', [categorySlug]);
  if (catResult.rows.length === 0) {
    console.error(`Category "${categorySlug}" not found.`);
    await pool.end();
    process.exit(1);
  }
  const categoryId: number = catResult.rows[0].id;

  const questions: TranslatedQuestion[] = JSON.parse(readFileSync(resolve(filePath), 'utf-8'));
  console.log(`Loaded ${questions.length} questions for ${categorySlug}`);

  const batchId = `opentdb-${categorySlug}-${new Date().toISOString().slice(0, 10)}`;
  let inserted = 0;
  let skipped = 0;

  for (const q of questions) {
    if (!q.text_de || !q.answer_de) {
      skipped++;
      continue;
    }

    // Skip duplicates
    const existing = await pool.query(
      'SELECT id FROM questions WHERE text_de = $1 AND category_id = $2 LIMIT 1',
      [q.text_de, categoryId]
    );
    if (existing.rows.length > 0) {
      skipped++;
      continue;
    }

    const tags = [...(q.tags || [])];
    if (!tags.includes('opentdb')) tags.push('opentdb');

    await pool.query(
      `INSERT INTO questions
       (category_id, text_de, answer_de, wrong_answers_de, fun_fact_de, difficulty,
        tags, round_type, status, generation_batch_id, verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'standard', 'pending', $8, false)`,
      [
        categoryId,
        q.text_de,
        q.answer_de,
        q.wrong_answers_de?.length ? q.wrong_answers_de : null,
        q.fun_fact_de || null,
        q.difficulty || 2,
        tags,
        batchId,
      ]
    );
    inserted++;
  }

  console.log(`Inserted: ${inserted}, Skipped: ${skipped}`);
  await pool.end();
}

// --- CLI ---

const args = process.argv.slice(2);

if (args[0] === '--fetch') {
  fetchAll().catch(console.error);
} else if (args[0] === '--import') {
  const filePath = args[1];
  let categorySlug = '';
  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--category' && args[i + 1]) {
      categorySlug = args[i + 1];
      break;
    }
  }
  if (!filePath || !categorySlug) {
    console.error('Usage: npx tsx scripts/import-opentdb.ts --import <file.json> --category <slug>');
    process.exit(1);
  }
  importFile(filePath, categorySlug).catch(console.error);
} else {
  console.log(`Usage:
  npx tsx scripts/import-opentdb.ts --fetch
    Download all English questions from OpenTDB into data/opentdb/*.json

  npx tsx scripts/import-opentdb.ts --import <file.json> --category <slug>
    Import translated German questions into the database
    Example: npx tsx scripts/import-opentdb.ts --import data/translated/science-de.json --category wissenschaft`);
}
