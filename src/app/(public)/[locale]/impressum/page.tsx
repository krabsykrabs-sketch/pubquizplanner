import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SOURCE_LOCALE } from '@/config/locales';

// The legal text is German on every locale URL, so all variants declare the
// source-locale page as canonical — otherwise Google reports them as
// "duplicate without user-selected canonical" and skips indexing.
export const metadata: Metadata = {
  title: 'Impressum | PubQuizPlanner',
  alternates: { canonical: `/${SOURCE_LOCALE}/impressum` },
};

export default function ImpressumPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <main className="mx-auto max-w-container-narrow px-6 py-16">
      <h1 className="mb-8 font-display text-3xl font-extrabold tracking-[-0.02em] text-[var(--text-strong)]">
        Impressum
      </h1>

      <div className="space-y-8 text-sm leading-relaxed text-[var(--text-body)]">
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-[var(--text-strong)]">Angaben gemäß § 5 TMG</h2>
          <p>Jan Ahrens</p>
          <p>C/Gombau 14 3-2</p>
          <p>Barcelona, Spanien</p>
          <p className="mt-2">E-Mail: krabsykrabs@gmail.com</p>
          <p>Telefon: Auf Anfrage</p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-[var(--text-strong)]">Haftung für Inhalte</h2>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen
            Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir
            als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
            Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
            rechtswidrige Tätigkeit hinweisen.
          </p>
          <p className="mt-2">
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
            allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist
            jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
            Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte
            umgehend entfernen.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-[var(--text-strong)]">Haftung für Links</h2>
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
            keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
            Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
            Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum
            Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige
            Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
          </p>
          <p className="mt-2">
            Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete
            Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von
            Rechtsverletzungen werden wir derartige Links umgehend entfernen.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-[var(--text-strong)]">Urheberrecht</h2>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
            unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
            Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
            bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen
            Gebrauch gestattet.
          </p>
          <p className="mt-2">
            Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die
            Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche
            gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam
            werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von
            Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
          </p>
        </section>

        <section className="rounded-ds-lg border border-[var(--border-subtle)] bg-[var(--bg-sunken)] p-5">
          <p>
            Diese Website verwendet keine Cookies und erhebt keine personenbezogenen Daten.
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
