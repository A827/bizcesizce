'use client';
import { useState } from 'react';
import { useLang } from '@/components/LanguageProvider';
import { createClient } from '@/lib/supabase/client';

export function SuggestForm() {
  const { t } = useLang();
  const [qtr, setQtr] = useState('');
  const [qen, setQen] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');

  async function submit() {
    if (!qtr.trim()) return;
    setState('saving');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setState('error'); return; }
    const { error } = await supabase.from('topic_suggestions').insert({
      question_tr: qtr.trim(), question_en: qen.trim() || null, suggested_by: user.id,
    });
    setState(error ? 'error' : 'done');
  }

  if (state === 'done') {
    return <div className="empty" style={{ color: 'var(--accent)' }}>{t('thanks')}</div>;
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: 14, borderRadius: 12, background: 'var(--surface)',
    border: '1px solid var(--border)', color: 'var(--text)', font: 'inherit', marginBottom: 16,
  };

  return (
    <>
      <h1 className="serif" style={{ fontSize: 28, marginBottom: 6 }}>{t('suggestTitle')}</h1>
      <p className="muted" style={{ marginBottom: 24 }}>{t('suggestBlurb')}</p>

      <label className="kicker">{t('qTr')}</label>
      <textarea style={{ ...inputStyle, minHeight: 90 }} value={qtr} onChange={(e) => setQtr(e.target.value)} />

      <label className="kicker">{t('qEn')}</label>
      <textarea style={{ ...inputStyle, minHeight: 90 }} value={qen} onChange={(e) => setQen(e.target.value)} />

      {state === 'error' && <p className="error">{t('errorGeneric')}</p>}

      <button className="btn btn-accent btn-block" disabled={!qtr.trim() || state === 'saving'}
        style={{ opacity: qtr.trim() ? 1 : 0.45 }} onClick={submit}>
        {state === 'saving' ? t('loading') : t('send')}
      </button>
    </>
  );
}
