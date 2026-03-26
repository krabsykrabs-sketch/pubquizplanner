import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { query, queryOne } from '@/lib/db';
import type { Category, Question } from '@/types/quiz';
import { QuestionList } from './question-list';

export const dynamic = 'force-dynamic';

const MIN_QUESTIONS = 30;

const CATEGORY_INTROS: Record<string, string> = {
  wissenschaft:
    'Von Physik über Biologie bis Chemie — diese Wissenschafts-Quizfragen bringen garantiert Diskussionen an den Kneipentisch. Perfekt für jedes Pub Quiz, bei dem auch die Nerds im Team glänzen dürfen.',
  geschichte:
    'Antike, Mittelalter oder Zeitgeschichte — mit diesen Geschichte-Quizfragen wird dein Kneipenquiz zum historischen Abenteuer. Überraschende Fakten inklusive.',
  geographie:
    'Hauptstädte, Flüsse, Berge und Kurioses aus aller Welt — diese Geographie-Quizfragen sind ideal für dein nächstes Pub Quiz. Von leicht bis knifflig ist alles dabei.',
  literatur:
    'Klassiker, Bestseller und literarische Kuriositäten — diese Literatur-Quizfragen testen das Wissen der Bücherwürmer in deinem Kneipenquiz.',
  allgemeinwissen:
    'Die Königsdisziplin im Pub Quiz: Allgemeinwissen-Fragen quer durch alle Themen. Von leicht bis schwer — hier kann jedes Team punkten.',
  'film-tv':
    'Blockbuster, Serien-Hits und Filmklassiker — diese Film & TV Quizfragen sind ein Muss für jeden Kneipenquiz-Abend. Popcorn nicht vergessen!',
  musik:
    'Von Klassik über Rock bis Pop — diese Musik-Quizfragen bringen Stimmung in jedes Pub Quiz. Teste, wer in deiner Runde den besten Musikgeschmack hat.',
  sport:
    'Fußball, Olympia und Rekorde — diese Sport-Quizfragen sorgen für Wettkampfstimmung beim Kneipenquiz. Für Fans und Gelegenheitszuschauer gleichermaßen.',
  'essen-trinken':
    'Kulinarische Kuriositäten und Genusswissen — diese Essen & Trinken Quizfragen würzen dein Pub Quiz mit überraschenden Fakten.',
  'kunst-kultur':
    'Gemälde, Architektur und kulturelle Meilensteine — diese Kunst & Kultur Quizfragen bereichern jedes Kneipenquiz mit einer Prise Hochkultur.',
  technik:
    'Erfindungen, Gadgets und digitale Meilensteine — diese Technik-Quizfragen sind perfekt für das nächste Pub Quiz mit Tech-Begeisterten.',
  popkultur:
    'Memes, Trends und Pop-Phänomene — diese Popkultur-Quizfragen bringen Zeitgeist in dein Kneipenquiz.',
  sprache:
    'Etymologie, Redewendungen und sprachliche Kuriositäten — diese Sprach-Quizfragen fordern die Wortakrobaten in deinem Pub Quiz heraus.',
  'logik-mathe':
    'Zahlen, Rätsel und logisches Denken — diese Logik & Mathe Quizfragen sind die ultimative Herausforderung für jedes Kneipenquiz.',
};

interface CategoryWithCount extends Category {
  count: number;
}

async function getCategoryWithCount(slug: string): Promise<CategoryWithCount | null> {
  return queryOne<CategoryWithCount>(
    `SELECT c.*, COUNT(q.id)::int as count
     FROM categories c
     JOIN questions q ON q.category_id = c.id
     WHERE c.slug = $1 AND q.status = 'approved'
     GROUP BY c.id
     HAVING COUNT(q.id) >= $2`,
    [slug, MIN_QUESTIONS]
  );
}

async function getQuestions(categoryId: number): Promise<Question[]> {
  return query<Question>(
    `SELECT * FROM questions
     WHERE category_id = $1 AND status = 'approved'
     ORDER BY difficulty ASC, id ASC`,
    [categoryId]
  );
}

async function getAllActiveCategories(): Promise<CategoryWithCount[]> {
  return query<CategoryWithCount>(
    `SELECT c.*, COUNT(q.id)::int as count
     FROM categories c
     JOIN questions q ON q.category_id = c.id
     WHERE q.status = 'approved'
     GROUP BY c.id
     HAVING COUNT(q.id) >= $1
     ORDER BY COUNT(q.id) DESC`,
    [MIN_QUESTIONS]
  );
}

export async function generateMetadata({
  params: { slug },
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await getCategoryWithCount(slug);
  if (!category) return {};

  const title = `${category.count} ${category.name_de}-Quizfragen mit Antworten | PubQuizPlanner`;
  const description = `Teste dein Wissen mit ${category.count} ${category.name_de} Fragen für dein nächstes Kneipenquiz. Mit Antworten, Fun Facts und Schwierigkeitsangabe.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://pubquizplanner.com/de/fragen/${slug}`,
    },
  };
}

export default async function CategoryQuestionsPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const category = await getCategoryWithCount(slug);
  if (!category) notFound();

  const [questions, allCategories] = await Promise.all([
    getQuestions(category.id),
    getAllActiveCategories(),
  ]);

  const intro = CATEGORY_INTROS[slug] || `Entdecke ${category.count} ${category.name_de}-Quizfragen für dein nächstes Kneipenquiz. Mit Antworten und Fun Facts.`;

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl md:text-5xl font-bold text-[var(--gold)] mb-6">
        {category.icon} {category.name_de} Quizfragen
      </h1>

      <p className="text-lg text-[var(--muted)] mb-6 leading-relaxed">
        {intro}
      </p>

      {/* Category navigation */}
      <nav className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide -mx-6 px-6" aria-label="Kategorien">
        {allCategories.map((cat) => {
          const isCurrent = cat.slug === slug;
          return (
            <Link
              key={cat.slug}
              href={`/${locale}/fragen/${cat.slug}`}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium border transition-colors shrink-0 ${
                isCurrent
                  ? 'bg-[var(--gold)] text-[var(--background)] border-[var(--gold)]'
                  : 'bg-[var(--dark-card)] border-[var(--dark-border)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--foreground)]'
              }`}
              aria-current={isCurrent ? 'page' : undefined}
            >
              {cat.icon} {cat.name_de}
            </Link>
          );
        })}
      </nav>

      <div className="inline-block bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-4 py-2 text-sm text-[var(--muted)] mb-8">
        {category.count} Fragen verfügbar
      </div>

      <QuestionList questions={questions} locale={locale} />

      {/* Bottom CTA */}
      <section className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-8 text-center mt-12 mb-12">
        <h2 className="text-2xl font-bold text-[var(--gold)] mb-3">
          Erstelle jetzt dein eigenes Kneipenquiz
        </h2>
        <p className="text-[var(--muted)] mb-6 max-w-xl mx-auto">
          Erstelle jetzt dein eigenes Kneipenquiz mit diesen Fragen &mdash;
          kostenlos als HTML-Präsentation zum Download.
        </p>
        <Link
          href={`/${locale}/generator`}
          className="inline-flex items-center gap-2 bg-[var(--gold)] text-[var(--background)] px-8 py-4 rounded-xl text-lg font-bold hover:bg-[var(--gold-light)] transition-colors"
        >
          Quiz erstellen &rarr;
        </Link>
      </section>

      {/* Related categories */}
      {allCategories.filter((c) => c.slug !== slug).length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
            Weitere Quizfragen:
          </h2>
          <div className="flex flex-wrap gap-3">
            {allCategories.filter((c) => c.slug !== slug).map((cat) => (
              <Link
                key={cat.slug}
                href={`/${locale}/fragen/${cat.slug}`}
                className="inline-flex items-center gap-2 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-lg px-4 py-2 text-sm hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              >
                {cat.icon} {cat.name_de}
                <span className="text-[var(--muted)]">({cat.count})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Link
        href={`/${locale}/fragen`}
        className="inline-block text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
      >
        &larr; Alle Kategorien
      </Link>
    </main>
  );
}
