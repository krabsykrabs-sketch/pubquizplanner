#!/usr/bin/env tsx
/**
 * OpenTriviaQA Fetcher for PubQuizPlanner
 *
 * Downloads question files from the uberspot/OpenTriviaQA GitHub repository,
 * parses the plain-text format, and outputs one JSON file per category.
 *
 * Usage:
 *   npx tsx scripts/fetch-opentriviaqa.ts
 *   npx tsx scripts/fetch-opentriviaqa.ts --stats
 */

import fs from "fs";
import path from "path";

// ─── Types ───────────────────────────────────────────────────────────────────

interface OpenTriviaQuestion {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  source_category: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const OUTPUT_DIR = path.resolve(__dirname, "../data/opentriviaqa");
const GITHUB_API =
  "https://api.github.com/repos/uberspot/OpenTriviaQA/contents/categories";
const RAW_BASE =
  "https://raw.githubusercontent.com/uberspot/OpenTriviaQA/master/categories";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "User-Agent": "PubQuizPlanner/1.0" },
  });
  if (!res.ok) throw new Error(`Fetch failed (${res.status}): ${url}`);
  return res.json() as Promise<T>;
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "PubQuizPlanner/1.0" },
  });
  if (!res.ok) throw new Error(`Fetch failed (${res.status}): ${url}`);
  return res.text();
}

function parseQuestions(
  text: string,
  sourceCategory: string
): OpenTriviaQuestion[] {
  const questions: OpenTriviaQuestion[] = [];
  const blocks = text.split(/\n\s*\n/);

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const questionLine = lines.find((l) => l.startsWith("#Q"));
    const correctLine = lines.find((l) => l.startsWith("^"));
    if (!questionLine || !correctLine) continue;

    const question = questionLine.replace(/^#Q\s*/, "").trim();
    const correctAnswer = correctLine.replace(/^\^\s*/, "").trim();
    if (!question || !correctAnswer) continue;

    const optionLines = lines.filter((l) => /^[A-D]\s/.test(l));
    const incorrectAnswers = optionLines
      .map((l) => l.replace(/^[A-D]\s*/, "").trim())
      .filter((a) => a !== correctAnswer);

    questions.push({
      question,
      correct_answer: correctAnswer,
      incorrect_answers: incorrectAnswers,
      source_category: sourceCategory,
    });
  }

  return questions;
}

function categoryNameFromFile(filename: string): string {
  return filename.replace(/\.[^.]+$/, "");
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function showStats(): Promise<void> {
  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log("No data directory found. Run without --stats first.");
    return;
  }

  console.log("\nOpenTriviaQA question statistics:\n");
  let total = 0;
  const files = fs
    .readdirSync(OUTPUT_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  for (const file of files) {
    const data = JSON.parse(
      fs.readFileSync(path.join(OUTPUT_DIR, file), "utf-8")
    );
    const count = Array.isArray(data) ? data.length : 0;
    const name = file.replace(".json", "");
    console.log(`  ${name.padEnd(35)} ${String(count).padStart(5)} questions`);
    total += count;
  }

  console.log(
    `\n  ${"TOTAL".padEnd(35)} ${String(total).padStart(5)} questions\n`
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--stats")) {
    await showStats();
    return;
  }

  // 1. List category files from GitHub API
  console.log("Fetching file list from GitHub...\n");
  const contents = await fetchJSON<{ name: string; download_url: string }[]>(
    GITHUB_API
  );
  const textFiles = contents.filter(
    (f) => !f.name.startsWith(".") && !f.name.startsWith("README")
  );
  console.log(`Found ${textFiles.length} category files.\n`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let totalQuestions = 0;

  // 2. Download and parse each file
  for (const file of textFiles) {
    const category = categoryNameFromFile(file.name);
    const url = `${RAW_BASE}/${encodeURIComponent(file.name)}`;

    try {
      const text = await fetchText(url);
      const questions = parseQuestions(text, category);
      const outPath = path.join(OUTPUT_DIR, `${category}.json`);
      fs.writeFileSync(outPath, JSON.stringify(questions, null, 2), "utf-8");
      console.log(
        `  ✓ ${category.padEnd(35)} ${String(questions.length).padStart(5)} questions`
      );
      totalQuestions += questions.length;
    } catch (err) {
      console.error(
        `  ✗ ${category}: ${err instanceof Error ? err.message : err}`
      );
    }
  }

  console.log(
    `\nDone! Fetched ${totalQuestions} questions across ${textFiles.length} categories.`
  );
  console.log(`Output directory: ${OUTPUT_DIR}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
