import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SOURCE_LOCALE } from '@/config/locales';

// German-only legal text on every locale URL → canonical points at the
// source-locale page (see impressum/page.tsx).
export const metadata: Metadata = {
  title: 'Datenschutzerklärung | PubQuizPlanner',
  alternates: { canonical: `/${SOURCE_LOCALE}/datenschutz` },
};

export default function DatenschutzPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <main className="mx-auto max-w-container-narrow px-6 py-16">
      <h1 className="mb-8 font-display text-3xl font-extrabold tracking-[-0.02em] text-[var(--text-strong)]">
        Datenschutzerklärung
      </h1>

      <div className="space-y-8 text-sm leading-relaxed text-[var(--text-body)]">
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-[var(--text-strong)]">1. Verantwortlicher</h2>
          <p>Jan Ahrens</p>
          <p>C/Gombau 14 3-2</p>
          <p>Barcelona, Spanien</p>
          <p className="mt-2">E-Mail: krabsykrabs@gmail.com</p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-[var(--text-strong)]">2. Allgemeine Hinweise</h2>
          <p>
            Der Schutz Ihrer personenbezogenen Daten ist uns wichtig. Diese Datenschutzerklärung
            informiert Sie darüber, welche Daten beim Besuch dieser Website erhoben werden und
            wie diese genutzt werden. Die Verarbeitung erfolgt im Einklang mit der
            Datenschutz-Grundverordnung (DSGVO) und dem Bundesdatenschutzgesetz (BDSG).
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-[var(--text-strong)]">3. Keine Erhebung personenbezogener Daten</h2>
          <p>
            Diese Website erhebt, speichert und verarbeitet <strong className="text-[var(--text-strong)]">keine
            personenbezogenen Daten</strong> ihrer Besucher. Im Einzelnen bedeutet das:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Es werden keine Cookies gesetzt.</li>
            <li>Es werden keine Analyse- oder Tracking-Tools eingesetzt.</li>
            <li>Es gibt keine Benutzerkonten oder Login-Funktionen für Besucher.</li>
            <li>Es werden keine externen Schriften (z.B. Google Fonts) von Drittanbietern geladen.</li>
            <li>Es werden keine Drittanbieter-Dienste auf der öffentlichen Seite eingebunden.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-[var(--text-strong)]">4. Quiz-Generierung</h2>
          <p>
            Die Quiz-Generierung auf dieser Website erfolgt ohne Anmeldung und ohne Speicherung
            von Nutzerdaten. Die ausgewählten Fragen werden direkt aus einer Datenbank abgerufen.
            Es werden dabei keine Informationen über Sie als Besucher gespeichert.
          </p>
          <p className="mt-2">
            Zur Verbesserung des Angebots erheben wir selbst gehostete, anonyme
            Nutzungsstatistiken (aufgerufene Seiten, Anzahl erstellter Quizze und Downloads).
            Dabei werden weder IP-Adressen noch Cookies noch sonstige personenbezogene Daten
            gespeichert; eine Wiedererkennung über den einzelnen Besuch hinaus findet nicht
            statt. Es kommen keine Analysedienste von Drittanbietern zum Einsatz.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-[var(--text-strong)]">5. Hosting</h2>
          <p>
            Diese Website wird über Coolify auf Servern von Hetzner Online GmbH in Deutschland
            gehostet. Der Server befindet sich in einem deutschen Rechenzentrum. Im Rahmen des
            Hostings werden vom Webserver standardmäßig technische Zugriffsdaten (z.B. IP-Adresse,
            Zeitpunkt des Zugriffs, angeforderte URL) in Server-Logfiles erfasst. Diese Daten
            werden ausschließlich für den technischen Betrieb benötigt und nicht ausgewertet oder
            mit anderen Datenquellen zusammengeführt.
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der
            Bereitstellung und Sicherheit der Website).
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-[var(--text-strong)]">6. Ihre Rechte</h2>
          <p>
            Sie haben gemäß DSGVO folgende Rechte: Auskunft (Art. 15), Berichtigung (Art. 16),
            Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit
            (Art. 20) und Widerspruch (Art. 21). Da wir keine personenbezogenen Daten erheben,
            sind diese Rechte in der Praxis derzeit nicht anwendbar.
          </p>
          <p className="mt-2">
            Sie haben zudem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-[var(--text-strong)]">7. Änderungen</h2>
          <p>
            Diese Datenschutzerklärung kann bei Bedarf aktualisiert werden, insbesondere wenn neue
            Funktionen (z.B. Werbeanzeigen) hinzugefügt werden. Die jeweils aktuelle Fassung
            finden Sie stets auf dieser Seite.
          </p>
        </section>

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
