'use client';
import { useMemo, useState } from 'react';
import { useLang } from './LanguageProvider';
import { TopicCard, TopicCardData } from './TopicCard';
import { CATEGORIES, Category } from '@/lib/constants';

const CAT_LABEL: Record<Category, { tr: string; en: string }> = {
  Politics: { tr: 'Siyaset', en: 'Politics' },
  Local: { tr: 'Yerel', en: 'Local' },
  Economy: { tr: 'Ekonomi', en: 'Economy' },
  Lifestyle: { tr: 'Yaşam', en: 'Lifestyle' },
  Transport: { tr: 'Ulaşım', en: 'Transport' },
  Environment: { tr: 'Çevre', en: 'Environment' },
  Other: { tr: 'Diğer', en: 'Other' },
};

function trLower(s: string) {
  return s.replace('İ', 'i').replace('I', 'ı').toLowerCase();
}

export function Feed({ items, counts }: { items: TopicCardData[]; counts: Record<string, number> }) {
  const { t, lang } = useLang();
  const [cat, setCat] = useState<Category | 'all'>('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'new' | 'trending'>('new');

  const shown = useMemo(() => {
    const needle = trLower(q.trim());
    let list = items.filter((it) => {
      if (cat !== 'all' && it.topic.category !== cat) return false;
      if (!needle) return true;
      const hay = [it.topic.question_tr, it.topic.question_en,
        ...(it.topic.options ?? []).flatMap((o) => [o.label_tr, o.label_en ?? ''])].join(' ');
      return trLower(hay).includes(needle);
    });
    const daily = list.find((it) => it.topic.is_daily);
    let rest = list.filter((it) => !it.topic.is_daily);
    if (sort === 'trending') rest = [...rest].sort((a, b) => (counts[b.topic.id] ?? 0) - (counts[a.topic.id] ?? 0));
    return daily ? [daily, ...rest] : rest;
  }, [items, cat, q, sort, counts]);

  const chip = (active: boolean): React.CSSProperties => ({
    padding: '8px 14px', minHeight: 0,
    background: active ? 'var(--accent)' : 'var(--surface-2)',
    color: active ? 'var(--accent-ink)' : 'var(--text)',
    borderColor: active ? 'var(--accent)' : 'var(--border)',
    fontWeight: active ? 600 : 400,
  });

  return (
    <>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchPolls')}
        style={{ width: '100%', padding: 14, borderRadius: 999, background: 'var(--surface)',
          border: '1px solid var(--border)', color: 'var(--text)', font: 'inherit', margin: '4px 0 12px' }} />

      <div className="chips" style={{ marginBottom: 10 }}>
        <button className="btn" style={chip(cat === 'all')} onClick={() => setCat('all')}>{t('allCategories')}</button>
        {CATEGORIES.map((c) => (
          <button key={c} className="btn" style={chip(cat === c)} onClick={() => setCat(c)}>
            {lang === 'tr' ? CAT_LABEL[c].tr : CAT_LABEL[c].en}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className="btn" style={chip(sort === 'new')} onClick={() => setSort('new')}>{t('sortNew')}</button>
        <button className="btn" style={chip(sort === 'trending')} onClick={() => setSort('trending')}>{t('sortTrending')}</button>
      </div>

      {shown.length === 0 ? (
        <div className="empty">{items.length === 0 ? t('emptyFeed') : t('noMatches')}</div>
      ) : (
        shown.map((it) => <TopicCard key={it.topic.id} data={it} />)
      )}
    </>
  );
}
