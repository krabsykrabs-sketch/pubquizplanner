import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

interface GenerateParams {
  categoryName: string;
  count: number;
  difficulty: number | 'mixed';
  specialInstructions?: string;
}

interface GeneratedQuestion {
  text_de: string;
  answer_de: string;
  fun_fact_de: string;
  difficulty: number;
  tags: string[];
  wrong_answers_de: string[];
}

export async function generateQuestions(params: GenerateParams): Promise<GeneratedQuestion[]> {
  const difficultyInstruction = params.difficulty === 'mixed'
    ? 'Verwende eine Mischung aus den Schwierigkeitsstufen 1-4.'
    : `Alle Fragen sollen Schwierigkeitsstufe ${params.difficulty} haben (1=sehr leicht, 2=mittel, 3=schwer, 4=sehr schwer).`;

  const prompt = `Du bist ein erfahrener Pub-Quiz-Autor. Erstelle ${params.count} deutsche Pub-Quiz-Fragen für die Kategorie "${params.categoryName}".

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

Antworte ausschließlich mit dem JSON-Array, ohne Markdown-Formatierung oder andere Texte.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
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

Antworte ausschließlich mit dem JSON-Array, ohne Markdown-Formatierung oder andere Texte.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
    tools: [{ type: 'web_search_20250305' as const, name: 'web_search', max_uses: 10 }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  return parseJsonResponse(text);
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
