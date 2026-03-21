import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname, basename, join } from 'path';
import * as XLSX from 'xlsx';

interface QuestionInput {
  text_de: string;
  answer_de: string;
  fun_fact_de?: string;
  difficulty: number;
  tags?: string[];
  wrong_answers_de?: string[];
}

const HEADERS = ['text_de', 'answer_de', 'wrong_answers_de', 'fun_fact_de', 'difficulty', 'tags', 'status'] as const;
const STATUS_OPTIONS = ['pending', 'approved', 'corrected', 'rejected'];

function escapeCsvField(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
    return '"' + value.replace(/"/g, '""') + '"';
  }
  return value;
}

function parseArgs(): { jsonPath: string; format: 'csv' | 'xlsx' } {
  const args = process.argv.slice(2);
  let jsonPath = '';
  let format: 'csv' | 'xlsx' = 'csv';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--format' && args[i + 1]) {
      const f = args[i + 1].toLowerCase();
      if (f !== 'csv' && f !== 'xlsx') {
        console.error('--format must be "csv" or "xlsx"');
        process.exit(1);
      }
      format = f;
      i++;
    } else if (!jsonPath) {
      jsonPath = args[i];
    }
  }

  if (!jsonPath) {
    console.error('Usage: npx tsx scripts/json-to-csv.ts <path-to-json> [--format csv|xlsx]');
    process.exit(1);
  }

  return { jsonPath: resolve(jsonPath), format };
}

function toRow(q: QuestionInput): string[] {
  return [
    q.text_de ?? '',
    q.answer_de ?? '',
    (q.wrong_answers_de ?? []).join('|'),
    q.fun_fact_de ?? '',
    String(q.difficulty ?? ''),
    (q.tags ?? []).join('|'),
    'pending',
  ];
}

const { jsonPath, format } = parseArgs();
const questions: QuestionInput[] = JSON.parse(readFileSync(jsonPath, 'utf-8'));

if (!Array.isArray(questions) || questions.length === 0) {
  console.error('JSON file must contain a non-empty array of question objects.');
  process.exit(1);
}

const rows = questions.map(toRow);

if (format === 'csv') {
  const csvLines = [
    HEADERS.join(','),
    ...rows.map((r) => r.map(escapeCsvField).join(',')),
  ];
  const outPath = join(dirname(jsonPath), basename(jsonPath, '.json') + '.csv');
  writeFileSync(outPath, csvLines.join('\n') + '\n', 'utf-8');
  console.log(`Wrote ${rows.length} rows to ${outPath}`);
} else {
  const aoa = [Array.from(HEADERS), ...rows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Auto-width: measure max content length per column
  const colWidths = HEADERS.map((h, ci) => {
    let max = h.length;
    for (const row of rows) {
      max = Math.max(max, (row[ci] ?? '').length);
    }
    return Math.min(max + 2, 60);
  });
  ws['!cols'] = colWidths.map((w) => ({ wch: w }));

  // Data validation dropdown on status column (col index 6, rows 1..N)
  const statusCol = HEADERS.indexOf('status');
  ws['!dataValidation'] = [
    {
      sqref: `${XLSX.utils.encode_col(statusCol)}2:${XLSX.utils.encode_col(statusCol)}${rows.length + 1}`,
      type: 'list',
      formula1: `"${STATUS_OPTIONS.join(',')}"`,
      showDropDown: true,
    },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Questions');

  const outPath = join(dirname(jsonPath), basename(jsonPath, '.json') + '.xlsx');
  XLSX.writeFile(wb, outPath);
  console.log(`Wrote ${rows.length} rows to ${outPath}`);
}
