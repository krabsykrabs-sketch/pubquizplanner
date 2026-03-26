import Link from 'next/link';

export default function DatenschutzPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-[var(--gold)] mb-8">Datenschutzerklärung</h1>

      <div className="space-y-8 text-sm text-[var(--muted)] leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">1. Verantwortlicher</h2>
          <p>Jan Ahrens</p>
          <p>C/Gombau 14 3-2</p>
          <p>Barcelona, Spanien</p>
          <p className="mt-2">E-Mail: krabsykrabs@gmail.com</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">2. Allgemeine Hinweise</h2>
          <p>
            Der Schutz Ihrer personenbezogenen Daten ist uns wichtig. Diese Datenschutzerklärung
            informiert Sie darüber, welche Daten beim Besuch dieser Website erhoben werden und
            wie diese genutzt werden. Die Verarbeitung erfolgt im Einklang mit der
            Datenschutz-Grundverordnung (DSGVO) und dem Bundesdatenschutzgesetz (BDSG).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">3. Keine Erhebung personenbezogener Daten</h2>
          <p>
            Diese Website erhebt, speichert und verarbeitet <strong className="text-[var(--foreground)]">keine
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
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">4. Quiz-Generierung</h2>
          <p>
            Die Quiz-Generierung auf dieser Website erfolgt ohne Anmeldung und ohne Speicherung
            von Nutzerdaten. Die ausgewählten Fragen werden direkt aus einer Datenbank abgerufen.
            Es werden dabei keine Informationen über Sie als Besucher gespeichert.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">5. Hosting</h2>
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
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">6. Ihre Rechte</h2>
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
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">7. Änderungen</h2>
          <p>
            Diese Datenschutzerklärung kann bei Bedarf aktualisiert werden, insbesondere wenn neue
            Funktionen (z.B. Werbeanzeigen) hinzugefügt werden. Die jeweils aktuelle Fassung
            finden Sie stets auf dieser Seite.
          </p>
        </section>

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
