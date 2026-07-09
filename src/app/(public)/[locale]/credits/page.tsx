import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Card from '@/components/ds/Card';

export default function CreditsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <main className="mx-auto max-w-container-narrow px-6 py-16">
      <h1 className="mb-8 font-display text-3xl font-extrabold tracking-[-0.02em] text-[var(--text-strong)]">
        Quellenangaben &amp; Lizenzen
      </h1>

      <div className="space-y-8">
        <p className="text-sm leading-relaxed text-[var(--text-body)]">
          Teile unserer Fragendatenbank basieren auf folgenden Quellen:
        </p>

        {/* OpenTDB */}
        <Card padding="lg" className="space-y-3">
          <h2 className="font-display text-xl font-bold text-[var(--text-strong)]">Open Trivia Database</h2>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            <a
              href="https://opentdb.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--link)] underline transition-colors hover:text-[var(--link-hover)]"
            >
              opentdb.com
            </a>{' '}
            — lizenziert unter{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--link)] underline transition-colors hover:text-[var(--link-hover)]"
            >
              Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)
            </a>
          </p>
        </Card>

        {/* OpenTriviaQA */}
        <Card padding="lg" className="space-y-3">
          <h2 className="font-display text-xl font-bold text-[var(--text-strong)]">OpenTriviaQA</h2>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            <a
              href="https://github.com/uberspot/OpenTriviaQA"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--link)] underline transition-colors hover:text-[var(--link-hover)]"
            >
              github.com/uberspot/OpenTriviaQA
            </a>{' '}
            — lizenziert unter{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--link)] underline transition-colors hover:text-[var(--link-hover)]"
            >
              Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)
            </a>
          </p>
        </Card>

        {/* Wikidata */}
        <Card padding="lg" className="space-y-3">
          <h2 className="font-display text-xl font-bold text-[var(--text-strong)]">Wikidata</h2>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            <a
              href="https://www.wikidata.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--link)] underline transition-colors hover:text-[var(--link-hover)]"
            >
              wikidata.org
            </a>{' '}
            — Daten stehen unter{' '}
            <span className="text-[var(--text-strong)]">Creative Commons CC0</span>{' '}
            zur Verfügung
          </p>
        </Card>

        {/* Note */}
        <p className="text-sm leading-relaxed text-[var(--text-body)]">
          Alle Fragen wurden ins Deutsche übersetzt, redaktionell bearbeitet und auf Richtigkeit geprüft.
        </p>

        {/* License summary */}
        <div className="rounded-ds-lg border border-[var(--border-subtle)] bg-[var(--bg-sunken)] p-5 font-mono text-xs leading-relaxed text-[var(--text-muted)]">
          <p className="mb-2 font-bold text-[var(--text-strong)]">CC BY-SA 4.0 — Zusammenfassung:</p>
          <p className="mb-2">
            Sie dürfen das Material in jedwedem Format oder Medium vervielfältigen
            und weiterverbreiten, das Material remixen, verändern und darauf aufbauen,
            und zwar für beliebige Zwecke, sogar kommerziell.
          </p>
          <p className="mb-2">Unter folgenden Bedingungen:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong className="text-[var(--text-strong)]">Namensnennung</strong> — Sie müssen angemessene Urheber- und
              Rechteangaben machen und einen Link zur Lizenz beifügen.
            </li>
            <li>
              <strong className="text-[var(--text-strong)]">Weitergabe unter gleichen Bedingungen</strong> — Wenn Sie das
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
              className="text-[var(--link)] underline transition-colors hover:text-[var(--link-hover)]"
            >
              creativecommons.org/licenses/by-sa/4.0/legalcode
            </a>
          </p>
        </div>

        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-[7px] text-sm font-semibold text-[var(--link)] no-underline transition-colors hover:text-[var(--link-hover)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Zurück zur Startseite
        </Link>
      </div>
    </main>
  );
}
