'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/LanguageProvider';
import { createClient } from '@/lib/supabase/client';
import { REGIONS, AGE_BANDS, Region, AgeBand } from '@/lib/constants';

export function SetupForm() {
  const { t } = useLang();
  const router = useRouter();
  const [region, setRegion] = useState<Region | null>(null);
  const [age, setAge] = useState<AgeBand | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const ready = region && age && !saving;

  async function save() {
    if (!ready) return;
    setSaving(true); setError(false);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { error } = await supabase.from('profiles')
      .update({ region, age_band: age }).eq('user_id', user.id);
    if (error) { setError(true); setSaving(false); return; }
    router.push('/');
    router.refresh();
  }

  return (
    <main className="shell" style={{ maxWidth: 480, paddingTop: 40 }}>
      <h1 className="serif" style={{ fontSize: 28, marginBottom: 6 }}>{t('setupTitle')}</h1>
      <p className="muted" style={{ marginBottom: 28 }}>{t('setupBlurb')}</p>

      <div className="kicker">{t('chooseRegion')}</div>
      <div className="chips" style={{ marginBottom: 28 }}>
        {REGIONS.map((r) => (
          <button key={r} className="chip" aria-pressed={region === r} onClick={() => setRegion(r)}>{r}</button>
        ))}
      </div>

      <div className="kicker">{t('chooseAge')}</div>
      <div className="chips" style={{ marginBottom: 32 }}>
        {AGE_BANDS.map((a) => (
          <button key={a} className="chip mono" aria-pressed={age === a} onClick={() => setAge(a)}>{a}</button>
        ))}
      </div>

      {error && <p className="error">{t('errorGeneric')}</p>}

      <button className="btn btn-accent btn-block" disabled={!ready} onClick={save}
        style={{ opacity: ready ? 1 : 0.45 }}>
        {saving ? t('loading') : t('start')}
      </button>
    </main>
  );
}
