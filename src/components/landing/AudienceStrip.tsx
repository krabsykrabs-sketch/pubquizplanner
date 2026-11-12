import { Beer, GraduationCap, House, Users, type LucideIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

/* "Für wen?" — the four occasions the tool serves, each with its own marker
 * colour: school, work, pub/club, home. One strip, four cells. */
const ITEMS: { key: 'School' | 'Team' | 'Pub' | 'Home'; icon: LucideIcon; soft: string; ink: string }[] = [
  { key: 'School', icon: GraduationCap, soft: 'var(--blue-soft)', ink: 'var(--blue)' },
  { key: 'Team', icon: Users, soft: 'var(--green-soft)', ink: 'var(--green)' },
  { key: 'Pub', icon: Beer, soft: 'var(--yellow-soft)', ink: 'var(--amber-600)' },
  { key: 'Home', icon: House, soft: 'var(--pink-soft)', ink: 'var(--pink)' },
];

export default async function AudienceStrip({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'landing' });

  return (
    <section id="fuer-wen" className="pb-[60px] nav:pb-[84px]">
      <div className="mx-auto max-w-container px-5 sm:px-6">
        <span className="font-mono text-[0.78rem] font-medium uppercase tracking-[0.14em] text-[var(--accent-text)]">
          {t('kickerWho')}
        </span>
        <h2 className="mb-0 mt-2.5 font-display text-[clamp(1.6rem,3vw,2.25rem)] font-extrabold leading-[1.1] tracking-[-0.02em] text-[var(--text-strong)]">
          {t('whoTitle')}
        </h2>
        <ul className="m-0 mt-[26px] grid list-none grid-cols-1 overflow-hidden rounded-ds-xl border-2 border-[var(--edge)] bg-[var(--surface-card)] p-0 sm:grid-cols-2 nav:grid-cols-4">
          {ITEMS.map(({ key, icon: Icon, soft, ink }, i) => (
            <li
              key={key}
              className={[
                'flex gap-3.5 border-[var(--border-subtle)] px-[22px] pb-6 pt-[22px] nav:flex-col nav:px-6 nav:pb-7 nav:pt-[26px]',
                i > 0 ? 'border-t-2' : '',
                i === 1 ? 'sm:border-t-0' : '',
                i % 2 === 1 ? 'sm:border-l-2' : '',
                i > 0 ? 'nav:border-l-2 nav:border-t-0' : '',
              ].join(' ')}
            >
              <span
                className="grid h-[46px] w-[46px] flex-none place-items-center rounded-[13px]"
                style={{ background: soft, color: ink }}
              >
                <Icon className="h-[23px] w-[23px]" aria-hidden />
              </span>
              <div>
                <h3 className="mb-1 mt-px font-display text-[1.15rem] font-extrabold leading-[1.2] tracking-[-0.01em] text-[var(--text-strong)]">
                  {t(`who${key}Title`)}
                </h3>
                <p className="m-0 text-[0.95rem] leading-[1.45] text-[var(--text-muted)]">
                  {t(`who${key}Text`)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
