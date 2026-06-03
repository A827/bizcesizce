'use client';
import { useState, useTransition, useEffect } from 'react';
import { useLang } from '@/components/LanguageProvider';
import { CATEGORIES, Category, CommentMode } from '@/lib/constants';
import { Topic } from '@/lib/types';
import {
  approveSuggestion, rejectSuggestion, createTopic, setDaily, setActive,
  setCommentsEnabled, setCommentMode, setScheduledDate,
  updateTopicText, addOption, updateOption, deleteOption,
  listPendingComments, moderateComment, PendingComment,
  getBreakdown, getTimeseries, BreakdownRow, TimePoint,
  listSponsors, createSponsor, setSponsorActive, deleteSponsor,
  getOptionBreakdown, OptionBreakdownRow,
  getOverview, Overview, listAudit, AuditRow,
} from '@/lib/admin-actions';
import { getOptionResults } from '@/lib/actions';
import { Sponsor, SponsorPlacement, OptionResult } from '@/lib/types';

type Suggestion = { id: string; question_tr: string; question_en: string | null };
type Tab = 'overview' | 'suggestions' | 'topics' | 'results' | 'moderation' | 'sponsors';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: 12, borderRadius: 10, background: 'var(--surface)',
  border: '1px solid var(--border)', color: 'var(--text)', font: 'inherit', marginBottom: 10,
};

export function AdminPanel({ topics, suggestions }: { topics: Topic[]; suggestions: Suggestion[] }) {
  const { t } = useLang();
  const [tab, setTab] = useState<Tab>('overview');

  const TabBtn = ({ id, label }: { id: Tab; label: string }) => (
    <button className="btn" onClick={() => setTab(id)}
      style={{ padding: '8px 14px', minHeight: 0,
        background: tab === id ? 'var(--accent)' : 'var(--surface-2)',
        color: tab === id ? 'var(--accent-ink)' : 'var(--text)',
        borderColor: tab === id ? 'var(--accent)' : 'var(--border)', fontWeight: tab === id ? 600 : 400 }}>
      {label}
    </button>
  );

  return (
    <>
      <h1 className="serif" style={{ fontSize: 28 }}>{t('adminTitle')}</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '16px 0 8px' }}>
        <TabBtn id="overview" label={t('tabOverview')} />
        <TabBtn id="suggestions" label={`${t('tabSuggestions')} (${suggestions.length})`} />
        <TabBtn id="topics" label={t('tabTopics')} />
        <TabBtn id="results" label={t('tabResults')} />
        <TabBtn id="moderation" label={t('tabModeration')} />
        <TabBtn id="sponsors" label={t('tabSponsors')} />
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'suggestions' && <SuggestionsTab suggestions={suggestions} />}
      {tab === 'topics' && <TopicsTab topics={topics} />}
      {tab === 'results' && <ResultsTab topics={topics} />}
      {tab === 'moderation' && <ModerationTab topics={topics} />}
      {tab === 'sponsors' && <SponsorsTab />}
    </>
  );
}

function SponsorsTab() {
  const [items, setItems] = useState<Sponsor[] | null>(null);
  const [pending, start] = useTransition();
  const [ltr, setLtr] = useState(''); const [len, setLen] = useState('');
  const [url, setUrl] = useState(''); const [placement, setPlacement] = useState<SponsorPlacement>('reveal');

  useEffect(() => { listSponsors().then(setItems); }, []);
  const refresh = async () => setItems(await listSponsors());

  return (
    <>
      <h2 className="kicker" style={{ marginTop: 12 }}>Yeni sponsor</h2>
      <div className="card">
        <input style={inputStyle} placeholder="Etiket (TR) — örn. 'Bu anketi X destekliyor'" value={ltr} onChange={(e) => setLtr(e.target.value)} />
        <input style={inputStyle} placeholder="Label (EN)" value={len} onChange={(e) => setLen(e.target.value)} />
        <input style={inputStyle} placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
        <select style={inputStyle} value={placement} onChange={(e) => setPlacement(e.target.value as SponsorPlacement)}>
          <option value="reveal">Sonuç altı (reveal)</option>
          <option value="feed">Akış içi (feed)</option>
          <option value="footer">Altbilgi (footer)</option>
        </select>
        <button className="btn btn-accent btn-block" disabled={pending || !ltr.trim() || !url.trim()}
          onClick={() => start(async () => { await createSponsor({ label_tr: ltr.trim(), label_en: len.trim(), url: url.trim(), placement }); setLtr(''); setLen(''); setUrl(''); await refresh(); })}>
          Ekle
        </button>
      </div>

      {items === null ? <div className="skeleton" style={{ height: 60 }} /> :
        items.length === 0 ? <p className="muted">—</p> :
        items.map((s) => (
          <div className="card" key={s.id}>
            <div style={{ fontSize: 15, marginBottom: 4 }}>{s.label_tr}</div>
            <div className="mono muted" style={{ fontSize: 12, marginBottom: 10 }}>{s.placement} · {s.url}</div>
            <div className="vote-row">
              <button className="btn" disabled={pending} onClick={() => start(async () => { await setSponsorActive(s.id, !s.is_active); await refresh(); })}>
                {s.is_active ? 'Pasifleştir' : 'Aktifleştir'}
              </button>
              <button className="btn" disabled={pending} onClick={() => start(async () => { await deleteSponsor(s.id); await refresh(); })}>
                Sil
              </button>
            </div>
          </div>
        ))}
    </>
  );
}

function OverviewTab() {
  const [ov, setOv] = useState<Overview | null>(null);
  const [audit, setAudit] = useState<AuditRow[] | null>(null);
  useEffect(() => { getOverview().then(setOv); listAudit().then(setAudit); }, []);

  const Stat = ({ label, value }: { label: string; value: number }) => (
    <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
      <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{label}</div>
      <div className="serif" style={{ fontSize: 26 }}>{value.toLocaleString('tr-TR')}</div>
    </div>
  );

  return (
    <>
      {ov === null ? <div className="skeleton" style={{ height: 90 }} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
          <Stat label="Toplam oy" value={ov.total_votes} />
          <Stat label="Bugün" value={ov.votes_today} />
          <Stat label="Konu" value={ov.total_topics} />
          <Stat label="Yorum" value={ov.total_comments} />
          <Stat label="Kullanıcı" value={ov.total_users} />
        </div>
      )}
      <h2 className="kicker">Son işlemler</h2>
      {audit === null ? <div className="skeleton" style={{ height: 60 }} /> :
        audit.length === 0 ? <p className="muted">—</p> :
        <div className="card">
          {audit.map((a) => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span>{a.action}{a.detail ? ` · ${a.detail}` : ''}</span>
              <span className="mono" style={{ color: 'var(--muted)' }}>{new Date(a.created_at).toLocaleString('tr-TR')}</span>
            </div>
          ))}
        </div>}
    </>
  );
}

function SuggestionsTab({ suggestions }: { suggestions: Suggestion[] }) {
  const { t } = useLang();
  const [pending, start] = useTransition();
  if (suggestions.length === 0) return <p className="muted">—</p>;
  return (
    <>
      {suggestions.map((s) => (
        <div className="card" key={s.id}>
          <div className="serif" style={{ fontSize: 18, marginBottom: 4 }}>{s.question_tr}</div>
          {s.question_en && <div className="muted" style={{ marginBottom: 12 }}>{s.question_en}</div>}
          <div className="vote-row">
            <button className="btn btn-accent" disabled={pending} onClick={() => start(() => { approveSuggestion(s.id); })}>{t('approve')}</button>
            <button className="btn" disabled={pending} onClick={() => start(() => { rejectSuggestion(s.id); })}>{t('reject')}</button>
          </div>
        </div>
      ))}
    </>
  );
}

function TopicsTab({ topics }: { topics: Topic[] }) {
  const { t } = useLang();
  const [pending, start] = useTransition();
  const [qtr, setQtr] = useState(''); const [qen, setQen] = useState(''); const [cat, setCat] = useState<Category>('Other');
  const [multi, setMulti] = useState(false);
  const [opts, setOpts] = useState<{ tr: string; en: string }[]>([{ tr: '', en: '' }, { tr: '', en: '' }]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const setOpt = (i: number, k: 'tr' | 'en', v: string) =>
    setOpts((arr) => arr.map((o, j) => (j === i ? { ...o, [k]: v } : o)));
  const validOpts = opts.filter((o) => o.tr.trim());
  const canCreate = qtr.trim() && qen.trim() && (!multi || validOpts.length >= 2);

  return (
    <>
      <h2 className="kicker" style={{ marginTop: 12 }}>{t('createTopic')}</h2>
      <div className="card">
        <textarea style={{ ...inputStyle, minHeight: 60 }} placeholder="Soru (TR)" value={qtr} onChange={(e) => setQtr(e.target.value)} />
        <textarea style={{ ...inputStyle, minHeight: 60 }} placeholder="Question (EN)" value={qen} onChange={(e) => setQen(e.target.value)} />
        <select style={inputStyle} value={cat} onChange={(e) => setCat(e.target.value as Category)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', fontSize: 14, margin: '4px 0 12px' }}>
          <input type="checkbox" checked={multi} onChange={(e) => setMulti(e.target.checked)} />
          Çoktan seçmeli (kendi şıklarını yaz) · Multiple choice
        </label>

        {multi && (
          <div style={{ marginBottom: 10 }}>
            {opts.map((o, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input style={{ ...inputStyle, marginBottom: 0 }} placeholder={`Şık ${i + 1} (TR)`} value={o.tr} onChange={(e) => setOpt(i, 'tr', e.target.value)} />
                <input style={{ ...inputStyle, marginBottom: 0 }} placeholder={`Option ${i + 1} (EN)`} value={o.en} onChange={(e) => setOpt(i, 'en', e.target.value)} />
              </div>
            ))}
            {opts.length < 6 && (
              <button className="btn" style={{ minHeight: 0, padding: '6px 12px' }} onClick={() => setOpts((a) => [...a, { tr: '', en: '' }])}>+ Şık ekle</button>
            )}
          </div>
        )}

        <button className="btn btn-accent btn-block" disabled={pending || !canCreate}
          onClick={() => start(async () => {
            const res = await createTopic({ question_tr: qtr.trim(), question_en: qen.trim(), category: cat,
              options: multi ? validOpts.map((o) => ({ label_tr: o.tr, label_en: o.en })) : undefined });
            if (res.ok) {
              setMsg({ ok: true, text: 'Oluşturuldu ✓' });
              setQtr(''); setQen(''); setMulti(false); setOpts([{ tr: '', en: '' }, { tr: '', en: '' }]);
            } else {
              setMsg({ ok: false, text: 'Hata: ' + (res.error ?? '') });
            }
          })}>
          {t('createTopic')}
        </button>
        {msg && <p style={{ marginTop: 10, fontSize: 13, color: msg.ok ? 'var(--accent)' : 'var(--coral)' }}>{msg.text}</p>}
      </div>

      {topics.map((tp) => (
        <div className="card" key={tp.id}>
          <div className="serif" style={{ fontSize: 17, marginBottom: 10 }}>
            {tp.is_daily && <span className="mono" style={{ color: 'var(--accent)', marginRight: 8 }}>★</span>}
            {tp.question_tr}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            <button className="btn" style={{ minHeight: 0, padding: '8px 12px' }} disabled={pending || tp.is_daily}
              onClick={() => start(() => { setDaily(tp.id); })}>{t('setDaily')}</button>
            <button className="btn" style={{ minHeight: 0, padding: '8px 12px' }} disabled={pending}
              onClick={() => start(() => { setActive(tp.id, !tp.is_active); })}>{tp.is_active ? t('deactivate') : 'Aktif et'}</button>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', fontSize: 14 }}>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={tp.comments_enabled} disabled={pending}
                onChange={(e) => start(() => { setCommentsEnabled(tp.id, e.target.checked); })} />
              {t('commentsOn')}
            </label>
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer', opacity: tp.comments_enabled ? 1 : 0.4 }}>
              <input type="checkbox" checked={tp.comment_mode === 'auto'} disabled={pending || !tp.comments_enabled}
                onChange={(e) => start(() => { setCommentMode(tp.id, (e.target.checked ? 'auto' : 'manual') as CommentMode); })} />
              {t('commentsAuto')}
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, fontSize: 13 }}>
            <span className="muted">{t('scheduleDaily')}:</span>
            <input type="date" defaultValue={tp.scheduled_daily_date ?? ''} disabled={pending}
              onChange={(e) => start(() => { setScheduledDate(tp.id, e.target.value || null); })}
              style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--surface)',
                border: '1px solid var(--border)', color: 'var(--text)', font: 'inherit' }} />
          </div>
          <EditTopic tp={tp} />
        </div>
      ))}
    </>
  );
}

function EditTopic({ tp }: { tp: Topic }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [qtr, setQtr] = useState(tp.question_tr);
  const [qen, setQen] = useState(tp.question_en);
  const [opts, setOpts] = useState(tp.options ?? []);
  const [newTr, setNewTr] = useState(''); const [newEn, setNewEn] = useState('');

  const inp: React.CSSProperties = { width: '100%', padding: 10, borderRadius: 8, background: 'var(--surface)',
    border: '1px solid var(--border)', color: 'var(--text)', font: 'inherit', marginBottom: 8 };

  return (
    <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
      <button className="btn" style={{ minHeight: 0, padding: '6px 12px' }} onClick={() => setOpen((o) => !o)}>
        {open ? 'Kapat' : 'Düzenle'}
      </button>
      {open && (
        <div style={{ marginTop: 10 }}>
          <textarea style={{ ...inp, minHeight: 50 }} value={qtr} onChange={(e) => setQtr(e.target.value)} />
          <textarea style={{ ...inp, minHeight: 50 }} value={qen} onChange={(e) => setQen(e.target.value)} />
          <button className="btn btn-accent" style={{ minHeight: 0, padding: '8px 12px' }} disabled={pending}
            onClick={() => start(() => { updateTopicText(tp.id, qtr, qen); })}>Soruyu kaydet</button>

          {tp.poll_type === 'multi' && (
            <div style={{ marginTop: 14 }}>
              <div className="kicker">Şıklar</div>
              {opts.map((o) => (
                <div key={o.id} style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0' }}>
                  <input style={{ ...inp, marginBottom: 0 }} defaultValue={o.label_tr}
                    onBlur={(e) => start(() => { updateOption(o.id, e.target.value, o.label_en ?? ''); })} />
                  <button className="btn" style={{ minHeight: 0, padding: '8px 12px' }} disabled={pending}
                    onClick={() => start(async () => { await deleteOption(o.id); setOpts((a) => a.filter((x) => x.id !== o.id)); })}>Sil</button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input style={{ ...inp, marginBottom: 0 }} placeholder="Yeni şık (TR)" value={newTr} onChange={(e) => setNewTr(e.target.value)} />
                <input style={{ ...inp, marginBottom: 0 }} placeholder="(EN)" value={newEn} onChange={(e) => setNewEn(e.target.value)} />
                <button className="btn btn-accent" style={{ minHeight: 0, padding: '8px 12px' }} disabled={pending || !newTr.trim()}
                  onClick={() => start(async () => { await addOption(tp.id, newTr, newEn); setNewTr(''); setNewEn(''); })}>Ekle</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const DIM_LABEL: Record<string, string> = {
  region: 'Bölge', age: 'Yaş', gender: 'Cinsiyet', education: 'Eğitim', employment: 'Çalışma', origin: 'Köken',
};

function ResultsTab({ topics }: { topics: Topic[] }) {
  const { t } = useLang();
  const [topicId, setTopicId] = useState<string>(topics[0]?.id ?? '');
  const [rows, setRows] = useState<BreakdownRow[] | null>(null);
  const [series, setSeries] = useState<TimePoint[] | null>(null);
  const selected = topics.find((tp) => tp.id === topicId);
  const isMulti = selected?.poll_type === 'multi';

  useEffect(() => {
    if (!topicId || isMulti) return;
    setRows(null); setSeries(null);
    getBreakdown(topicId).then(setRows);
    getTimeseries(topicId).then(setSeries);
  }, [topicId, isMulti]);

  function exportCsv() {
    if (!rows) return;
    const head = 'dimension,bucket,agree,disagree\n';
    const body = rows.map((r) => `${r.dimension},${r.bucket},${r.agree},${r.disagree}`).join('\n');
    const blob = new Blob([head + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'bizcesizce-results.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  const dims = ['region', 'age', 'gender', 'education', 'employment', 'origin'];

  return (
    <>
      <select style={inputStyle} value={topicId} onChange={(e) => setTopicId(e.target.value)}>
        {topics.map((tp) => <option key={tp.id} value={tp.id}>{tp.question_tr}</option>)}
      </select>

      {isMulti && <McResults topicId={topicId} />}

      {!isMulti && (rows === null ? <div className="skeleton" style={{ height: 120 }} /> : (
        <>
          <button className="btn" style={{ minHeight: 0, padding: '8px 12px', marginBottom: 12 }} onClick={exportCsv}>
            {t('exportCsv')}
          </button>
          {dims.map((d) => {
            const drows = rows.filter((r) => r.dimension === d);
            if (drows.length === 0) return null;
            return (
              <div className="card" key={d}>
                <div className="kicker">{DIM_LABEL[d] ?? d}</div>
                {drows.map((r) => {
                  const total = r.agree + r.disagree;
                  const pct = total ? Math.round((r.agree / total) * 100) : 0;
                  return (
                    <div key={r.bucket} style={{ margin: '10px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span>{r.bucket}</span>
                        <span className="mono">{pct}% · {total}</span>
                      </div>
                      <div className="bar agree"><span style={{ width: `${pct}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          <div className="card">
            <div className="kicker">{t('overTime')}</div>
            {series && series.length > 0 ? series.map((p) => {
              const total = p.agree + p.disagree;
              return (
                <div key={p.day} className="region-row" style={{ gridTemplateColumns: '110px 1fr 48px' }}>
                  <span className="mono" style={{ fontSize: 12 }}>{p.day}</span>
                  <span className="mini-bar"><span style={{ width: `${Math.min(100, total * 10)}%` }} /></span>
                  <span className="mono" style={{ textAlign: 'right', fontSize: 12 }}>{total}</span>
                </div>
              );
            }) : <p className="muted" style={{ fontSize: 13 }}>—</p>}
          </div>
        </>
      ))}
    </>
  );
}

function McResults({ topicId }: { topicId: string }) {
  const { lang } = useLang();
  const [overall, setOverall] = useState<OptionResult[] | null>(null);
  const [bd, setBd] = useState<OptionBreakdownRow[] | null>(null);

  useEffect(() => {
    setOverall(null); setBd(null);
    getOptionResults(topicId).then(setOverall);
    getOptionBreakdown(topicId).then(setBd);
  }, [topicId]);

  if (overall === null) return <div className="skeleton" style={{ height: 120 }} />;
  const total = overall.reduce((s, o) => s + o.votes, 0);
  const dims = ['region', 'age', 'gender', 'education', 'employment', 'origin'];

  return (
    <>
      <div className="card">
        <div className="kicker">Genel</div>
        {overall.map((o) => {
          const pct = total ? Math.round((o.votes / total) * 100) : 0;
          return (
            <div key={o.option_id} style={{ margin: '10px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>{lang === 'tr' ? o.label_tr : (o.label_en || o.label_tr)}</span>
                <span className="mono">{pct}% · {o.votes}</span>
              </div>
              <div className="bar agree"><span style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
      </div>

      {dims.map((d) => {
        const drows = (bd ?? []).filter((r) => r.dimension === d);
        if (drows.length === 0) return null;
        const buckets = Array.from(new Set(drows.map((r) => r.bucket)));
        return (
          <div className="card" key={d}>
            <div className="kicker">{DIM_LABEL[d] ?? d}</div>
            {buckets.map((b) => {
              const brows = drows.filter((r) => r.bucket === b);
              const bt = brows.reduce((s, r) => s + r.votes, 0);
              return (
                <div key={b} style={{ margin: '8px 0', fontSize: 13 }}>
                  <div style={{ marginBottom: 2 }}>{b}</div>
                  {brows.map((r) => (
                    <div key={r.option_label} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}>
                      <span>· {r.option_label}</span>
                      <span className="mono">{bt ? Math.round((r.votes / bt) * 100) : 0}% · {r.votes}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}

function ModerationTab({ topics }: { topics: Topic[] }) {
  const { t } = useLang();
  const [items, setItems] = useState<PendingComment[] | null>(null);
  const [pending, start] = useTransition();
  const topicMap = new Map(topics.map((tp) => [tp.id, tp.question_tr]));

  useEffect(() => { listPendingComments().then(setItems); }, []);

  function act(id: string, status: 'approved' | 'rejected') {
    start(async () => { await moderateComment(id, status); setItems(await listPendingComments()); });
  }

  if (items === null) return <div className="skeleton" style={{ height: 80 }} />;
  if (items.length === 0) return <p className="muted">{t('noPending')}</p>;

  return (
    <>
      {items.map((c) => (
        <div className="card" key={c.id}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
            {topicMap.get(c.topic_id) ?? ''} · {c.region ?? '—'}
          </div>
          <div style={{ fontSize: 15, marginBottom: 10 }}>{c.body}</div>
          <div className="vote-row">
            <button className="btn btn-accent" disabled={pending} onClick={() => act(c.id, 'approved')}>{t('approve')}</button>
            <button className="btn" disabled={pending} onClick={() => act(c.id, 'rejected')}>{t('reject')}</button>
          </div>
        </div>
      ))}
    </>
  );
}
