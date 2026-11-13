import { Check, X } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { FESTIVE_SLUG } from '@/lib/festive';
import s from './HeroStage.module.css';

/* The hero visual: a quiz slide, a filled-in answer sheet and the host's
 * cheat sheet — the three things the generator produces — drawn in CSS so
 * they stay sharp and translate with the page. Purely illustrative: the whole
 * picture is one labelled image for assistive tech. */
export default async function HeroStage({
  locale,
  festive = false,
}: {
  locale: string;
  /** Seasonal: snow on the slide, a Christmas tree peeking out behind it. */
  festive?: boolean;
}) {
  const t = await getTranslations({ locale, namespace: 'landing.stage' });
  const tl = await getTranslations({ locale, namespace: 'landing' });
  const round = tl('roundLabel', { n: 2 });
  const answers = ['a', 'b', 'c', 'd'] as const;
  const rows = [
    { text: t('row1'), ok: true },
    { text: t('row2'), ok: true },
    { text: t('row3'), ok: false },
    { text: t('answerB'), ok: true },
  ];

  return (
    <div className={s.stage} role="img" aria-label={t('alt')}>
      <div className={s.inner} aria-hidden>
        <div className={s.sun} />
        {festive && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/categories/${FESTIVE_SLUG}/icon.svg`} alt="" className={s.tree} />
        )}

        <div className={s.slide}>
          {festive && (
            <svg className={s.snow} viewBox="0 0 470 46" preserveAspectRatio="none">
              <path
                d="M16 12C16 3 30 1 40 1h390c10 0 24 2 24 11 2 12-8 16-16 12-12-6-20 2-28 8-12 10-26 6-34-4-10-10-26-8-36-2-14 10-32 6-42-2-12-8-28-4-36 4-12 12-30 10-38 0-10-10-26-8-34-2-14 10-32 4-40-2-12-8-26-2-34 6-10 10-26 8-34-2-10-10-26-8-34-2-12 8-34 2-32-14z"
                fill="#fff"
                stroke="#1A2238"
                strokeWidth="2.4"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )}
          <div className={s.kicker}>
            {round} · {tl('demoProgress', { n: 4, total: 10 })}
          </div>
          <p className={s.question}>{t('question')}</p>
          <ul className={s.answers}>
            {answers.map((k) => (
              <li key={k} className={k === 'b' ? s.ok : undefined}>
                <i>{k.toUpperCase()}</i>
                {t(`answer${k.toUpperCase()}` as 'answerA')}
                {k === 'b' && <Check strokeWidth={3} />}
              </li>
            ))}
          </ul>
        </div>

        <div className={s.sticker}>
          <span>
            {t('sticker1')}
            <br />
            <em>{t('sticker2')}</em>
            <br />
            {t('sticker3')}
          </span>
        </div>

        <div className={s.sheet}>
          <div className={s.label}>
            <span>{t('sheet')}</span>
            <span>{round}</span>
          </div>
          <div className={s.team}>
            {t('team')} <span className={s.hand}>{t('teamName')}</span>
          </div>
          <ol className={s.rows}>
            {rows.map((r, i) => (
              <li key={i} className={r.ok ? undefined : s.no}>
                <i>{i + 1}</i>
                <span className={s.hand}>{r.text}</span>
                {r.ok ? <Check strokeWidth={3} /> : <X strokeWidth={3} />}
              </li>
            ))}
          </ol>
          <div className={s.score}>3/4</div>
        </div>

        <div className={s.note}>
          <div className={s.label}>
            <span>{t('note')}</span>
            <span>#4</span>
          </div>
          <strong>B · {t('answerB')}</strong>
          <p>{t('noteText')}</p>
        </div>
      </div>
    </div>
  );
}
