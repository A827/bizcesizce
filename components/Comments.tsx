'use client';
import { useEffect, useState } from 'react';
import { useLang } from './LanguageProvider';
import { getComments, postComment, toggleCommentLike } from '@/lib/actions';
import { Comment } from '@/lib/types';

export function Comments({ topicId, canComment }: { topicId: string; canComment: boolean }) {
  const { t, lang } = useLang();
  const [items, setItems] = useState<Comment[] | null>(null);
  const [body, setBody] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'pending' | 'error' | 'rate'>('idle');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState('');

  useEffect(() => { getComments(topicId).then(setItems); }, [topicId]);

  async function submit(parentId: string | null, text: string, after: () => void) {
    if (!text.trim() || state === 'saving') return;
    setState('saving');
    const res = await postComment(topicId, text, parentId);
    if (res.ok) {
      after();
      setItems(await getComments(topicId));
      setState('pending');
      setTimeout(() => setState('idle'), 4000);
    } else if (res.reason === 'rate_limited') setState('rate');
    else setState('error');
  }

  async function like(c: Comment) {
    // optimistic
    setItems((prev) => (prev ?? []).map((x) => x.id === c.id
      ? { ...x, liked: !x.liked, like_count: (x.like_count ?? 0) + (x.liked ? -1 : 1) } : x));
    const res = await toggleCommentLike(c.id);
    if (!res.ok) setItems(await getComments(topicId)); // revert on failure
  }

  const visible = (items ?? []).filter((c) => c.status === 'approved');
  const tops = visible.filter((c) => !c.parent_id);
  const repliesOf = (id: string) => visible.filter((c) => c.parent_id === id);

  const inputStyle: React.CSSProperties = { flex: 1, padding: 12, borderRadius: 10, background: 'var(--surface-2)',
    border: '1px solid var(--border)', color: 'var(--text)', font: 'inherit' };

  function Row({ c, isReply }: { c: Comment; isReply?: boolean }) {
    return (
      <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)',
        marginLeft: isReply ? 18 : 0, borderLeft: isReply ? '2px solid var(--border)' : undefined,
        paddingLeft: isReply ? 12 : 0 }}>
        <div style={{ fontSize: 14 }}>{c.body}</div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
          {c.author_name && <strong style={{ color: 'var(--text)' }}>{c.author_name} · </strong>}
          {c.region ?? '—'} · {new Date(c.created_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US')}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 6, alignItems: 'center' }}>
          <button onClick={() => like(c)} disabled={!canComment}
            style={{ background: 'none', border: 'none', cursor: canComment ? 'pointer' : 'default',
              color: c.liked ? 'var(--coral)' : 'var(--muted)', fontSize: 13, padding: 0 }}>
            {c.liked ? '♥' : '♡'} {c.like_count ?? 0}
          </button>
          {canComment && !isReply && (
            <button onClick={() => { setReplyTo(replyTo === c.id ? null : c.id); setReplyBody(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 13, padding: 0 }}>
              {t('reply')}
            </button>
          )}
        </div>
        {replyTo === c.id && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input value={replyBody} onChange={(e) => setReplyBody(e.target.value)} maxLength={600}
              placeholder={t('addComment')} style={inputStyle} autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') submit(c.id, replyBody, () => { setReplyBody(''); setReplyTo(null); }); }} />
            <button className="btn btn-accent" disabled={!replyBody.trim() || state === 'saving'}
              onClick={() => submit(c.id, replyBody, () => { setReplyBody(''); setReplyTo(null); })}>
              {t('postComment')}
            </button>
          </div>
        )}
        {repliesOf(c.id).map((r) => <Row key={r.id} c={r} isReply />)}
      </div>
    );
  }

  return (
    <div style={{ marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
      <div className="kicker">{t('comments')}</div>

      {canComment ? (
        <div style={{ display: 'flex', gap: 8, margin: '10px 0 6px' }}>
          <input value={body} onChange={(e) => setBody(e.target.value)} maxLength={600}
            placeholder={t('addComment')} style={inputStyle}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(null, body, () => setBody('')); }} />
          <button className="btn btn-accent" disabled={!body.trim() || state === 'saving'}
            onClick={() => submit(null, body, () => setBody(''))}>{t('postComment')}</button>
        </div>
      ) : (
        <p className="muted" style={{ fontSize: 13, margin: '8px 0' }}>{t('voteToComment')}</p>
      )}

      {state === 'pending' && <p className="muted" style={{ fontSize: 13 }}>{t('commentPending')}</p>}
      {state === 'rate' && <p className="error" style={{ fontSize: 13 }}>{t('rateLimited')}</p>}
      {state === 'error' && <p className="error" style={{ fontSize: 13 }}>{t('errorGeneric')}</p>}

      {items === null ? (
        <div className="skeleton" style={{ height: 48, marginTop: 8 }} />
      ) : tops.length === 0 ? (
        <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>{t('noComments')}</p>
      ) : (
        <div style={{ marginTop: 8 }}>
          {tops.map((c) => <Row key={c.id} c={c} />)}
        </div>
      )}
    </div>
  );
}
