import type { Metadata } from 'next';
import Link from 'next/link';
import Card from '@/components/ds/Card';
import { query } from '@/lib/db';
import { SOURCE_LOCALE } from '@/config/locales';
import { questionsIndexPath } from '@/config/slugs';
import { BASE_URL, JsonLd, breadcrumbSchema } from '@/lib/structured-data';

// "So entstehen unsere Quizfragen": who runs the site and how every question
// is made and checked — the trust signal (E-E-A-T) Google looks for, and the
// visible form of the human-approval promise. German-only content on every
// locale URL → canonical points at the source-locale page (see credits).
// Every number is read live from the database; the rules mirror
// scripts/quality-review/AUTHORING.md — keep the two in sync.
export const dynamic = 'force-dynamic';

const PATH = `/${SOURCE_LOCALE}/ueber-uns`;
const TITLE = 'So entstehen unsere Quizfragen';

export const metadata: Metadata = {
  title: `${TITLE} | PubQuizPlanner`,
  description:
    'Wer hinter PubQuizPlanner steht, woher die Quizfragen kommen und wie jede Frage vor der Veröffentlichung von Hand geprüft wird.',
  alternates: { canonical: PATH },
};

interface Stats {
  approved: number;
  rejected: number;
  reviewed: number;
  easy: number;
  medium: number;
  hard: number;
}

async function getStats(): Promise<Stats | null> {
  try {
    const rows = await query<{
      approved: string;
      rejected: string;
      reviewed: string;
      easy: string;
      medium: string;
      hard: string;
    }>(
      `SELECT count(*) FILTER (WHERE status = 'approved') AS approved,
              count(*) FILTER (WHERE status = 'rejected') AS rejected,
              count(*) FILTER (WHERE status IN ('approved', 'rejected', 'mc_candidate')) AS reviewed,
              count(*) FILTER (WHERE status = 'approved' AND difficulty = 1) AS easy,
              count(*) FILTER (WHERE status = 'approved' AND difficulty = 2) AS medium,
              count(*) FILTER (WHERE status = 'approved' AND difficulty = 3) AS hard
       FROM questions`
    );
    const r = rows[0];
    if (!r) return null;
    const n = (v: string) => parseInt(v) || 0;
    return {
      approved: n(r.approved),
      rejected: n(r.rejected),
      reviewed: n(r.reviewed),
      easy: n(r.easy),
      medium: n(r.medium),
      hard: n(r.hard),
    };
  } catch {
    return null; // page still renders, just without the numbers
  }
}

const fmt = (n: number) => n.toLocaleString('de-DE');
const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

const linkCls =
  'text-[var(--link)] underline transition-colors hover:text-[var(--link-hover)]';
const h2Cls = 'font-display text-xl font-bold text-[var(--text-strong)]';
const bodyCls = 'text-sm leading-relaxed text-[var(--text-muted)]';

export default async function UeberUnsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const stats = await getStats();
  const rejectRate = stats ? pct(stats.rejected, stats.reviewed) : 0;

  const aboutPage = {
    '@type': 'AboutPage',
    name: TITLE,
    url: `${BASE_URL}${PATH}`,
    inLanguage: SOURCE_LOCALE,
    isPartOf: { '@id': `${BASE_URL}/#website` },
  };
  const breadcrumb = breadcrumbSchema([
    { name: 'Startseite', url: `${BASE_URL}/${SOURCE_LOCALE}` },
    { name: TITLE, url: `${BASE_URL}${PATH}` },
  ]);

  return (
    <main className="mx-auto max-w-container-narrow px-6 py-16">
      <JsonLd data={[aboutPage, breadcrumb]} />
      <h1 className="mb-4 font-display text-3xl font-extrabold tracking-[-0.02em] text-[var(--text-strong)] md:text-4xl">
        {TITLE}
      </h1>
      <p className="mb-8 text-lg leading-relaxed text-[var(--text-body)]">
        PubQuizPlanner ist ein unabhängiges Projekt von Jan Ahrens. Das Ziel: Quizfragen, die am
        Tisch für Diskussion sorgen – und bei denen die Antwort garantiert stimmt. Deshalb geht
        keine Frage online, die nicht vorher ein Mensch gelesen, geprüft und freigegeben hat.
      </p>

      {stats && stats.reviewed > 0 && (
        <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(
            [
              [fmt(stats.reviewed), 'Fragen geprüft'],
              [fmt(stats.approved), 'freigegeben'],
              [`${rejectRate} %`, 'abgelehnt'],
            ] as const
          ).map(([value, label]) => (
            <Card key={label} padding="md" className="text-center">
              <p className="m-0 font-mono text-2xl font-semibold text-[var(--text-strong)]">{value}</p>
              <p className="m-0 text-sm text-[var(--text-muted)]">{label}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="space-y-8">
        <Card padding="lg" className="space-y-3">
          <h2 className={h2Cls}>Woher die Fragen kommen</h2>
          <ul className={`${bodyCls} list-disc space-y-2 pl-5`}>
            <li>
              <strong className="text-[var(--text-strong)]">Offene Fragensammlungen</strong> wie die
              Open Trivia Database, OpenTriviaQA und Wikidata – übersetzt, umgeschrieben und an den
              deutschsprachigen Raum angepasst. Quellen und Lizenzen stehen unter{' '}
              <Link href={`/${locale}/credits`} className={linkCls}>
                Credits
              </Link>
              .
            </li>
            <li>
              <strong className="text-[var(--text-strong)]">Neue Fragen</strong>, gezielt für
              einzelne Kategorien und Anlässe geschrieben – zum Beispiel unsere Weihnachtsfragen.
            </li>
            <li>
              <strong className="text-[var(--text-strong)]">KI-Unterstützung:</strong> Viele neue
              Fragen und ein Teil der Übersetzungen entstehen als Entwurf mit Unterstützung von KI.
              Die KI liefert Vorschläge – ob eine Frage veröffentlicht wird, entscheidet ein Mensch.
            </li>
          </ul>
        </Card>

        <Card padding="lg" className="space-y-3">
          <h2 className={h2Cls}>Unsere Regeln für eine gute Frage</h2>
          <ul className={`${bodyCls} list-disc space-y-2 pl-5`}>
            <li>
              <strong className="text-[var(--text-strong)]">Genau eine richtige Antwort.</strong>{' '}
              Wenn zwei Antworten vertretbar sind, wird die Frage umformuliert oder gestrichen.
            </li>
            <li>
              <strong className="text-[var(--text-strong)]">Fair lösbar.</strong> Keine reinen
              Nachschlage-Details, die nur mit gezielter Recherche zu finden sind – aber auch nichts
              Schulbuch-Triviales.
            </li>
            <li>
              <strong className="text-[var(--text-strong)]">Die Pointe steckt in der Antwort.</strong>{' '}
              Gute Fragen lassen Teams grübeln und enden mit „Ach, natürlich!“ statt mit einem
              unbekannten Namen.
            </li>
            <li>
              <strong className="text-[var(--text-strong)]">Kurz und vorlesbar.</strong> Antworten
              aus wenigen Wörtern, Fragen in natürlichem Deutsch, die sich gut vorlesen lassen.
            </li>
            <li>
              <strong className="text-[var(--text-strong)]">Mit Bezug zu uns.</strong> Viele Fragen
              haben einen Bezug zu Deutschland, Österreich oder der Schweiz – kein
              US-Insiderwissen.
            </li>
          </ul>
        </Card>

        <Card padding="lg" className="space-y-3">
          <h2 className={h2Cls}>Jede Frage wird von Hand freigegeben</h2>
          <p className={bodyCls}>
            Neue Fragen landen zuerst in einer Prüfliste. Dort wird jede einzeln gelesen: Stimmt die
            Antwort? Ist sie eindeutig? Ist die Frage fair und unterhaltsam? Fakten, bei denen
            Zweifel bleiben, werden nachgeprüft – im Zweifel fliegt die Frage raus.
            {stats && stats.reviewed > 0 && (
              <>
                {' '}
                Bisher wurden so {fmt(stats.reviewed)} Fragen geprüft und {fmt(stats.rejected)}{' '}
                davon abgelehnt – rund jede {rejectRate > 0 ? Math.round(100 / rejectRate) : '–'}.
                Frage schafft es also nicht in die Sammlung.
              </>
            )}
          </p>
          {stats && stats.approved > 0 && (
            <p className={bodyCls}>
              Jede freigegebene Frage hat einen Schwierigkeitsgrad:{' '}
              {pct(stats.easy, stats.approved)} % leicht (die meisten wissen es),{' '}
              {pct(stats.medium, stats.approved)} % mittel (mit Nachdenken lösbar) und{' '}
              {pct(stats.hard, stats.approved)} % schwer (trennt die Spreu vom Weizen).
            </p>
          )}
        </Card>

        <Card padding="lg" className="space-y-3">
          <h2 className={h2Cls}>Fehler gefunden?</h2>
          <p className={bodyCls}>
            Im{' '}
            <Link href={`/${locale}/generator`} className={linkCls}>
              Quiz-Generator
            </Link>{' '}
            lässt sich jede Frage mit einem Klick melden. Gemeldete Fragen sehen wir uns an und
            korrigieren oder entfernen sie. Für alles andere: Kontakt über das{' '}
            <Link href={`/${locale}/impressum`} className={linkCls}>
              Impressum
            </Link>
            .
          </p>
        </Card>

        <Card padding="lg" className="space-y-3">
          <h2 className={h2Cls}>Wer dahintersteht</h2>
          <p className={bodyCls}>
            PubQuizPlanner wird von Jan Ahrens entwickelt und betrieben – unabhängig, ohne Verlag
            oder Werbepartner. Die Nutzung ist kostenlos, ohne Anmeldung und ohne Werbung. Welche
            Daten dabei anfallen, steht in der{' '}
            <Link href={`/${locale}/datenschutz`} className={linkCls}>
              Datenschutzerklärung
            </Link>
            .
          </p>
          <p className={bodyCls}>
            <Link href={questionsIndexPath(SOURCE_LOCALE)} className={linkCls}>
              Alle Quizfragen ansehen
            </Link>{' '}
            ·{' '}
            <Link href={`/${locale}/generator`} className={linkCls}>
              Eigenes Quiz erstellen
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
