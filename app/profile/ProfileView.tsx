'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/LanguageProvider';
import { createClient } from '@/lib/supabase/client';
import { updateProfile, deleteMyAccount, getMyVotes, MyProfile, MyVoteRow } from '@/lib/actions';
import Link from 'next/link';
import { MARITAL_STATUSES, MaritalStatus } from '@/lib/constants';
import { StringKey } from '@/lib/i18n';

export function ProfileView({ profile, email }: { profile: MyProfile; email: string }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const L = (k: StringKey) => t(k);

  const [firstName, setFirstName] = useState(profile.first_name ?? '');
  const [lastName, setLastName] = useState(profile.last_name ?? '');
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [marital, setMarital] = useState<MaritalStatus | ''>((profile.marital_status as MaritalStatus) ?? '');
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [votes, setVotes] = useState<MyVoteRow[] | null>(null);
  useEffect(() => { getMyVotes().then(setVotes); }, []);

  async function removeAccount() {
    setDeleting(true);
    const res = await deleteMyAccount();
    if (res.ok) { router.push('/login'); router.refresh(); }
    else { setDeleting(false); }
  }

  async function save() {
    setState('saving');
    const res = await updateProfile({
      first_name: firstName, last_name: lastName, phone,
      marital_status: marital || null,
    });
    setState(res.ok ? 'saved' : 'error');
    if (res.ok) { router.refresh(); setTimeout(() => setState('idle'), 2500); }
  }

  async function signOut() {
    await createClient().auth.signOut();
    router.push('/login'); router.refresh();
  }

  const initial = (firstName || email || '?').trim().charAt(0).toUpperCase();
  const memberSince = new Date(profile.created_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US',
    { year: 'numeric', month: 'long' });

  const field = { width: '100%', padding: 12, borderRadius: 10, background: 'var(--surface-2)',
    border: '1px solid var(--border)', color: 'var(--text)', font: 'inherit', marginTop: 6 } as const;

  const Locked = ({ label, value }: { label: string; value: string | null }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '11px 0', borderBottom: '1px solid var(--border)', gap: 12 }}>
      <span className="muted" style={{ fontSize: 13 }}>{label}</span>
      <span style={{ fontSize: 14, textAlign: 'right' }}>{value || L('notSet')}</span>
    </div>
  );

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '24px 0 8px' }}>
        <div className="serif" style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent)',
          color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 600 }}>{initial}</div>
        <div>
          <h1 className="serif" style={{ fontSize: 24, margin: 0 }}>
            {[firstName, lastName].filter(Boolean).join(' ') || L('profileTitle')}
          </h1>
          <div className="mono muted" style={{ fontSize: 12 }}>{email}</div>
        </div>
      </div>

      {/* Editable */}
      <div className="kicker" style={{ marginTop: 22 }}>{L('editable')}</div>
      <div className="card" style={{ marginTop: 8 }}>
        <label style={{ fontSize: 13 }} className="muted">{L('firstNamePh')}
          <input style={field} value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={60} />
        </label>
        <label style={{ fontSize: 13, display: 'block', marginTop: 14 }} className="muted">{L('lastNamePh')}
          <input style={field} value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={60} />
        </label>
        <label style={{ fontSize: 13, display: 'block', marginTop: 14 }} className="muted">{L('labPhone')}
          <input style={field} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} />
        </label>
        <label style={{ fontSize: 13, display: 'block', marginTop: 14 }} className="muted">{L('chooseMarital')}
          <select style={field} value={marital} onChange={(e) => setMarital(e.target.value as MaritalStatus | '')}>
            <option value="">{L('notSet')}</option>
            {MARITAL_STATUSES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <button className="btn btn-accent btn-block" style={{ marginTop: 18 }}
          disabled={state === 'saving'} onClick={save}>
          {state === 'saving' ? L('loading') : state === 'saved' ? L('saved') : L('save')}
        </button>
        {state === 'error' && <p className="error" style={{ fontSize: 13, marginTop: 8 }}>{L('errorGeneric')}</p>}
      </div>

      {/* My votes */}
      <div className="kicker" style={{ marginTop: 22 }}>{L('myVotes')}{votes ? ` (${votes.length})` : ''}</div>
      <div className="card" style={{ marginTop: 8, paddingTop: 6, paddingBottom: 6 }}>
        {votes === null ? <div className="skeleton" style={{ height: 40 }} /> :
          votes.length === 0 ? <p className="muted" style={{ fontSize: 13, margin: '8px 0' }}>{L('noVotesYet')}</p> :
          votes.map((v) => (
            <Link key={v.topic_id} href={`/anket/${v.topic_id}`}
              style={{ display: 'block', padding: '10px 0', borderBottom: '1px solid var(--border)',
                textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontSize: 14 }}>{v.question}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>
                <span style={{ color: 'var(--accent)' }}>{v.answer}</span> · {new Date(v.created_at).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US')}
              </div>
            </Link>
          ))}
      </div>

      {/* Locked */}
      <div className="kicker" style={{ marginTop: 22 }}>🔒 {L('lockedHint')}</div>
      <div className="card" style={{ marginTop: 8, paddingTop: 6, paddingBottom: 6 }}>
        <Locked label={L('chooseRegion')} value={profile.region} />
        <Locked label={L('labDob')} value={profile.date_of_birth} />
        <Locked label={L('chooseAge')} value={profile.age_band} />
        <Locked label={L('chooseGender')} value={profile.gender} />
        <Locked label={L('chooseEmployment')} value={profile.employment} />
        <Locked label={L('chooseEducation')} value={profile.education} />
        <Locked label={L('chooseOrigin')} value={profile.origin} />
      </div>

      <div className="footer" style={{ justifyContent: 'space-between' }}>
        <span className="mono">{L('memberSince')}: {memberSince}</span>
        <button className="btn btn-ghost" style={{ padding: '8px 14px', minHeight: 0 }} onClick={signOut}>
          {L('signOut')}
        </button>
      </div>

      {/* Danger zone: permanent self-service deletion (right to erasure) */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        {!confirmDelete ? (
          <button className="btn btn-ghost" style={{ color: 'var(--coral)', fontSize: 13, padding: '8px 14px', minHeight: 0 }}
            onClick={() => setConfirmDelete(true)}>
            {L('deleteAccount')}
          </button>
        ) : (
          <div className="card" style={{ borderColor: 'var(--coral)' }}>
            <p style={{ margin: '0 0 14px', fontSize: 14 }}>{L('deleteConfirm')}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn" disabled={deleting} onClick={() => setConfirmDelete(false)}>{L('cancel')}</button>
              <button className="btn" disabled={deleting}
                style={{ background: 'var(--coral)', color: '#fff', borderColor: 'var(--coral)' }}
                onClick={removeAccount}>
                {deleting ? L('loading') : L('deleteYes')}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
