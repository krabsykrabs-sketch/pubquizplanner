import { Check, X } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import s from './HeroStage.module.css';

/* The hero visual: a quiz slide, a filled-in answer sheet and the host's
 * cheat sheet — the three things the generator produces — drawn in CSS so
 * they stay sharp and translate with the page. Purely illustrative: the whole
 * picture is one labelled image for assistive tech. */
export default async function HeroStage({ locale }: { locale: string }) {
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

        <div className={s.slide}>
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
