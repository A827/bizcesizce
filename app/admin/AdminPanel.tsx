'use client';
import { useState, useTransition, useEffect } from 'react';
import { useLang } from '@/components/LanguageProvider';
import { CATEGORIES, Category, CommentMode } from '@/lib/constants';
import { Topic } from '@/lib/types';
import {
  approveSuggestion, rejectSuggestion, createTopic, setDaily, setActive,
  setCommentsEnabled, setCommentMode, setScheduledDate,
  updateTopicText, updateTopicMeta, addOption, updateOption, deleteOption,
  listPendingComments, moderateComment, PendingComment,
  getBreakdown, getTimeseries, BreakdownRow, TimePoint,
  listSponsors, createSponsor, setSponsorActive, deleteSponsor,
  getOptionBreakdown, OptionBreakdownRow,
  getOverview, Overview, listAudit, AuditRow,
  getPeople, PersonRow, setBanned,
  getErrors, clearErrors, AppError,
  getAnnouncementSettings, setAnnouncement,
  deleteTopic, getTopicCounts,
} from '@/lib/admin-actions';
import { getOptionResults } from '@/lib/actions';
import { uploadTopicImage } from '@/lib/upload';
import { Sponsor, SponsorPlacement, OptionResult } from '@/lib/types';

type Suggestion = { id: string; question_tr: string; question_en: string | null };
type Tab = 'overview' | 'suggestions' | 'topics' | 'results' | 'moderation' | 'sponsors' | 'people' | 'errors';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: 12, borderRadius: 10, background: 'var(--surface)',
  border: '1px solid var(--border)', color: 'var(--text)', font: 'inherit', marginBottom: 10,
};

function ImageUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  return (
    <div style={{ marginBottom: 10 }}>
      {value && <img src={value} alt="" style={{ width: '100%', maxHeight: 180, objectFit: 'cover',
        borderRadius: 10, marginBottom: 8 }} />}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="file" accept="image/*" disabled={busy}
          onChange={async (e) => {
            const f = e.target.files?.[0]; if (!f) return;
            setBusy(true); setErr(false);
            const url = await uploadTopicImage(f);
            setBusy(false);
            if (url) onChange(url); else setErr(true);
          }} />
        {busy && <span className="muted" style={{ fontSize: 12 }}>Yükleniyor…</span>}
        {value && !busy && <button className="btn" style={{ minHeight: 0, padding: '4px 10px', fontSize: 12 }}
          onClick={() => onChange('')}>Kaldır</button>}
      </div>
      {err && <p className="error" style={{ fontSize: 12, marginTop: 6 }}>Yükleme başarısız.</p>}
    </div>
  );
}

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
        <TabBtn id="people" label={t('tabPeople')} />
        <TabBtn id="errors" label={t('tabErrors')} />
      </div>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'suggestions' && <SuggestionsTab suggestions={suggestions} />}
      {tab === 'topics' && <TopicsTab topics={topics} />}
      {tab === 'results' && <ResultsTab topics={topics} />}
      {tab === 'moderation' && <ModerationTab topics={topics} />}
      {tab === 'sponsors' && <SponsorsTab />}
      {tab === 'people' && <PeopleTab />}
      {tab === 'errors' && <ErrorsTab />}
    </>
  );
}

function ErrorsTab() {
  const [rows, setRows] = useState<AppError[] | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { getErrors().then(setRows); }, []);
  if (rows === null) return <div className="skeleton" style={{ height: 70, marginTop: 12 }} />;
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0 8px' }}>
        <h2 className="kicker" style={{ margin: 0 }}>{rows.length} hata / errors</h2>
        <span style={{ flex: 1 }} />
        {rows.length > 0 && (
          <button className="btn" style={{ padding: '6px 12px', minHeight: 0 }} disabled={busy}
            onClick={async () => { setBusy(true); await clearErrors(); setRows(await getErrors()); setBusy(false); }}>
            Temizle
          </button>
        )}
      </div>
      {rows.length === 0 ? <p className="muted">Hata kaydı yok 🎉 · No errors logged.</p> :
        rows.map((e) => (
          <div className="card" key={e.id} style={{ padding: 14 }}>
            <div style={{ fontSize: 14, color: 'var(--coral)' }}>{e.message || '—'}</div>
            <div className="mono muted" style={{ fontSize: 11, marginTop: 4 }}>
              {e.kind} · {e.path || '—'} · {new Date(e.created_at).toLocaleString()}
            </div>
            {e.stack && <pre className="mono" style={{ fontSize: 10, color: 'var(--muted)', whiteSpace: 'pre-wrap',
              marginTop: 8, maxHeight: 120, overflow: 'auto' }}>{e.stack}</pre>}
          </div>
        ))}
    </>
  );
}

function PeopleTab() {
  const { t } = useLang();
  const [rows, setRows] = useState<PersonRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState('');
  useEffect(() => { getPeople().then(setRows); }, []);

  async function toggleBan(p: PersonRow) {
    setBusy(p.user_id);
    await setBanned(p.user_id, !p.is_banned);
    setRows(await getPeople());
    setBusy(null);
  }

  function exportCsv() {
    if (!rows) return;
    const cols: (keyof PersonRow)[] = ['first_name', 'last_name', 'date_of_birth', 'region',
      'gender', 'marital_status', 'employment', 'education', 'origin', 'phone', 'created_at'];
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'bizcesizce-people.csv'; link.click();
    URL.revokeObjectURL(url);
  }

  if (rows === null) return <div className="skeleton" style={{ height: 80, marginTop: 12 }} />;

  const bannedCount = rows.filter((r) => r.is_banned).length;
  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? rows.filter((r) => [r.first_name, r.last_name, r.region, r.phone, r.employment]
        .some((v) => (v ?? '').toLowerCase().includes(needle)))
    : rows;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0 8px', flexWrap: 'wrap' }}>
        <h2 className="kicker" style={{ margin: 0 }}>{rows.length} {t('tabPeople')} · {bannedCount} yasaklı</h2>
        <span style={{ flex: 1 }} />
        <button className="btn" style={{ padding: '8px 14px', minHeight: 0 }}
          disabled={!rows.length} onClick={exportCsv}>{t('exportCsv')}</button>
      </div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara: ad, bölge, telefon…"
        style={{ ...inputStyle, marginBottom: 8 }} />
      <p className="muted" style={{ fontSize: 12, marginBottom: 12 }}>
        Yalnızca sen görebilirsin · Visible to admins only.
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--muted)' }}>
              {['Durum', 'Ad', 'Soyad', 'Doğum', 'Bölge', 'Cinsiyet', 'Medeni', 'İş', 'Eğitim', 'Köken', 'Telefon', ''].map((h, i) => (
                <th key={i} style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.user_id} style={{ opacity: r.is_banned ? 0.55 : 1 }}>
                <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                  {r.is_admin
                    ? <span style={{ color: 'var(--accent)' }}>admin</span>
                    : r.is_banned
                      ? <span style={{ color: 'var(--coral)' }}>● {t('banned')}</span>
                      : <span className="muted">{t('active')}</span>}
                </td>
                {[r.first_name, r.last_name, r.date_of_birth, r.region, r.gender,
                  r.marital_status, r.employment, r.education, r.origin, r.phone].map((v, j) => (
                  <td key={j} style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                    {v ?? '—'}
                  </td>
                ))}
                <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                  {!r.is_admin && (
                    <button className="btn" style={{ padding: '4px 10px', minHeight: 0, fontSize: 12,
                      borderColor: r.is_banned ? 'var(--border)' : 'var(--coral)',
                      color: r.is_banned ? 'var(--text)' : 'var(--coral)' }}
                      disabled={busy === r.user_id} onClick={() => toggleBan(r)}>
                      {busy === r.user_id ? '…' : r.is_banned ? t('unban') : t('ban')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
            <div className="mono muted" style={{ fontSize: 12, marginBottom: 6 }}>{s.placement} · {s.url}</div>
            <div className="mono" style={{ fontSize: 12, marginBottom: 10 }}>
              👁 {s.impressions ?? 0} gösterim · 🖱 {s.clicks ?? 0} tıklama
              {s.impressions ? ` · CTR ${((100 * (s.clicks ?? 0)) / s.impressions).toFixed(1)}%` : ''}
            </div>
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
      <AnnouncementEditor />

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

function AnnouncementEditor() {
  const [tr, setTr] = useState(''); const [en, setEn] = useState('');
  const [active, setActive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    getAnnouncementSettings().then((s) => {
      if (s) { setTr(s.announcement_tr ?? ''); setEn(s.announcement_en ?? ''); setActive(s.announcement_active); }
      setLoaded(true);
    });
  }, []);
  if (!loaded) return <div className="skeleton" style={{ height: 60, marginBottom: 16 }} />;
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 className="kicker">Duyuru bandı · Announcement</h2>
      <div className="card">
        <input style={inputStyle} placeholder="Duyuru (TR)" value={tr} onChange={(e) => setTr(e.target.value)} />
        <input style={inputStyle} placeholder="Announcement (EN)" value={en} onChange={(e) => setEn(e.target.value)} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0 12px', fontSize: 14 }}>
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Yayında (tüm kullanıcılara göster)
        </label>
        <button className="btn btn-accent btn-block" disabled={pending}
          onClick={() => start(async () => { await setAnnouncement({ tr, en, active }); setSaved(true); setTimeout(() => setSaved(false), 2500); })}>
          {pending ? '…' : saved ? 'Kaydedildi ✓' : 'Kaydet'}
        </button>
      </div>
    </div>
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
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  useEffect(() => { getTopicCounts().then(setCounts); }, []);
  const [qtr, setQtr] = useState(''); const [qen, setQen] = useState(''); const [cat, setCat] = useState<Category>('Other');
  const [img, setImg] = useState(''); const [dtr, setDtr] = useState(''); const [den, setDen] = useState(''); const [src, setSrc] = useState('');
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

        <div className="kicker" style={{ marginTop: 4 }}>Görsel (isteğe bağlı)</div>
        <ImageUploader value={img} onChange={setImg} />
        <textarea style={{ ...inputStyle, minHeight: 50 }} placeholder="Açıklama / bağlam (TR) — isteğe bağlı" value={dtr} onChange={(e) => setDtr(e.target.value)} />
        <textarea style={{ ...inputStyle, minHeight: 50 }} placeholder="Description / context (EN) — optional" value={den} onChange={(e) => setDen(e.target.value)} />
        <input style={inputStyle} placeholder="Kaynak bağlantısı (https://…) — isteğe bağlı" value={src} onChange={(e) => setSrc(e.target.value)} />

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
              image_url: img, description_tr: dtr, description_en: den, source_url: src,
              options: multi ? validOpts.map((o) => ({ label_tr: o.tr, label_en: o.en })) : undefined });
            if (res.ok) {
              setMsg({ ok: true, text: 'Oluşturuldu ✓' });
              setQtr(''); setQen(''); setMulti(false); setOpts([{ tr: '', en: '' }, { tr: '', en: '' }]);
              setImg(''); setDtr(''); setDen(''); setSrc('');
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
          <div className="serif" style={{ fontSize: 17, marginBottom: 4 }}>
            {tp.is_daily && <span className="mono" style={{ color: 'var(--accent)', marginRight: 8 }}>★</span>}
            {tp.question_tr}
          </div>
          <div className="mono muted" style={{ fontSize: 11, marginBottom: 10 }}>
            {(counts[tp.id] ?? 0)} oy · {tp.is_active ? 'aktif' : 'gizli'}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            <button className="btn" style={{ minHeight: 0, padding: '8px 12px' }} disabled={pending || tp.is_daily}
              onClick={() => start(() => { setDaily(tp.id); })}>{t('setDaily')}</button>
            <button className="btn" style={{ minHeight: 0, padding: '8px 12px' }} disabled={pending}
              onClick={() => start(() => { setActive(tp.id, !tp.is_active); })}>{tp.is_active ? t('deactivate') : 'Aktif et'}</button>
            {confirmDel === tp.id ? (
              <button className="btn" style={{ minHeight: 0, padding: '8px 12px', background: 'var(--coral)', color: '#fff', borderColor: 'var(--coral)' }}
                disabled={pending} onClick={() => start(async () => { await deleteTopic(tp.id); setConfirmDel(null); })}>
                Kalıcı sil — emin misin?
              </button>
            ) : (
              <button className="btn" style={{ minHeight: 0, padding: '8px 12px', color: 'var(--coral)', borderColor: 'var(--coral)' }}
                disabled={pending} onClick={() => setConfirmDel(tp.id)}>Sil</button>
            )}
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
  const [img, setImg] = useState(tp.image_url ?? '');
  const [dtr, setDtr] = useState(tp.description_tr ?? '');
  const [den, setDen] = useState(tp.description_en ?? '');
  const [src, setSrc] = useState(tp.source_url ?? '');
  const [metaSaved, setMetaSaved] = useState(false);

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

          <div style={{ marginTop: 14 }}>
            <div className="kicker">Görsel · açıklama · kaynak</div>
            <ImageUploader value={img} onChange={setImg} />
            <textarea style={{ ...inp, minHeight: 50 }} placeholder="Açıklama (TR)" value={dtr} onChange={(e) => setDtr(e.target.value)} />
            <textarea style={{ ...inp, minHeight: 50 }} placeholder="Description (EN)" value={den} onChange={(e) => setDen(e.target.value)} />
            <input style={inp} placeholder="Kaynak bağlantısı (https://…)" value={src} onChange={(e) => setSrc(e.target.value)} />
            <button className="btn btn-accent" style={{ minHeight: 0, padding: '8px 12px' }} disabled={pending}
              onClick={() => start(async () => { await updateTopicMeta(tp.id, { image_url: img, description_tr: dtr, description_en: den, source_url: src }); setMetaSaved(true); setTimeout(() => setMetaSaved(false), 2500); })}>
              {metaSaved ? 'Kaydedildi ✓' : 'Görsel/açıklamayı kaydet'}
            </button>
          </div>

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
