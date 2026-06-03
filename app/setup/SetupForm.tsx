'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/LanguageProvider';
import { createClient } from '@/lib/supabase/client';
import {
  REGIONS, AGE_BANDS, GENDERS, EDUCATIONS, EMPLOYMENTS, ORIGINS,
  Region, AgeBand, Gender, Education, Employment, Origin,
} from '@/lib/constants';
import { StringKey } from '@/lib/i18n';

function ChipGroup<T extends string>({
  label, options, value, onPick, mono = false,
}: { label: string; options: readonly T[]; value: T | null; onPick: (v: T) => void; mono?: boolean }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div className="kicker">{label}</div>
      <div className="chips">
        {options.map((o) => (
          <button key={o} className={`chip${mono ? ' mono' : ''}`} aria-pressed={value === o} onClick={() => onPick(o)}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SetupForm() {
  const { t } = useLang();
  const router = useRouter();
  const [region, setRegion] = useState<Region | null>(null);
  const [age, setAge] = useState<AgeBand | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [education, setEducation] = useState<Education | null>(null);
  const [employment, setEmployment] = useState<Employment | null>(null);
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const ready = region && age && gender && education && employment && origin && !saving;

  async function save() {
    if (!ready) return;
    setSaving(true); setError(false);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    const { error } = await supabase.from('profiles').update({
      region, age_band: age, gender, education, employment, origin,
    }).eq('user_id', user.id);
    if (error) { setError(true); setSaving(false); return; }
    router.push('/');
    router.refresh();
  }

  const L = (k: StringKey) => t(k);

  return (
    <main className="shell" style={{ maxWidth: 480, paddingTop: 40 }}>
      <h1 className="serif" style={{ fontSize: 28, marginBottom: 6 }}>{t('setupTitle')}</h1>
      <p className="muted" style={{ marginBottom: 28 }}>{t('setupBlurb')}</p>

      <ChipGroup label={L('chooseRegion')} options={REGIONS} value={region} onPick={setRegion} />
      <ChipGroup label={L('chooseAge')} options={AGE_BANDS} value={age} onPick={setAge} mono />
      <ChipGroup label={L('chooseGender')} options={GENDERS} value={gender} onPick={setGender} />
      <ChipGroup label={L('chooseEducation')} options={EDUCATIONS} value={education} onPick={setEducation} />
      <ChipGroup label={L('chooseEmployment')} options={EMPLOYMENTS} value={employment} onPick={setEmployment} />
      <ChipGroup label={L('chooseOrigin')} options={ORIGINS} value={origin} onPick={setOrigin} />

      {error && <p className="error">{t('errorGeneric')}</p>}

      <button className="btn btn-accent btn-block" disabled={!ready} onClick={save}
        style={{ opacity: ready ? 1 : 0.45, marginTop: 8 }}>
        {saving ? t('loading') : t('start')}
      </button>
    </main>
  );
}
