import { writeFileSync } from 'node:fs';
import { buildQuestionSheet } from '../src/lib/pdf-builder';

// Mock questions with the tricky bits: umlauts/ß, a long question that must
// wrap, and mixed presence of fun facts.
const items = [
  {
    text_de: 'Welcher Fluss ist der längste Deutschlands und fließt durch Städte wie Köln und Düsseldorf?',
    answer_de: 'Der Rhein (bzw. die Donau, je nach Messung) — hier: der Rhein',
    fun_fact_de: 'Der Rhein ist rund 1.230 km lang und eine der meistbefahrenen Wasserstraßen der Welt.',
  },
  {
    text_de: 'Wie heißt das kleinste Bundesland Deutschlands nach Fläche?',
    answer_de: 'Bremen',
    fun_fact_de: null,
  },
  {
    text_de: 'Welche Sängerin veröffentlichte 1983 den Hit „99 Luftballons"?',
    answer_de: 'Nena',
    fun_fact_de: 'Der Song schaffte es sogar in die US-Charts — auf Deutsch gesungen.',
  },
  {
    text_de: 'Aus welchem Getreide wird traditionelles bayerisches Weißbier hauptsächlich gebraut?',
    answer_de: 'Weizen',
    fun_fact_de: 'Weißbier muss in Bayern mindestens 50 % Weizenmalz enthalten.',
  },
];

const pdf = buildQuestionSheet({
  title: 'Musik-Quizfragen mit Antworten & Lösungen',
  subtitle: `${items.length} Fragen zum Ausdrucken · kostenlos von pubquizplanner.com`,
  items,
  locale: 'de',
});

const out = process.argv[2] || '/tmp/verify-pdf.pdf';
writeFileSync(out, pdf);
console.log(`wrote ${out} — ${pdf.length} bytes, ${items.length} items`);
