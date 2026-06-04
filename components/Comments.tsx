'use client';
import { useEffect, useState } from 'react';
import { useLang } from './LanguageProvider';
import { getComments, postComment } from '@/lib/actions';
import { Comment } from '@/lib/types';

export function Comments({ topicId, canComment }: { topicId: string; canComment: boolean }) {
  const { t, lang } = useLang();
  const [items, setItems] = useState<Comment[] | null>(null);
  const [body, setBody] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'pending' | 'error' | 'rate'>('idle');

  useEffect(() => { getComments(topicId).then(setItems); }, [topicId]);

  async function submit() {
    if (!body.trim() || state === 'saving') return;
    setState('saving');
    const res = await postComment(topicId, body);
    if (res.ok) {
      setBody('');
      const fresh = await getComments(topicId);
      setItems(fresh);
      // If nothing newly visible, it's awaiting moderation.
      setState('pending');
      setTimeout(() => setState('idle'), 4000);
    } else if (res.reason === 'rate_limited') {
      setState('rate');
    } else {
      setState('error');
    }
  }

  const visible = (items ?? []).filter((c) => c.status === 'approved');

  return (
    <div style={{ marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
      <div className="kicker">{t('comments')}</div>

      {canComment ? (
        <div style={{ display: 'flex', gap: 8, margin: '10px 0 6px' }}>
          <input
            value={body} onChange={(e) => setBody(e.target.value)} maxLength={600}
            placeholder={t('addComment')}
            style={{ flex: 1, padding: 12, borderRadius: 10, background: 'var(--surface-2)',
              border: '1px solid var(--border)', color: 'var(--text)', font: 'inherit' }}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          />
          <button className="btn btn-accent" disabled={!body.trim() || state === 'saving'} onClick={submit}>
            {t('postComment')}
          </button>
        </div>
      ) : (
        <p className="muted" style={{ fontSize: 13, margin: '8px 0' }}>{t('voteToComment')}</p>
      )}

      {state === 'pending' && <p className="muted" style={{ fontSize: 13 }}>{t('commentPending')}</p>}
      {state === 'rate' && <p className="error" style={{ fontSize: 13 }}>{t('rateLimited')}</p>}
      {state === 'error' && <p className="error" style={{ fontSize: 13 }}>{t('errorGeneric')}</p>}

      {items === null ? (
        <div className="skeleton" style={{ height: 48, marginTop: 8 }} />
      ) : visible.length === 0 ? (
        <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>{t('noComments')}</p>
      ) : (
        <div style={{ marginTop: 8 }}>
          {visible.map((c) => (
            <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 14 }}>{c.body}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                {c.author_name && <strong style={{ color: 'var(--text)' }}>{c.author_name} · </strong>}
                {c.region ?? '—'} · {new Date(c.created_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
