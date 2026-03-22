#!/usr/bin/env tsx
/**
 * Wikidata Question Generator for PubQuizPlanner
 *
 * Queries Wikidata's SPARQL endpoint to generate factually correct German quiz questions.
 * No AI needed — questions are built from structured data, so answers are guaranteed correct.
 *
 * Usage:
 *   npx tsx scripts/generate-from-wikidata.ts --all
 *   npx tsx scripts/generate-from-wikidata.ts --template geo
 *   npx tsx scripts/generate-from-wikidata.ts --template geo-capitals
 *   npx tsx scripts/generate-from-wikidata.ts --stats
 */

import fs from "fs";
import path from "path";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WikidataQuestion {
  text_de: string;
  text_de_open: string;
  answer_de: string;
  wrong_answers_de: string[];
  fun_fact_de: null;
  difficulty: number;
  tags: string[];
  source: "wikidata";
}

interface SparqlBinding {
  [key: string]: { type: string; value: string; "xml:lang"?: string };
}

interface SparqlResult {
  results: { bindings: SparqlBinding[] };
}

interface TemplateDefinition {
  id: string;
  filename: string;
  generate: () => Promise<WikidataQuestion[]>;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const OUTPUT_DIR = path.resolve(__dirname, "../data/wikidata");
const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";
const USER_AGENT = "PubQuizPlanner/1.0 (contact@pubquizplanner.com)";
const RATE_LIMIT_MS = 2000;

let lastQueryTime = 0;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function sparqlQuery(query: string): Promise<SparqlBinding[]> {
  // Rate limiting
  const now = Date.now();
  const elapsed = now - lastQueryTime;
  if (elapsed < RATE_LIMIT_MS) {
    await sleep(RATE_LIMIT_MS - elapsed);
  }

  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/sparql-results+json",
      "User-Agent": USER_AGENT,
    },
  });

  lastQueryTime = Date.now();

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SPARQL query failed (${res.status}): ${body.slice(0, 500)}`);
  }

  const data: SparqlResult = await res.json();
  return data.results.bindings;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function val(binding: SparqlBinding, key: string): string {
  return binding[key]?.value ?? "";
}

function numVal(binding: SparqlBinding, key: string): number {
  return parseInt(binding[key]?.value ?? "0", 10);
}

/** Returns true if the label looks like a Q-ID (no real label exists) */
function isQId(label: string): boolean {
  return /^Q\d+$/.test(label);
}

function difficultyFromSitelinks(sitelinks: number): number {
  if (sitelinks > 200) return 1;
  if (sitelinks >= 100) return 2;
  if (sitelinks >= 50) return 3;
  return 4;
}

/** Deduplicate questions by text_de */
function dedup(questions: WikidataQuestion[]): WikidataQuestion[] {
  const seen = new Set<string>();
  return questions.filter((q) => {
    const key = q.text_de;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function writeOutput(filename: string, questions: WikidataQuestion[]): void {
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), "utf-8");
}

// ─── Template: geo-capitals ─────────────────────────────────────────────────

async function generateGeoCapitals(): Promise<WikidataQuestion[]> {
  const query = `
    SELECT ?country ?countryLabel ?capital ?capitalLabel ?sitelinks WHERE {
      ?country wdt:P31 wd:Q3624078 .
      ?country wdt:P36 ?capital .
      ?country wikibase:sitelinks ?sitelinks .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY DESC(?sitelinks)
  `;

  const bindings = await sparqlQuery(query);
  const allCapitals: string[] = [];
  const entries: { country: string; capital: string; sitelinks: number }[] = [];

  for (const b of bindings) {
    const country = val(b, "countryLabel");
    const capital = val(b, "capitalLabel");
    const sitelinks = numVal(b, "sitelinks");
    if (isQId(country) || isQId(capital)) continue;
    allCapitals.push(capital);
    entries.push({ country, capital, sitelinks });
  }

  const uniqueCapitals = Array.from(new Set(allCapitals));

  return dedup(
    entries.map((e) => ({
      text_de: `Was ist die Hauptstadt von ${e.country}?`,
      text_de_open: `Was ist die Hauptstadt von ${e.country}?`,
      answer_de: e.capital,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: difficultyFromSitelinks(e.sitelinks),
      tags: ["geographie", "hauptstadt"],
      source: "wikidata" as const,
    }))
  );
}

// ─── Template: geo-continents ────────────────────────────────────────────────

async function generateGeoContinents(): Promise<WikidataQuestion[]> {
  const query = `
    SELECT ?country ?countryLabel ?continent ?continentLabel ?sitelinks WHERE {
      ?country wdt:P31 wd:Q3624078 .
      ?country wdt:P30 ?continent .
      ?country wikibase:sitelinks ?sitelinks .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY DESC(?sitelinks)
  `;

  const bindings = await sparqlQuery(query);
  const allContinents: string[] = [];
  const entries: { country: string; continent: string; sitelinks: number }[] = [];

  for (const b of bindings) {
    const country = val(b, "countryLabel");
    const continent = val(b, "continentLabel");
    const sitelinks = numVal(b, "sitelinks");
    if (isQId(country) || isQId(continent)) continue;
    allContinents.push(continent);
    entries.push({ country, continent, sitelinks });
  }

  const uniqueContinents = [...new Set(allContinents)];

  return dedup(
    entries.map((e) => ({
      text_de: `Auf welchem Kontinent liegt ${e.country}?`,
      text_de_open: `Auf welchem Kontinent liegt ${e.country}?`,
      answer_de: e.continent,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: difficultyFromSitelinks(e.sitelinks),
      tags: ["geographie", "kontinent"],
      source: "wikidata" as const,
    }))
  );
}

// ─── Template: geo-rivers ────────────────────────────────────────────────────

async function generateGeoRivers(): Promise<WikidataQuestion[]> {
  const query = `
    SELECT ?river ?riverLabel ?city ?cityLabel ?sitelinks WHERE {
      ?city wdt:P31 wd:Q5119 .
      ?city wdt:P17 ?country .
      ?country wdt:P36 ?city .
      ?river wdt:P31/wdt:P279* wd:Q4022 .
      ?river wdt:P177?/wdt:P931? ?city .
      FILTER EXISTS { ?river wdt:P177 ?city } .
      ?river wikibase:sitelinks ?sitelinks .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY DESC(?sitelinks)
    LIMIT 200
  `;

  // Simpler fallback: rivers flowing through capitals
  const fallbackQuery = `
    SELECT DISTINCT ?river ?riverLabel ?city ?cityLabel ?riverSitelinks WHERE {
      ?country wdt:P31 wd:Q3624078 .
      ?country wdt:P36 ?city .
      ?river wdt:P31/wdt:P279* wd:Q4022 .
      ?city wdt:P206 ?river .
      ?river wikibase:sitelinks ?riverSitelinks .
      FILTER(?riverSitelinks > 30)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY DESC(?riverSitelinks)
    LIMIT 200
  `;

  let bindings: SparqlBinding[];
  try {
    bindings = await sparqlQuery(query);
    if (bindings.length < 10) {
      bindings = await sparqlQuery(fallbackQuery);
    }
  } catch {
    bindings = await sparqlQuery(fallbackQuery);
  }

  const allRivers: string[] = [];
  const allCities: string[] = [];
  const entries: { river: string; city: string; sitelinks: number }[] = [];

  for (const b of bindings) {
    const river = val(b, "riverLabel");
    const city = val(b, "cityLabel");
    const sitelinks = numVal(b, "riverSitelinks") || numVal(b, "sitelinks");
    if (isQId(river) || isQId(city)) continue;
    allRivers.push(river);
    allCities.push(city);
    entries.push({ river, city, sitelinks });
  }

  const uniqueRivers = [...new Set(allRivers)];
  const uniqueCities = [...new Set(allCities)];
  const questions: WikidataQuestion[] = [];

  for (const e of entries) {
    questions.push({
      text_de: `Durch welche Hauptstadt fließt der Fluss ${e.river}?`,
      text_de_open: `Durch welche Hauptstadt fließt der Fluss ${e.river}?`,
      answer_de: e.city,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: difficultyFromSitelinks(e.sitelinks),
      tags: ["geographie", "fluss", "hauptstadt"],
      source: "wikidata" as const,
    });
    questions.push({
      text_de: `Welcher Fluss fließt durch ${e.city}?`,
      text_de_open: `Welcher Fluss fließt durch ${e.city}?`,
      answer_de: e.river,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: difficultyFromSitelinks(e.sitelinks),
      tags: ["geographie", "fluss", "hauptstadt"],
      source: "wikidata" as const,
    });
  }

  return dedup(questions);
}

// ─── Template: geo-highest-mountains ─────────────────────────────────────────

async function generateGeoMountains(): Promise<WikidataQuestion[]> {
  const query = `
    SELECT ?country ?countryLabel ?mountain ?mountainLabel ?sitelinks WHERE {
      ?country wdt:P31 wd:Q3624078 .
      ?country wdt:P610 ?mountain .
      ?country wikibase:sitelinks ?sitelinks .
      FILTER(?sitelinks > 50)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY DESC(?sitelinks)
  `;

  const bindings = await sparqlQuery(query);
  const allMountains: string[] = [];
  const entries: { country: string; mountain: string; sitelinks: number }[] = [];

  for (const b of bindings) {
    const country = val(b, "countryLabel");
    const mountain = val(b, "mountainLabel");
    const sitelinks = numVal(b, "sitelinks");
    if (isQId(country) || isQId(mountain)) continue;
    allMountains.push(mountain);
    entries.push({ country, mountain, sitelinks });
  }

  const uniqueMountains = [...new Set(allMountains)];

  return dedup(
    entries.map((e) => ({
      text_de: `Wie heißt der höchste Berg in ${e.country}?`,
      text_de_open: `Wie heißt der höchste Berg in ${e.country}?`,
      answer_de: e.mountain,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: difficultyFromSitelinks(e.sitelinks),
      tags: ["geographie", "berg"],
      source: "wikidata" as const,
    }))
  );
}

// ─── Template: geo-country-flags (reverse capitals) ──────────────────────────

async function generateGeoCountryFlags(): Promise<WikidataQuestion[]> {
  // As noted in the spec, flag descriptions are tricky from Wikidata.
  // We generate reverse-capital questions: "Welches Land hat die Hauptstadt X?"
  const query = `
    SELECT ?country ?countryLabel ?capital ?capitalLabel ?sitelinks WHERE {
      ?country wdt:P31 wd:Q3624078 .
      ?country wdt:P36 ?capital .
      ?country wikibase:sitelinks ?sitelinks .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY DESC(?sitelinks)
  `;

  const bindings = await sparqlQuery(query);
  const allCountries: string[] = [];
  const entries: { country: string; capital: string; sitelinks: number }[] = [];

  for (const b of bindings) {
    const country = val(b, "countryLabel");
    const capital = val(b, "capitalLabel");
    const sitelinks = numVal(b, "sitelinks");
    if (isQId(country) || isQId(capital)) continue;
    allCountries.push(country);
    entries.push({ country, capital, sitelinks });
  }

  const uniqueCountries = [...new Set(allCountries)];

  return dedup(
    entries.map((e) => ({
      text_de: `Welches Land hat die Hauptstadt ${e.capital}?`,
      text_de_open: `Welches Land hat die Hauptstadt ${e.capital}?`,
      answer_de: e.country,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: difficultyFromSitelinks(e.sitelinks),
      tags: ["geographie", "hauptstadt"],
      source: "wikidata" as const,
    }))
  );
}

// ─── Template: science-elements ──────────────────────────────────────────────

async function generateScienceElements(): Promise<WikidataQuestion[]> {
  const query = `
    SELECT ?element ?elementLabel ?symbol ?atomicNumber ?sitelinks WHERE {
      ?element wdt:P31 wd:Q11344 .
      ?element wdt:P246 ?symbol .
      ?element wdt:P1086 ?atomicNumber .
      ?element wikibase:sitelinks ?sitelinks .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY ?atomicNumber
  `;

  const bindings = await sparqlQuery(query);
  const allElements: string[] = [];
  const allSymbols: string[] = [];
  const allNumbers: number[] = [];
  const entries: { element: string; symbol: string; atomicNumber: number; sitelinks: number }[] = [];

  for (const b of bindings) {
    const element = val(b, "elementLabel");
    const symbol = val(b, "symbol");
    const atomicNumber = numVal(b, "atomicNumber");
    const sitelinks = numVal(b, "sitelinks");
    if (isQId(element)) continue;
    allElements.push(element);
    allSymbols.push(symbol);
    allNumbers.push(atomicNumber);
    entries.push({ element, symbol, atomicNumber, sitelinks });
  }

  const uniqueElements = [...new Set(allElements)];
  const uniqueSymbols = [...new Set(allSymbols)];
  const questions: WikidataQuestion[] = [];

  for (const e of entries) {
    // "Welches chemische Element hat das Symbol X?"
    questions.push({
      text_de: `Welches chemische Element hat das Symbol ${e.symbol}?`,
      text_de_open: `Welches chemische Element hat das Symbol ${e.symbol}?`,
      answer_de: e.element,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: difficultyFromSitelinks(e.sitelinks),
      tags: ["wissenschaft", "chemie", "element"],
      source: "wikidata" as const,
    });

    // "Was ist das chemische Symbol von X?"
    questions.push({
      text_de: `Was ist das chemische Symbol von ${e.element}?`,
      text_de_open: `Was ist das chemische Symbol von ${e.element}?`,
      answer_de: e.symbol,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: difficultyFromSitelinks(e.sitelinks),
      tags: ["wissenschaft", "chemie", "element"],
      source: "wikidata" as const,
    });

    // "Welches Element hat die Ordnungszahl X?"
    questions.push({
      text_de: `Welches Element hat die Ordnungszahl ${e.atomicNumber}?`,
      text_de_open: `Welches Element hat die Ordnungszahl ${e.atomicNumber}?`,
      answer_de: e.element,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: difficultyFromSitelinks(e.sitelinks),
      tags: ["wissenschaft", "chemie", "element"],
      source: "wikidata" as const,
    });
  }

  return dedup(questions);
}

// ─── Template: science-planets ───────────────────────────────────────────────

async function generateSciencePlanets(): Promise<WikidataQuestion[]> {
  const query = `
    SELECT ?planet ?planetLabel ?distanceFromSun ?numberOfMoons ?diameter ?sitelinks WHERE {
      ?planet wdt:P31 wd:Q634 .
      ?planet wdt:P397 wd:Q525 .
      OPTIONAL { ?planet wdt:P2243 ?distanceFromSun . }
      OPTIONAL { ?planet wdt:P1116 ?numberOfMoons . }
      OPTIONAL { ?planet wdt:P2386 ?diameter . }
      ?planet wikibase:sitelinks ?sitelinks .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY ?distanceFromSun
  `;

  const bindings = await sparqlQuery(query);

  // Hardcode order from sun since Wikidata distances can be tricky
  const planetOrder = [
    "Merkur",
    "Venus",
    "Erde",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptun",
  ];

  const ordinals = [
    "erste",
    "zweite",
    "dritte",
    "vierte",
    "fünfte",
    "sechste",
    "siebte",
    "achte",
  ];

  const allPlanets: string[] = [];
  const moonData: { planet: string; moons: number; sitelinks: number }[] = [];

  for (const b of bindings) {
    const planet = val(b, "planetLabel");
    if (isQId(planet)) continue;
    allPlanets.push(planet);

    const moons = numVal(b, "numberOfMoons");
    const sitelinks = numVal(b, "sitelinks");
    if (moons > 0) {
      moonData.push({ planet, moons, sitelinks });
    }
  }

  const uniquePlanets = [...new Set(allPlanets)];
  const questions: WikidataQuestion[] = [];

  // "Welcher Planet ist der Xte von der Sonne?"
  for (let i = 0; i < planetOrder.length; i++) {
    questions.push({
      text_de: `Welcher Planet ist der ${ordinals[i]} von der Sonne aus gesehen?`,
      text_de_open: `Welcher Planet ist der ${ordinals[i]} von der Sonne aus gesehen?`,
      answer_de: planetOrder[i],
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: i < 4 ? 1 : 2,
      tags: ["wissenschaft", "astronomie", "planet"],
      source: "wikidata" as const,
    });
  }

  // "Welcher Planet ist der größte in unserem Sonnensystem?"
  questions.push({
    text_de: "Welcher Planet ist der größte in unserem Sonnensystem?",
    text_de_open: "Welcher Planet ist der größte in unserem Sonnensystem?",
    answer_de: "Jupiter",
    wrong_answers_de: [],
    fun_fact_de: null,
    difficulty: 1,
    tags: ["wissenschaft", "astronomie", "planet"],
    source: "wikidata" as const,
  });

  // "Welcher Planet ist der kleinste in unserem Sonnensystem?"
  questions.push({
    text_de: "Welcher Planet ist der kleinste in unserem Sonnensystem?",
    text_de_open: "Welcher Planet ist der kleinste in unserem Sonnensystem?",
    answer_de: "Merkur",
    wrong_answers_de: [],
    fun_fact_de: null,
    difficulty: 2,
    tags: ["wissenschaft", "astronomie", "planet"],
    source: "wikidata" as const,
  });

  // Moon count questions
  for (const m of moonData) {
    questions.push({
      text_de: `Wie viele bekannte Monde hat der Planet ${m.planet}?`,
      text_de_open: `Wie viele bekannte Monde hat der Planet ${m.planet}?`,
      answer_de: String(m.moons),
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: difficultyFromSitelinks(m.sitelinks),
      tags: ["wissenschaft", "astronomie", "planet"],
      source: "wikidata" as const,
    });
  }

  return dedup(questions);
}

// ─── Template: literature-authors ────────────────────────────────────────────

async function generateLiteratureAuthors(): Promise<WikidataQuestion[]> {
  const query = `
    SELECT ?book ?bookLabel ?author ?authorLabel ?year ?sitelinks WHERE {
      ?book wdt:P31/wdt:P279* wd:Q7725634 .
      ?book wdt:P50 ?author .
      OPTIONAL { ?book wdt:P577 ?pubdate . BIND(YEAR(?pubdate) AS ?year) }
      ?book wikibase:sitelinks ?sitelinks .
      FILTER(?sitelinks > 100)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY DESC(?sitelinks)
    LIMIT 300
  `;

  const bindings = await sparqlQuery(query);
  const allAuthors: string[] = [];
  const entries: { book: string; author: string; year: string; sitelinks: number }[] = [];

  for (const b of bindings) {
    const book = val(b, "bookLabel");
    const author = val(b, "authorLabel");
    const year = val(b, "year");
    const sitelinks = numVal(b, "sitelinks");
    if (isQId(book) || isQId(author)) continue;
    allAuthors.push(author);
    entries.push({ book, author, year, sitelinks });
  }

  const uniqueAuthors = [...new Set(allAuthors)];
  const questions: WikidataQuestion[] = [];

  for (const e of entries) {
    questions.push({
      text_de: `Wer schrieb das Buch „${e.book}"?`,
      text_de_open: `Wer schrieb das Buch „${e.book}"?`,
      answer_de: e.author,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: difficultyFromSitelinks(e.sitelinks),
      tags: ["literatur", "autor"],
      source: "wikidata" as const,
    });

    if (e.year) {
      questions.push({
        text_de: `Welchen Roman schrieb ${e.author}? (Hinweis: Erscheinungsjahr ${e.year})`,
        text_de_open: `Welchen Roman schrieb ${e.author}? (Hinweis: Erscheinungsjahr ${e.year})`,
        answer_de: e.book,
        wrong_answers_de: [],
        fun_fact_de: null,
        difficulty: difficultyFromSitelinks(e.sitelinks),
        tags: ["literatur", "autor", "roman"],
        source: "wikidata" as const,
      });
    }
  }

  return dedup(questions);
}

// ─── Template: art-paintings ─────────────────────────────────────────────────

async function generateArtPaintings(): Promise<WikidataQuestion[]> {
  // Use broader search: paintings and other visual artworks
  const query = `
    SELECT ?painting ?paintingLabel ?artist ?artistLabel ?sitelinks WHERE {
      VALUES ?type { wd:Q3305213 wd:Q18573970 wd:Q860861 }
      ?painting wdt:P31 ?type .
      ?painting wdt:P170 ?artist .
      ?artist wdt:P31 wd:Q5 .
      ?painting wikibase:sitelinks ?sitelinks .
      FILTER(?sitelinks > 40)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY DESC(?sitelinks)
    LIMIT 200
  `;

  const bindings = await sparqlQuery(query);
  const allArtists: string[] = [];
  const entries: { painting: string; artist: string; sitelinks: number }[] = [];

  for (const b of bindings) {
    const painting = val(b, "paintingLabel");
    const artist = val(b, "artistLabel");
    const sitelinks = numVal(b, "sitelinks");
    if (isQId(painting) || isQId(artist)) continue;
    allArtists.push(artist);
    entries.push({ painting, artist, sitelinks });
  }

  const uniqueArtists = [...new Set(allArtists)];

  return dedup(
    entries.map((e) => ({
      text_de: `Wer malte das Gemälde „${e.painting}"?`,
      text_de_open: `Wer malte das Gemälde „${e.painting}"?`,
      answer_de: e.artist,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: difficultyFromSitelinks(e.sitelinks),
      tags: ["kunst", "malerei"],
      source: "wikidata" as const,
    }))
  );
}

// ─── Template: history-birthyears ────────────────────────────────────────────

async function generateHistoryBirthyears(): Promise<WikidataQuestion[]> {
  // Query famous people with birth year - use P106 (occupation) to help optimizer
  const query = `
    SELECT ?person ?personLabel ?birthYear ?sitelinks WHERE {
      ?person wdt:P31 wd:Q5 .
      ?person wdt:P569 ?birthDate .
      ?person wikibase:sitelinks ?sitelinks .
      FILTER(?sitelinks > 250)
      BIND(YEAR(?birthDate) AS ?birthYear)
      FILTER(?birthYear > 0)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY DESC(?sitelinks)
    LIMIT 150
  `;

  const bindings = await sparqlQuery(query);
  const entries: { person: string; birthYear: number; sitelinks: number }[] = [];

  for (const b of bindings) {
    const person = val(b, "personLabel");
    const birthYear = numVal(b, "birthYear");
    const sitelinks = numVal(b, "sitelinks");
    if (isQId(person) || birthYear === 0) continue;
    entries.push({ person, birthYear, sitelinks });
  }

  function centuryOf(year: number): string {
    const c = Math.ceil(year / 100);
    return `${c}. Jahrhundert`;
  }

  const allCenturies = [...new Set(entries.map((e) => centuryOf(e.birthYear)))];

  return dedup(
    entries.map((e) => {
      const century = centuryOf(e.birthYear);
      return {
        text_de: `In welchem Jahrhundert wurde ${e.person} geboren?`,
        text_de_open: `In welchem Jahrhundert wurde ${e.person} geboren?`,
        answer_de: century,
        wrong_answers_de: [],
        fun_fact_de: null,
        difficulty: difficultyFromSitelinks(e.sitelinks),
        tags: ["geschichte", "persönlichkeit"],
        source: "wikidata" as const,
      };
    })
  );
}

// ─── Template: history-inventions ────────────────────────────────────────────

async function generateHistoryInventions(): Promise<WikidataQuestion[]> {
  const query = `
    SELECT ?invention ?inventionLabel ?inventor ?inventorLabel ?year ?sitelinks WHERE {
      ?invention wdt:P61 ?inventor .
      OPTIONAL { ?invention wdt:P575 ?date . BIND(YEAR(?date) AS ?year) }
      ?invention wikibase:sitelinks ?sitelinks .
      FILTER(?sitelinks > 50)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY DESC(?sitelinks)
    LIMIT 200
  `;

  const bindings = await sparqlQuery(query);
  const allInventors: string[] = [];
  const entries: { invention: string; inventor: string; year: string; sitelinks: number }[] = [];

  for (const b of bindings) {
    const invention = val(b, "inventionLabel");
    const inventor = val(b, "inventorLabel");
    const year = val(b, "year");
    const sitelinks = numVal(b, "sitelinks");
    if (isQId(invention) || isQId(inventor)) continue;
    allInventors.push(inventor);
    entries.push({ invention, inventor, year, sitelinks });
  }

  const uniqueInventors = [...new Set(allInventors)];
  const questions: WikidataQuestion[] = [];

  for (const e of entries) {
    questions.push({
      text_de: `Wer erfand ${e.invention}?`,
      text_de_open: `Wer erfand ${e.invention}?`,
      answer_de: e.inventor,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: difficultyFromSitelinks(e.sitelinks),
      tags: ["geschichte", "erfindung"],
      source: "wikidata" as const,
    });

    if (e.year) {
      questions.push({
        text_de: `In welchem Jahr wurde ${e.invention} erfunden?`,
        text_de_open: `In welchem Jahr wurde ${e.invention} erfunden?`,
        answer_de: e.year,
        wrong_answers_de: [],
        fun_fact_de: null,
        difficulty: difficultyFromSitelinks(e.sitelinks),
        tags: ["geschichte", "erfindung"],
        source: "wikidata" as const,
      });
    }
  }

  return dedup(questions);
}

// ─── Template: sport-football-winners ────────────────────────────────────────

async function generateSportFootball(): Promise<WikidataQuestion[]> {
  // FIFA World Cup editions - Q19317 is "FIFA World Cup" edition, use P361 (part of) Q19317
  const query = `
    SELECT ?edition ?editionLabel ?winner ?winnerLabel ?year WHERE {
      ?edition wdt:P31 wd:Q26849 .
      ?edition wdt:P1346 ?winner .
      OPTIONAL { ?edition wdt:P580 ?startDate . BIND(YEAR(?startDate) AS ?yearStart) }
      OPTIONAL { ?edition wdt:P585 ?pointInTime . BIND(YEAR(?pointInTime) AS ?yearPit) }
      BIND(COALESCE(?yearStart, ?yearPit) AS ?year)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY ?year
  `;

  const bindings = await sparqlQuery(query);
  const allWinners: string[] = [];
  const entries: { year: number; winner: string }[] = [];

  for (const b of bindings) {
    const winner = val(b, "winnerLabel");
    const year = numVal(b, "year");
    if (isQId(winner) || year === 0) continue;
    allWinners.push(winner);
    entries.push({ year, winner });
  }

  const uniqueWinners = [...new Set(allWinners)];

  return dedup(
    entries.map((e) => ({
      text_de: `Welches Land gewann die Fußball-Weltmeisterschaft ${e.year}?`,
      text_de_open: `Welches Land gewann die Fußball-Weltmeisterschaft ${e.year}?`,
      answer_de: e.winner,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: e.year >= 1990 ? 1 : e.year >= 1970 ? 2 : 3,
      tags: ["sport", "fußball", "weltmeisterschaft"],
      source: "wikidata" as const,
    }))
  );
}

// ─── Template: sport-olympics ────────────────────────────────────────────────

async function generateSportOlympics(): Promise<WikidataQuestion[]> {
  // Summer Olympics: Q5389 (Summer Olympic Games)
  const query = `
    SELECT ?games ?gamesLabel ?city ?cityLabel ?year WHERE {
      ?games wdt:P31 wd:Q82414 .
      ?games wdt:P276 ?city .
      OPTIONAL { ?games wdt:P580 ?startDate . BIND(YEAR(?startDate) AS ?yearStart) }
      OPTIONAL { ?games wdt:P585 ?pointInTime . BIND(YEAR(?pointInTime) AS ?yearPit) }
      BIND(COALESCE(?yearStart, ?yearPit) AS ?year)
      FILTER(?year > 0)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY ?year
  `;

  const bindings = await sparqlQuery(query);
  const allCities: string[] = [];
  const entries: { year: number; city: string }[] = [];

  for (const b of bindings) {
    const city = val(b, "cityLabel");
    const year = numVal(b, "year");
    if (isQId(city) || year === 0) continue;
    allCities.push(city);
    entries.push({ year, city });
  }

  const uniqueCities = [...new Set(allCities)];

  return dedup(
    entries.map((e) => ({
      text_de: `In welcher Stadt fanden die Olympischen Sommerspiele ${e.year} statt?`,
      text_de_open: `In welcher Stadt fanden die Olympischen Sommerspiele ${e.year} statt?`,
      answer_de: e.city,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: e.year >= 2000 ? 1 : e.year >= 1980 ? 2 : 3,
      tags: ["sport", "olympia"],
      source: "wikidata" as const,
    }))
  );
}

// ─── Template: music-bands-origin ────────────────────────────────────────────

async function generateMusicBands(): Promise<WikidataQuestion[]> {
  const query = `
    SELECT ?band ?bandLabel ?country ?countryLabel ?sitelinks WHERE {
      ?band wdt:P31/wdt:P279* wd:Q215380 .
      ?band wdt:P495 ?country .
      ?band wikibase:sitelinks ?sitelinks .
      FILTER(?sitelinks > 150)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY DESC(?sitelinks)
    LIMIT 200
  `;

  const bindings = await sparqlQuery(query);
  const allCountries: string[] = [];
  const entries: { band: string; country: string; sitelinks: number }[] = [];

  for (const b of bindings) {
    const band = val(b, "bandLabel");
    const country = val(b, "countryLabel");
    const sitelinks = numVal(b, "sitelinks");
    if (isQId(band) || isQId(country)) continue;
    allCountries.push(country);
    entries.push({ band, country, sitelinks });
  }

  const uniqueCountries = [...new Set(allCountries)];

  return dedup(
    entries.map((e) => ({
      text_de: `Aus welchem Land kommt die Band ${e.band}?`,
      text_de_open: `Aus welchem Land kommt die Band ${e.band}?`,
      answer_de: e.country,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: difficultyFromSitelinks(e.sitelinks),
      tags: ["musik", "band"],
      source: "wikidata" as const,
    }))
  );
}

// ─── Template: film-directors ────────────────────────────────────────────────

async function generateFilmDirectors(): Promise<WikidataQuestion[]> {
  const query = `
    SELECT ?film ?filmLabel ?director ?directorLabel ?sitelinks WHERE {
      ?film wdt:P31 wd:Q11424 .
      ?film wdt:P57 ?director .
      ?director wdt:P31 wd:Q5 .
      ?film wikibase:sitelinks ?sitelinks .
      FILTER(?sitelinks > 200)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY DESC(?sitelinks)
    LIMIT 150
  `;

  const bindings = await sparqlQuery(query);
  const allDirectors: string[] = [];
  const entries: { film: string; director: string; sitelinks: number }[] = [];

  for (const b of bindings) {
    const film = val(b, "filmLabel");
    const director = val(b, "directorLabel");
    const sitelinks = numVal(b, "sitelinks");
    if (isQId(film) || isQId(director)) continue;
    allDirectors.push(director);
    entries.push({ film, director, sitelinks });
  }

  const uniqueDirectors = [...new Set(allDirectors)];

  return dedup(
    entries.map((e) => ({
      text_de: `Wer führte Regie beim Film „${e.film}"?`,
      text_de_open: `Wer führte Regie beim Film „${e.film}"?`,
      answer_de: e.director,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: difficultyFromSitelinks(e.sitelinks),
      tags: ["film", "regisseur"],
      source: "wikidata" as const,
    }))
  );
}

// ─── Template: film-years ────────────────────────────────────────────────────

async function generateFilmYears(): Promise<WikidataQuestion[]> {
  const query = `
    SELECT ?film ?filmLabel ?year ?sitelinks WHERE {
      ?film wdt:P31 wd:Q11424 .
      ?film wdt:P577 ?pubdate .
      ?film wikibase:sitelinks ?sitelinks .
      FILTER(?sitelinks > 200)
      BIND(YEAR(?pubdate) AS ?year)
      FILTER(?year > 0)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY DESC(?sitelinks)
    LIMIT 150
  `;

  const bindings = await sparqlQuery(query);
  const entries: { film: string; year: number; sitelinks: number }[] = [];

  for (const b of bindings) {
    const film = val(b, "filmLabel");
    const year = numVal(b, "year");
    const sitelinks = numVal(b, "sitelinks");
    if (isQId(film) || year === 0) continue;
    entries.push({ film, year, sitelinks });
  }

  return dedup(
    entries.map((e) => {
      return {
        text_de: `In welchem Jahr erschien der Film „${e.film}"?`,
        text_de_open: `In welchem Jahr erschien der Film „${e.film}"?`,
        answer_de: String(e.year),
        wrong_answers_de: [],
        fun_fact_de: null,
        difficulty: difficultyFromSitelinks(e.sitelinks),
        tags: ["film", "erscheinungsjahr"],
        source: "wikidata" as const,
      };
    })
  );
}

// ─── Template: food-origin ───────────────────────────────────────────────────

async function generateFoodOrigin(): Promise<WikidataQuestion[]> {
  const query = `
    SELECT ?dish ?dishLabel ?country ?countryLabel ?sitelinks WHERE {
      ?dish wdt:P31/wdt:P279* wd:Q746549 .
      ?dish wdt:P495 ?country .
      ?dish wikibase:sitelinks ?sitelinks .
      FILTER(?sitelinks > 20)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY DESC(?sitelinks)
    LIMIT 150
  `;

  const bindings = await sparqlQuery(query);
  const allCountries: string[] = [];
  const entries: { dish: string; country: string; sitelinks: number }[] = [];

  for (const b of bindings) {
    const dish = val(b, "dishLabel");
    const country = val(b, "countryLabel");
    const sitelinks = numVal(b, "sitelinks");
    if (isQId(dish) || isQId(country)) continue;
    allCountries.push(country);
    entries.push({ dish, country, sitelinks });
  }

  const uniqueCountries = [...new Set(allCountries)];

  return dedup(
    entries.map((e) => ({
      text_de: `Aus welchem Land stammt das Gericht ${e.dish}?`,
      text_de_open: `Aus welchem Land stammt das Gericht ${e.dish}?`,
      answer_de: e.country,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: difficultyFromSitelinks(e.sitelinks),
      tags: ["essen", "herkunft"],
      source: "wikidata" as const,
    }))
  );
}

// ─── Template: dach-bundeslaender ────────────────────────────────────────────

async function generateDachBundeslaender(): Promise<WikidataQuestion[]> {
  const query = `
    SELECT ?state ?stateLabel ?capital ?capitalLabel ?sitelinks WHERE {
      ?state wdt:P31 wd:Q1221156 .
      ?state wdt:P36 ?capital .
      ?state wikibase:sitelinks ?sitelinks .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY ?stateLabel
  `;

  const bindings = await sparqlQuery(query);
  const allCapitals: string[] = [];
  const allStates: string[] = [];
  const entries: { state: string; capital: string; sitelinks: number }[] = [];

  for (const b of bindings) {
    const state = val(b, "stateLabel");
    const capital = val(b, "capitalLabel");
    const sitelinks = numVal(b, "sitelinks");
    if (isQId(state) || isQId(capital)) continue;
    allCapitals.push(capital);
    allStates.push(state);
    entries.push({ state, capital, sitelinks });
  }

  const uniqueCapitals = Array.from(new Set(allCapitals));
  const uniqueStates = [...new Set(allStates)];
  const questions: WikidataQuestion[] = [];

  for (const e of entries) {
    questions.push({
      text_de: `Was ist die Hauptstadt von ${e.state}?`,
      text_de_open: `Was ist die Hauptstadt von ${e.state}?`,
      answer_de: e.capital,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: 2,
      tags: ["geographie", "deutschland", "bundesland"],
      source: "wikidata" as const,
    });
    questions.push({
      text_de: `In welchem Bundesland liegt die Stadt ${e.capital}?`,
      text_de_open: `In welchem Bundesland liegt die Stadt ${e.capital}?`,
      answer_de: e.state,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: 2,
      tags: ["geographie", "deutschland", "bundesland"],
      source: "wikidata" as const,
    });
  }

  return dedup(questions);
}

// ─── Template: dach-austria-switzerland ──────────────────────────────────────

async function generateDachAustriaSwitzerland(): Promise<WikidataQuestion[]> {
  // Austrian states (Bundesländer)
  const queryAustria = `
    SELECT ?state ?stateLabel ?capital ?capitalLabel ?sitelinks WHERE {
      ?state wdt:P31 wd:Q261543 .
      ?state wdt:P36 ?capital .
      ?state wikibase:sitelinks ?sitelinks .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY ?stateLabel
  `;

  // Swiss cantons
  const querySwitzerland = `
    SELECT ?canton ?cantonLabel ?capital ?capitalLabel ?sitelinks WHERE {
      ?canton wdt:P31 wd:Q23058 .
      ?canton wdt:P36 ?capital .
      ?canton wikibase:sitelinks ?sitelinks .
      SERVICE wikibase:label { bd:serviceParam wikibase:language "de,en" . }
    }
    ORDER BY ?cantonLabel
  `;

  const [austriaBindings, swissBindings] = [
    await sparqlQuery(queryAustria),
    await sparqlQuery(querySwitzerland),
  ];

  const questions: WikidataQuestion[] = [];

  // Austria
  const austriaCapitals: string[] = [];
  const austriaStates: string[] = [];
  const austriaEntries: { state: string; capital: string }[] = [];

  for (const b of austriaBindings) {
    const state = val(b, "stateLabel");
    const capital = val(b, "capitalLabel");
    if (isQId(state) || isQId(capital)) continue;
    austriaCapitals.push(capital);
    austriaStates.push(state);
    austriaEntries.push({ state, capital });
  }

  for (const e of austriaEntries) {
    questions.push({
      text_de: `Was ist die Hauptstadt des österreichischen Bundeslandes ${e.state}?`,
      text_de_open: `Was ist die Hauptstadt des österreichischen Bundeslandes ${e.state}?`,
      answer_de: e.capital,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: 3,
      tags: ["geographie", "österreich", "bundesland"],
      source: "wikidata" as const,
    });
  }

  // Switzerland
  const swissCapitals: string[] = [];
  const swissCantons: string[] = [];
  const swissEntries: { canton: string; capital: string }[] = [];

  for (const b of swissBindings) {
    const canton = val(b, "cantonLabel");
    const capital = val(b, "capitalLabel");
    if (isQId(canton) || isQId(capital)) continue;
    swissCapitals.push(capital);
    swissCantons.push(canton);
    swissEntries.push({ canton, capital });
  }

  for (const e of swissEntries) {
    questions.push({
      text_de: `Was ist der Hauptort des Schweizer Kantons ${e.canton}?`,
      text_de_open: `Was ist der Hauptort des Schweizer Kantons ${e.canton}?`,
      answer_de: e.capital,
      wrong_answers_de: [],
      fun_fact_de: null,
      difficulty: 3,
      tags: ["geographie", "schweiz", "kanton"],
      source: "wikidata" as const,
    });
  }

  return dedup(questions);
}

// ─── Template Registry ───────────────────────────────────────────────────────

const TEMPLATES: TemplateDefinition[] = [
  { id: "geo-capitals", filename: "geo-capitals.json", generate: generateGeoCapitals },
  { id: "geo-continents", filename: "geo-continents.json", generate: generateGeoContinents },
  { id: "geo-rivers", filename: "geo-rivers.json", generate: generateGeoRivers },
  {
    id: "geo-highest-mountains",
    filename: "geo-highest-mountains.json",
    generate: generateGeoMountains,
  },
  {
    id: "geo-country-flags",
    filename: "geo-country-flags.json",
    generate: generateGeoCountryFlags,
  },
  { id: "science-elements", filename: "science-elements.json", generate: generateScienceElements },
  { id: "science-planets", filename: "science-planets.json", generate: generateSciencePlanets },
  {
    id: "literature-authors",
    filename: "literature-authors.json",
    generate: generateLiteratureAuthors,
  },
  { id: "art-paintings", filename: "art-paintings.json", generate: generateArtPaintings },
  {
    id: "history-birthyears",
    filename: "history-birthyears.json",
    generate: generateHistoryBirthyears,
  },
  {
    id: "history-inventions",
    filename: "history-inventions.json",
    generate: generateHistoryInventions,
  },
  {
    id: "sport-football-winners",
    filename: "sport-football-winners.json",
    generate: generateSportFootball,
  },
  { id: "sport-olympics", filename: "sport-olympics.json", generate: generateSportOlympics },
  {
    id: "music-bands-origin",
    filename: "music-bands-origin.json",
    generate: generateMusicBands,
  },
  { id: "film-directors", filename: "film-directors.json", generate: generateFilmDirectors },
  { id: "film-years", filename: "film-years.json", generate: generateFilmYears },
  { id: "food-origin", filename: "food-origin.json", generate: generateFoodOrigin },
  {
    id: "dach-bundeslaender",
    filename: "dach-bundeslaender.json",
    generate: generateDachBundeslaender,
  },
  {
    id: "dach-austria-switzerland",
    filename: "dach-austria-switzerland.json",
    generate: generateDachAustriaSwitzerland,
  },
];

// ─── CLI ─────────────────────────────────────────────────────────────────────

async function runTemplate(template: TemplateDefinition): Promise<number> {
  console.log(`Generating ${template.id}...`);
  try {
    const questions = await template.generate();
    writeOutput(template.filename, questions);
    console.log(`  ✓ ${template.id}: ${questions.length} questions created`);
    return questions.length;
  } catch (err) {
    console.error(`  ✗ ${template.id}: ${err instanceof Error ? err.message : err}`);
    return 0;
  }
}

async function showStats(): Promise<void> {
  console.log("\nWikidata question statistics:\n");
  let total = 0;
  for (const t of TEMPLATES) {
    const filePath = path.join(OUTPUT_DIR, t.filename);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      const count = Array.isArray(data) ? data.length : 0;
      console.log(`  ${t.id.padEnd(30)} ${String(count).padStart(5)} questions`);
      total += count;
    } else {
      console.log(`  ${t.id.padEnd(30)}     - (not generated)`);
    }
  }
  console.log(`\n  ${"TOTAL".padEnd(30)} ${String(total).padStart(5)} questions\n`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--stats")) {
    await showStats();
    return;
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let templatesToRun: TemplateDefinition[] = [];

  if (args.includes("--all")) {
    templatesToRun = TEMPLATES;
  } else if (args.includes("--template")) {
    const filterIdx = args.indexOf("--template");
    const filter = args[filterIdx + 1];
    if (!filter) {
      console.error("Error: --template requires a value (e.g., geo, geo-capitals, science)");
      process.exit(1);
    }
    templatesToRun = TEMPLATES.filter(
      (t) => t.id === filter || t.id.startsWith(filter + "-") || t.id.startsWith(filter)
    );
    if (templatesToRun.length === 0) {
      console.error(`Error: No templates matching "${filter}"`);
      console.error("Available templates:", TEMPLATES.map((t) => t.id).join(", "));
      process.exit(1);
    }
  } else {
    console.log("Usage:");
    console.log("  npx tsx scripts/generate-from-wikidata.ts --all");
    console.log("  npx tsx scripts/generate-from-wikidata.ts --template geo");
    console.log("  npx tsx scripts/generate-from-wikidata.ts --template geo-capitals");
    console.log("  npx tsx scripts/generate-from-wikidata.ts --stats");
    console.log("\nAvailable templates:");
    for (const t of TEMPLATES) {
      console.log(`  ${t.id}`);
    }
    return;
  }

  console.log(`\nRunning ${templatesToRun.length} template(s)...\n`);

  let totalQuestions = 0;
  for (const t of templatesToRun) {
    totalQuestions += await runTemplate(t);
  }

  console.log(`\nDone! Generated ${totalQuestions} questions total.`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
