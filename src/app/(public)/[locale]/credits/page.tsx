import Link from 'next/link';

export default function CreditsPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-[var(--gold)] mb-8">Quellenangaben & Lizenzen</h1>

      <div className="space-y-8">
        {/* OpenTDB */}
        <section className="bg-[var(--dark-card)] border border-[var(--dark-border)] rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold">Open Trivia Database</h2>
          <p className="text-[var(--muted)] text-sm leading-relaxed">
            Teile unserer Fragendatenbank basieren auf der{' '}
            <a
              href="https://opentdb.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--gold)] underline hover:text-[var(--gold-light)] transition-colors"
            >
              Open Trivia Database
            </a>{' '}
            (opentdb.com), lizenziert unter der{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--gold)] underline hover:text-[var(--gold-light)] transition-colors"
            >
              Creative Commons Attribution-ShareAlike 4.0 International License
            </a>.
          </p>
          <p className="text-[var(--muted)] text-sm leading-relaxed">
            Die Originalfragen wurden ins Deutsche übersetzt und für den Einsatz im
            Pub-Quiz-Format angepasst. Gemäß den Lizenzbedingungen werden alle
            abgeleiteten Inhalte unter derselben Lizenz bereitgestellt.
          </p>
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
        </section>

        {/* Back link */}
        <Link
          href="/de"
          className="inline-block text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          ← Zurück zur Startseite
        </Link>
      </div>
    </main>
  );
}
