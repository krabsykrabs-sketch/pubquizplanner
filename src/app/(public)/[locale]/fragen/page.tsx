import { Metadata } from 'next';
import Link from 'next/link';
import { query } from '@/lib/db';

const MIN_QUESTIONS = 30;

interface CategoryWithCount {
  id: number;
  slug: string;
  name_de: string;
  icon: string;
  count: number;
}

async function getActiveCategories(): Promise<CategoryWithCount[]> {
  return query<CategoryWithCount>(
    `SELECT c.id, c.slug, c.name_de, c.icon, COUNT(q.id)::int as count
     FROM categories c
     JOIN questions q ON q.category_id = c.id
     WHERE q.status = 'approved'
     GROUP BY c.id
     HAVING COUNT(q.id) >= $1
     ORDER BY COUNT(q.id) DESC`,
    [MIN_QUESTIONS]
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const categories = await getActiveCategories();
  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

  return {
    title: `${totalCount}+ Kneipenquiz Fragen und Antworten | PubQuizPlanner`,
    description: `${totalCount}+ kostenlose Pub Quiz Fragen mit Antworten in ${categories.length} Kategorien. Perfekt zum Kneipenquiz selber machen.`,
    openGraph: {
      title: `${totalCount}+ Kneipenquiz Fragen und Antworten | PubQuizPlanner`,
      description: `${totalCount}+ kostenlose Pub Quiz Fragen mit Antworten in ${categories.length} Kategorien. Perfekt zum Kneipenquiz selber machen.`,
      url: 'https://pubquizplanner.com/de/fragen',
    },
  };
}

export default async function FragenIndexPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const categories = await getActiveCategories();
  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl md:text-5xl font-bold text-[var(--gold)] mb-6">
        Kneipenquiz Fragen und Antworten
      </h1>

      <p className="text-lg text-[var(--muted)] mb-4 leading-relaxed max-w-3xl">
        Du suchst Quizfragen kostenlos? Hier findest du {totalCount}+ handverlesene
        Pub Quiz Fragen mit Antworten, Fun Facts und Schwierigkeitsangabe. Perfekt
        zum Kneipenquiz selber machen oder als Inspiration für deinen Quizabend.
      </p>

      <p className="text-sm text-[var(--muted)] mb-6">
        {totalCount} Fragen in {categories.length} Kategorien
      </p>

      {/* Category navigation */}
      <nav className="flex gap-2 overflow-x-auto pb-2 mb-10 scrollbar-hide -mx-6 px-6" aria-label="Kategorien">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${locale}/fragen/${cat.slug}`}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium border bg-[var(--dark-card)] border-[var(--dark-border)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--foreground)] transition-colors shrink-0"
          >
            {cat.icon} {cat.name_de}
          </Link>
        ))}
      </nav>

      <div className="grid sm:grid-cols-2 gap-4 mb-16">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${locale}/fragen/${cat.slug}`}
            className="flex items-center gap-4 bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-5 hover:border-[var(--gold)] transition-colors group"
          >
            <span className="text-3xl">{cat.icon}</span>
            <div className="flex-1">
              <h2 className="text-lg font-bold group-hover:text-[var(--gold)] transition-colors">
                {cat.name_de}
              </h2>
              <p className="text-sm text-[var(--muted)]">{cat.count} Fragen</p>
            </div>
            <span className="text-[var(--muted)] group-hover:text-[var(--gold)] transition-colors">
              &rarr;
            </span>
          </Link>
        ))}
      </div>

      <section className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-[var(--gold)] mb-3">
          Erstelle dein eigenes Kneipenquiz
        </h2>
        <p className="text-[var(--muted)] mb-6 max-w-xl mx-auto">
          Wähle Kategorien, Schwierigkeit und Rundenanzahl &mdash; und lade dir dein
          komplettes Quiz als HTML-Präsentation herunter. Kostenlos.
        </p>
        <Link
          href={`/${locale}/generator`}
          className="inline-flex items-center gap-2 bg-[var(--gold)] text-[var(--background)] px-8 py-4 rounded-xl text-lg font-bold hover:bg-[var(--gold-light)] transition-colors"
        >
          Quiz erstellen &rarr;
        </Link>
      </section>
    </main>
  );
}
