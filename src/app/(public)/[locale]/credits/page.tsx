import Link from 'next/link';

export default function CreditsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-[var(--gold)] mb-8">Quellenangaben & Lizenzen</h1>

      <div className="space-y-8">
        <p className="text-[var(--muted)] text-sm leading-relaxed">
          Teile unserer Fragendatenbank basieren auf folgenden Quellen:
        </p>

        {/* OpenTDB */}
        <section className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-bold">Open Trivia Database</h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed">
            <a
              href="https://opentdb.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--gold)] underline hover:text-[var(--gold-light)] transition-colors"
            >
              opentdb.com
            </a>{' '}
            — lizenziert unter{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--gold)] underline hover:text-[var(--gold-light)] transition-colors"
            >
              Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)
            </a>
          </p>
        </section>

        {/* OpenTriviaQA */}
        <section className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-bold">OpenTriviaQA</h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed">
            <a
              href="https://github.com/uberspot/OpenTriviaQA"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--gold)] underline hover:text-[var(--gold-light)] transition-colors"
            >
              github.com/uberspot/OpenTriviaQA
            </a>{' '}
            — lizenziert unter{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--gold)] underline hover:text-[var(--gold-light)] transition-colors"
            >
              Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)
            </a>
          </p>
        </section>

        {/* Wikidata */}
        <section className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6 space-y-3">
          <h2 className="text-xl font-bold">Wikidata</h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed">
            <a
              href="https://www.wikidata.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--gold)] underline hover:text-[var(--gold-light)] transition-colors"
            >
              wikidata.org
            </a>{' '}
            — Daten stehen unter{' '}
            <span className="text-[var(--foreground)]">Creative Commons CC0</span>{' '}
            zur Verfügung
          </p>
        </section>

        {/* Note */}
        <p className="text-[var(--muted)] text-sm leading-relaxed">
          Alle Fragen wurden ins Deutsche übersetzt, redaktionell bearbeitet und auf Richtigkeit geprüft.
        </p>

        {/* License summary */}
        <div className="bg-[var(--background)] border border-[var(--dark-border)] rounded-lg p-4 text-xs text-[var(--muted)] font-mono leading-relaxed">
          <p className="font-bold mb-2">CC BY-SA 4.0 — Zusammenfassung:</p>
          <p className="mb-2">
            Sie dürfen das Material in jedwedem Format oder Medium vervielfältigen
            und weiterverbreiten, das Material remixen, verändern und darauf aufbauen,
            und zwar für beliebige Zwecke, sogar kommerziell.
          </p>
          <p className="mb-2">Unter folgenden Bedingungen:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Namensnennung</strong> — Sie müssen angemessene Urheber- und
              Rechteangaben machen und einen Link zur Lizenz beifügen.
            </li>
            <li>
              <strong>Weitergabe unter gleichen Bedingungen</strong> — Wenn Sie das
              Material remixen, verändern oder anderweitig direkt darauf aufbauen,
              dürfen Sie Ihre Beiträge nur unter derselben Lizenz verbreiten.
            </li>
          </ul>
          <p className="mt-3">
            Vollständiger Lizenztext:{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/legalcode"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--gold)] underline"
            >
              creativecommons.org/licenses/by-sa/4.0/legalcode
            </a>
          </p>
        </div>

        <Link
          href={`/${locale}`}
          className="inline-block text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          ← Zurück zur Startseite
        </Link>
      </div>
    </main>
  );
}
