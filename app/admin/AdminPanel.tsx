'use client';
import { useState, useTransition } from 'react';
import { useLang } from '@/components/LanguageProvider';
import { CATEGORIES, Category } from '@/lib/constants';
import { Topic } from '@/lib/types';
import {
  approveSuggestion, rejectSuggestion, createTopic, setDaily, setActive,
} from '@/lib/admin-actions';

type Suggestion = { id: string; question_tr: string; question_en: string | null };

export function AdminPanel({ topics, suggestions }: { topics: Topic[]; suggestions: Suggestion[] }) {
  const { t } = useLang();
  const [pending, start] = useTransition();
  const [qtr, setQtr] = useState('');
  const [qen, setQen] = useState('');
  const [cat, setCat] = useState<Category>('Other');

  const input: React.CSSProperties = {
    width: '100%', padding: 12, borderRadius: 10, background: 'var(--surface)',
    border: '1px solid var(--border)', color: 'var(--text)', font: 'inherit', marginBottom: 10,
  };

  return (
    <>
      <h1 className="serif" style={{ fontSize: 28 }}>{t('adminTitle')}</h1>

      {/* Pending suggestions */}
      <h2 className="kicker" style={{ marginTop: 24 }}>{t('pending')}</h2>
      {suggestions.length === 0 && <p className="muted">—</p>}
      {suggestions.map((s) => (
        <div className="card" key={s.id}>
          <div className="serif" style={{ fontSize: 18, marginBottom: 4 }}>{s.question_tr}</div>
          {s.question_en && <div className="muted" style={{ marginBottom: 12 }}>{s.question_en}</div>}
          <div className="vote-row">
            <button className="btn btn-accent" disabled={pending}
              onClick={() => start(() => { approveSuggestion(s.id); })}>{t('approve')}</button>
            <button className="btn" disabled={pending}
              onClick={() => start(() => { rejectSuggestion(s.id); })}>{t('reject')}</button>
          </div>
        </div>
      ))}

      {/* Create topic */}
      <h2 className="kicker" style={{ marginTop: 28 }}>{t('createTopic')}</h2>
      <div className="card">
        <textarea style={{ ...input, minHeight: 70 }} placeholder="Soru (TR)" value={qtr} onChange={(e) => setQtr(e.target.value)} />
        <textarea style={{ ...input, minHeight: 70 }} placeholder="Question (EN)" value={qen} onChange={(e) => setQen(e.target.value)} />
        <select style={input} value={cat} onChange={(e) => setCat(e.target.value as Category)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="btn btn-accent btn-block" disabled={pending || !qtr.trim() || !qen.trim()}
          onClick={() => start(async () => {
            await createTopic({ question_tr: qtr.trim(), question_en: qen.trim(), category: cat });
            setQtr(''); setQen('');
          })}>{t('createTopic')}</button>
      </div>

      {/* Manage existing topics */}
      <h2 className="kicker" style={{ marginTop: 28 }}>Topics</h2>
      {topics.map((tp) => (
        <div className="card" key={tp.id}>
          <div className="serif" style={{ fontSize: 17, marginBottom: 8 }}>
            {tp.is_daily && <span className="mono" style={{ color: 'var(--accent)', marginRight: 8 }}>★</span>}
            {tp.question_tr}
          </div>
          <div className="vote-row">
            <button className="btn" disabled={pending || tp.is_daily}
              onClick={() => start(() => { setDaily(tp.id); })}>{t('setDaily')}</button>
            <button className="btn" disabled={pending}
              onClick={() => start(() => { setActive(tp.id, !tp.is_active); })}>
              {tp.is_active ? t('deactivate') : 'Aktif et'}
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
