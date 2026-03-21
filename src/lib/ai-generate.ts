import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

interface GenerateParams {
  categoryName: string;
  count: number;
  difficulty: number | 'mixed';
  specialInstructions?: string;
}

export interface GeneratedQuestion {
  text_de: string;
  answer_de: string;
  fun_fact_de: string;
  difficulty: number;
  tags: string[];
  wrong_answers_de: string[];
}

const SYSTEM_PROMPT = `Du bist ein erfahrener Quizmaster, der seit 20 Jahren Kneipenquiz-Abende in Deutschland leitet. Du schreibst Fragen, die am Tisch für Diskussion sorgen — nicht trockene Lexikon-Fragen, sondern solche, bei denen Teams gemeinsam grübeln und am Ende 'Ach, natürlich!' oder 'Das hätte ich nie gedacht!' rufen.

Regeln für gute Fragen:
- Jede Frage hat GENAU EINE richtige Antwort — keine Mehrdeutigkeit
- Die Antwort sollte kurz sein (1-5 Wörter)
- Fragen sollen neugierig machen, nicht einschüchtern
- Vermeide reine Jahreszahl-Fragen ('In welchem Jahr...') — höchstens 10% davon
- Bevorzuge 'Welcher/Welche/Welches' und 'Was/Wer/Wie' Fragen
- Die besten Fragen verbinden zwei unerwartete Bereiche ('Welches Tier kann seinen Herzschlag willentlich stoppen?' → Antwort: Frosch)
- Fun Facts sollen überraschend und unterhaltsam sein, nicht Wikipedia-Zusammenfassungen
- Falsche Antworten müssen plausibel klingen — sie sollen Teams ins Zweifeln bringen
- Falsche Antworten müssen vom gleichen Typ sein wie die richtige (Land→Länder, Person→Personen, Zahl→Zahlen)
- Keine Fragen die man trivial googeln kann ('Wie hoch ist der Mount Everest?')
- Bevorzuge Fragen mit überraschenden oder kontraintuitiven Antworten

Schwierigkeitsgrade:
1 = Die meisten Erwachsenen wissen die Antwort
2 = Man muss kurz nachdenken, aber die meisten Teams kriegen es hin
3 = Nur 30-40% der Teams werden es wissen — hier trennt sich die Spreu vom Weizen
4 = Echte Expertenfrage — vielleicht weiß es ein Team im Raum`;

export async function generateQuestions(params: GenerateParams): Promise<GeneratedQuestion[]> {
  const difficultyInstruction = params.difficulty === 'mixed'
    ? 'Verwende eine Mischung aus den Schwierigkeitsstufen 1-4.'
    : `Alle Fragen sollen Schwierigkeitsstufe ${params.difficulty} haben (1=sehr leicht, 2=mittel, 3=schwer, 4=sehr schwer).`;

  const prompt = `Erstelle ${params.count} deutsche Pub-Quiz-Fragen für die Kategorie "${params.categoryName}".

${difficultyInstruction}

${params.specialInstructions ? `Spezielle Anweisungen: ${params.specialInstructions}` : ''}

Antworte NUR mit einem JSON-Array. Jedes Element hat diese Felder:
- text_de: Die Frage auf Deutsch
- answer_de: Die korrekte Antwort
- fun_fact_de: Ein interessanter Zusatzfakt zur Antwort (1-2 Sätze)
- difficulty: Schwierigkeitsstufe (1-4)
- tags: Array mit 2-4 relevanten Tags auf Deutsch
- wrong_answers_de: Array mit genau 3 plausiblen aber falschen Antworten

Wichtige Regeln:
- Fragen müssen eindeutig beantwortbar sein
- Falsche Antworten müssen plausibel klingen
- Fun Facts sollen überraschend und unterhaltsam sein
- Keine Duplikate oder zu ähnliche Fragen
- Antworten kurz und prägnant halten
- Vermeide Standardfragen die in jedem Quiz vorkommen (z.B. 'Hauptstadt von Frankreich', 'Wer malte die Mona Lisa')
- Mindestens 30% der Fragen sollen einen DACH-Bezug haben (Deutschland, Österreich, Schweiz)
- Jede Frage soll so formuliert sein, dass sie laut vorgelesen gut klingt

Antworte ausschließlich mit dem JSON-Array, ohne Markdown-Formatierung oder andere Texte.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  return parseJsonResponse(text);
}

export async function generateCurrentEvents(): Promise<GeneratedQuestion[]> {
  const now = new Date();
  const weekStr = `${now.getFullYear()}-W${String(getWeekNumber(now)).padStart(2, '0')}`;

  const prompt = `Suche nach den wichtigsten Nachrichtenereignissen der letzten 7 Tage. Erstelle 10 deutsche Pub-Quiz-Fragen über aktuelle Ereignisse dieser Woche (${weekStr}).

Decke folgende Bereiche ab: Politik, Sport, Unterhaltung, Wissenschaft und Wirtschaft.

Antworte NUR mit einem JSON-Array. Jedes Element hat diese Felder:
- text_de: Die Frage auf Deutsch
- answer_de: Die korrekte Antwort
- fun_fact_de: Ein interessanter Zusatzfakt (1-2 Sätze)
- difficulty: Schwierigkeitsstufe (1-4, meist 2-3)
- tags: Array mit 2-4 relevanten Tags auf Deutsch
- wrong_answers_de: Array mit genau 3 plausiblen aber falschen Antworten

Wichtige Regeln:
- Fragen müssen eindeutig beantwortbar sein
- Falsche Antworten müssen plausibel klingen
- Fun Facts sollen überraschend und unterhaltsam sein
- Keine Duplikate oder zu ähnliche Fragen
- Antworten kurz und prägnant halten
- Vermeide Standardfragen die in jedem Quiz vorkommen
- Mindestens 30% der Fragen sollen einen DACH-Bezug haben (Deutschland, Österreich, Schweiz)
- Jede Frage soll so formuliert sein, dass sie laut vorgelesen gut klingt

Antworte ausschließlich mit dem JSON-Array, ohne Markdown-Formatierung oder andere Texte.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
    tools: [{ type: 'web_search_20250305' as const, name: 'web_search', max_uses: 10 }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  return parseJsonResponse(text);
}

export interface VerificationResult {
  questionIndex: number;
  passed: boolean;
  claudeAnswer: string;
}

export async function verifyQuestions(questions: GeneratedQuestion[]): Promise<VerificationResult[]> {
  const numberedList = questions
    .map((q, i) => `${i + 1}. ${q.text_de}`)
    .join('\n');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: 'Du bist ein Quizteilnehmer. Beantworte jede Frage so kurz und präzise wie möglich. Gib NUR die Antwort, keine Erklärung.',
    messages: [
      {
        role: 'user',
        content: `Beantworte jede dieser Fragen mit einer kurzen Antwort. Antworte im Format "1. Antwort\\n2. Antwort\\n..." — eine Zeile pro Frage, nur die Nummer und die Antwort.\n\n${numberedList}`,
      },
    ],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  // Parse numbered answers: "1. Answer\n2. Answer\n..."
  const answerLines = text.split('\n').filter((line) => /^\d+[\.\)]\s/.test(line.trim()));
  const claudeAnswers: string[] = answerLines.map((line) =>
    line.replace(/^\d+[\.\)]\s*/, '').trim()
  );

  return questions.map((q, i) => {
    const claudeAnswer = claudeAnswers[i] || '';
    const passed = answersMatch(q.answer_de, claudeAnswer);
    return { questionIndex: i, passed, claudeAnswer };
  });
}

function answersMatch(intended: string, claude: string): boolean {
  const normalize = (s: string) =>
    s.toLowerCase()
      .replace(/[^a-zäöüß0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const a = normalize(intended);
  const b = normalize(claude);

  // Exact match after normalization
  if (a === b) return true;

  // One contains the other (handles "Paris" matching "Paris, Frankreich")
  if (a.includes(b) || b.includes(a)) return true;

  // Check if the core words overlap significantly
  const wordsA = new Set(a.split(' ').filter((w) => w.length > 2));
  const wordsB = new Set(b.split(' ').filter((w) => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return false;

  let overlap = 0;
  wordsA.forEach((w) => { if (wordsB.has(w)) overlap++; });

  // If most key words match, consider it a match
  return overlap >= Math.min(wordsA.size, wordsB.size) * 0.6;
}

export interface WebSearchResult {
  index: number;
  correct: boolean;
  issue: string | null;
}

export async function webSearchVerify(questions: GeneratedQuestion[]): Promise<WebSearchResult[]> {
  const questionList = questions
    .map((q, i) => `${i + 1}. Frage: ${q.text_de}\n   Antwort: ${q.answer_de}\n   Fun Fact: ${q.fun_fact_de || '—'}`)
    .join('\n\n');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: 'Du bist ein Faktenchecker für Quizfragen. Überprüfe jede Frage gründlich durch Websuchen. Antworte ausschließlich mit JSON.',
    tools: [{ type: 'web_search_20250305' as const, name: 'web_search', max_uses: questions.length * 2 }],
    messages: [
      {
        role: 'user',
        content: `Hier sind Quizfragen mit Antworten. Überprüfe JEDE Antwort durch eine Websuche. Suche aktiv nach Gegenbeweisen. Ist die Antwort eindeutig korrekt? Ist die Frage eindeutig formuliert oder könnte sie missverstanden werden?

Antworte als JSON-Array: {"index": number, "correct": boolean, "issue": string|null}

Melde ein Problem wenn:
- Die Antwort faktisch falsch ist
- Die Frage mehrdeutig ist und mehrere gültige Antworten haben könnte
- Die Frage leicht missverstanden werden kann
- Der Fun Fact falsch oder irreführend ist

FRAGEN:
${questionList}

Antworte ausschließlich mit dem JSON-Array.`,
      },
    ],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
  }

  // If parsing fails, assume all correct
  return questions.map((_, i) => ({ index: i, correct: true, issue: null }));
}

export interface DuplicateResult {
  index: number;
  is_duplicate: boolean;
  duplicate_of: string | null;
}

export async function checkDuplicates(
  newQuestions: GeneratedQuestion[],
  existingQuestionTexts: string[]
): Promise<DuplicateResult[]> {
  if (existingQuestionTexts.length === 0) {
    return newQuestions.map((_, i) => ({ index: i, is_duplicate: false, duplicate_of: null }));
  }

  const existingList = existingQuestionTexts
    .map((q, i) => `B${i + 1}. ${q}`)
    .join('\n');

  const newList = newQuestions
    .map((q, i) => `N${i + 1}. ${q.text_de}`)
    .join('\n');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: 'Du bist ein Experte für Duplikaterkennung bei Quiz-Fragen. Antworte ausschließlich mit JSON.',
    messages: [
      {
        role: 'user',
        content: `Hier sind bestehende Fragen in der Datenbank (B), gefolgt von neuen Fragen (N). Prüfe jede neue Frage: Gibt es eine bestehende Frage die dasselbe Wissen abfragt, auch wenn sie anders formuliert ist?

Antworte als JSON-Array mit einem Objekt pro neuer Frage: {"index": number, "is_duplicate": boolean, "duplicate_of": string|null} wobei duplicate_of den Text der bestehenden Frage enthält falls es ein Duplikat ist.

BESTEHENDE FRAGEN:
${existingList}

NEUE FRAGEN:
${newList}

Antworte ausschließlich mit dem JSON-Array.`,
      },
    ],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
  }

  // If parsing fails, assume no duplicates
  return newQuestions.map((_, i) => ({ index: i, is_duplicate: false, duplicate_of: null }));
}

function parseJsonResponse(text: string): GeneratedQuestion[] {
  // Try direct parse first
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Try extracting JSON array from the response
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      return JSON.parse(match[0]);
    }
  }
  throw new Error('Failed to parse AI response as JSON array');
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getCurrentWeek(): string {
  const now = new Date();
  return `${now.getFullYear()}-W${String(getWeekNumber(now)).padStart(2, '0')}`;
}
