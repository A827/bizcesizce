'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/LanguageProvider';
import { createClient } from '@/lib/supabase/client';
import { completeSetup } from '@/lib/actions';
import {
  REGIONS, AGE_BANDS, GENDERS, EDUCATIONS, EMPLOYMENTS, ORIGINS,
  Region, AgeBand, Gender, Education, Employment, Origin,
} from '@/lib/constants';
import { StringKey } from '@/lib/i18n';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    };
  }
}

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
  const [token, setToken] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  // Load + render the Cloudflare Turnstile widget (only if a site key exists).
  useEffect(() => {
    if (!SITE_KEY || renderedRef.current) return;
    function render() {
      if (!widgetRef.current || !window.turnstile || renderedRef.current) return;
      renderedRef.current = true;
      window.turnstile.render(widgetRef.current, {
        sitekey: SITE_KEY,
        theme: 'dark',
        callback: (tok: string) => setToken(tok),
        'expired-callback': () => setToken(null),
        'error-callback': () => setToken(null),
      });
    }
    if (window.turnstile) { render(); return; }
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    s.async = true; s.defer = true;
    s.onload = render;
    document.head.appendChild(s);
  }, []);

  // If a site key is configured, require a completed human check.
  const humanOk = !SITE_KEY || !!token;
  const ready = region && age && gender && education && employment && origin && humanOk && !saving;

  async function save() {
    if (!ready) return;
    setSaving(true); setError(false);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const res = await completeSetup(
      { region: region!, age_band: age!, gender: gender!, education: education!, employment: employment!, origin: origin! },
      token,
    );
    if (!res.ok) {
      setError(true); setSaving(false);
      if (SITE_KEY) { setToken(null); window.turnstile?.reset(); }
      return;
    }
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

      {SITE_KEY && <div ref={widgetRef} style={{ marginBottom: 16, minHeight: 65 }} />}

      {error && <p className="error">{t('errorGeneric')}</p>}

      <button className="btn btn-accent btn-block" disabled={!ready} onClick={save}
        style={{ opacity: ready ? 1 : 0.45, marginTop: 8 }}>
        {saving ? t('loading') : t('start')}
      </button>
    </main>
  );
}
