import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Card from '@/components/ds/Card';
import { SOURCE_LOCALE } from '@/config/locales';

// German-only content on every locale URL → canonical points at the
// source-locale page (see impressum/page.tsx).
export const metadata: Metadata = {
  title: 'Credits | PubQuizPlanner',
  alternates: { canonical: `/${SOURCE_LOCALE}/credits` },
};

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
        {/* Licence of our own question content (decided 2026-11-15). */}
        <Card padding="lg" className="space-y-3">
          <h2 className="font-display text-xl font-bold text-[var(--text-strong)]">
            Lizenz unserer Quizfragen
          </h2>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Die Quizfragen auf pubquizplanner.com – Fragen, Antworten und Fun Facts – stehen unter
            der Lizenz{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/deed.de"
              target="_blank"
              rel="license noopener noreferrer"
              className="text-[var(--link)] underline transition-colors hover:text-[var(--link-hover)]"
            >
              Creative Commons Namensnennung – Weitergabe unter gleichen Bedingungen 4.0 (CC BY-SA 4.0)
            </a>
            . Du darfst sie kopieren, bearbeiten und weitergeben, auch kommerziell, solange du die
            Quelle angibst und Bearbeitungen unter derselben Lizenz weitergibst.
          </p>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            So geht die Quellenangabe, zum Beispiel auf einem Arbeitsblatt:{' '}
            <span className="font-mono text-[var(--text-strong)]">
              Quizfragen: PubQuizPlanner (pubquizplanner.com), CC BY-SA 4.0
            </span>
          </p>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Nicht unter dieser Lizenz stehen die Software, das Design, das Logo und die
            Illustrationen der Website.
          </p>
        </Card>

        <p className="text-sm leading-relaxed text-[var(--text-body)]">
          Wie unsere Fragen entstehen und geprüft werden, steht unter{' '}
          <Link
            href={`/${locale}/ueber-uns`}
            className="text-[var(--link)] underline transition-colors hover:text-[var(--link-hover)]"
          >
            So entstehen unsere Quizfragen
          </Link>
          .
        </p>

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
          Fragen aus diesen Quellen wurden ins Deutsche übersetzt, redaktionell bearbeitet und auf Richtigkeit geprüft.
        </p>

        {/* AI disclosure — required by e.g. Deutscher Bildungsserver; also
            states the human-approval promise that is part of the brand. */}
        <Card padding="lg" className="space-y-3">
          <h2 className="font-display text-xl font-bold text-[var(--text-strong)]">Einsatz von KI</h2>
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            Ein Teil der Fragen wurde mit Unterstützung von KI entworfen oder übersetzt. Jede Frage
            wird vor der Veröffentlichung von einem Menschen gelesen, auf Richtigkeit geprüft und
            erst dann freigegeben.
          </p>
        </Card>

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
