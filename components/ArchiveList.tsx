'use client';
import { useLang } from './LanguageProvider';

export type ArchiveItem = {
  id: string; question_tr: string; question_en: string;
  date: string | null; agree: number; total: number;
};

export function ArchiveList({ items }: { items: ArchiveItem[] }) {
  const { t, lang } = useLang();
  if (items.length === 0) return <div className="empty">{t('emptyFeed')}</div>;
  return (
    <>
      {items.map((it) => {
        const pct = it.total ? Math.round((it.agree / it.total) * 100) : 0;
        return (
          <div className="card" key={it.id}>
            {it.date && <div className="kicker">{it.date}</div>}
            <div className="serif" style={{ fontSize: 18, marginBottom: 10 }}>
              {lang === 'tr' ? it.question_tr : it.question_en}
            </div>
            <div className="bar-label"><span>{t('agree')}</span><span className="bar-pct">{pct}%</span></div>
            <div className="bar agree"><span style={{ width: `${pct}%` }} /></div>
            <div className="total">{it.total.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')} {t('totalVotes')}</div>
          </div>
        );
      })}
    </>
  );
}
