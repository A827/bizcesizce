'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/LanguageProvider';
import { createClient } from '@/lib/supabase/client';
import { completeSetup } from '@/lib/actions';
import {
  REGIONS, GENDERS, EDUCATIONS, EMPLOYMENTS, ORIGINS, MARITAL_STATUSES, ageBandFromDob,
  Region, Gender, Education, Employment, Origin, MaritalStatus,
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

type Answers = {
  first_name: string; last_name: string; date_of_birth: string;
  region: Region | null; gender: Gender | null;
  marital_status: MaritalStatus | null; employment: Employment | null;
  education: Education | null; origin: Origin | null; phone: string;
};

const EMPTY: Answers = {
  first_name: '', last_name: '', date_of_birth: '',
  region: null, gender: null, marital_status: null,
  employment: null, education: null, origin: null, phone: '',
};

type Step =
  | { kind: 'welcome' }
  | { kind: 'text'; field: 'first_name' | 'last_name' | 'phone'; q: StringKey; sub?: StringKey; ph: StringKey; required?: boolean }
  | { kind: 'date'; q: StringKey; sub: StringKey }
  | { kind: 'choice'; field: 'region' | 'gender' | 'marital_status' | 'employment' | 'education' | 'origin'; q: StringKey; options: readonly string[]; required?: boolean }
  | { kind: 'finish' }
  | { kind: 'done' };

const STEPS: Step[] = [
  { kind: 'welcome' },
  { kind: 'text', field: 'first_name', q: 'askFirstName', sub: 'askFirstNameSub', ph: 'firstNamePh' },
  { kind: 'text', field: 'last_name', q: 'askLastName', sub: 'askLastNameSub', ph: 'lastNamePh' },
  { kind: 'date', q: 'askDob', sub: 'askDobSub' },
  { kind: 'choice', field: 'region', q: 'askRegionQ', options: REGIONS, required: true },
  { kind: 'choice', field: 'gender', q: 'askSexQ', options: GENDERS, required: true },
  { kind: 'choice', field: 'marital_status', q: 'askMaritalQ', options: MARITAL_STATUSES },
  { kind: 'choice', field: 'employment', q: 'askJobQ', options: EMPLOYMENTS },
  { kind: 'choice', field: 'education', q: 'askEducationQ', options: EDUCATIONS },
  { kind: 'choice', field: 'origin', q: 'askOriginQ', options: ORIGINS },
  { kind: 'text', field: 'phone', q: 'askPhoneQ', sub: 'askPhoneSub', ph: 'phonePh' },
  { kind: 'finish' },
  { kind: 'done' },
];

export function SetupForm() {
  const { t } = useLang();
  const router = useRouter();
  const L = (k: StringKey) => t(k);

  const [a, setA] = useState<Answers>(EMPTY);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<StringKey | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  const step = STEPS[i];
  // progress across the middle steps (exclude welcome + done)
  const progress = Math.round((Math.min(i, STEPS.length - 2) / (STEPS.length - 2)) * 100);

  function go(n: number, d: 'fwd' | 'back') { setError(null); setDir(d); setI(n); }
  const next = () => go(Math.min(i + 1, STEPS.length - 1), 'fwd');
  const back = () => go(Math.max(i - 1, 0), 'back');

  // Render Turnstile when we reach the finish step (only if a site key exists).
  useEffect(() => {
    if (step.kind !== 'finish' || !SITE_KEY || renderedRef.current) return;
    function render() {
      if (!widgetRef.current || !window.turnstile || renderedRef.current) return;
      renderedRef.current = true;
      window.turnstile.render(widgetRef.current, {
        sitekey: SITE_KEY, theme: 'dark',
        callback: (tok: string) => setToken(tok),
        'expired-callback': () => setToken(null),
        'error-callback': () => setToken(null),
      });
    }
    if (window.turnstile) { render(); return; }
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    s.async = true; s.defer = true; s.onload = render;
    document.head.appendChild(s);
  }, [step.kind]);

  function setField<K extends keyof Answers>(k: K, v: Answers[K]) { setA((p) => ({ ...p, [k]: v })); }

  // Choice steps auto-advance for a snappy quiz feel.
  function pickChoice(field: keyof Answers, value: string) {
    setField(field, value as Answers[keyof Answers]);
    setTimeout(() => go(Math.min(i + 1, STEPS.length - 1), 'fwd'), 240);
  }

  function nextFromText(field: 'first_name' | 'last_name' | 'phone', required?: boolean) {
    if (required && !a[field].trim()) { setError('required'); return; }
    next();
  }

  function nextFromDate() {
    if (!a.date_of_birth) { setError('required'); return; }
    if (!ageBandFromDob(a.date_of_birth)) { setError('tooYoung'); return; }
    next();
  }

  function nextFromChoice(field: keyof Answers, required?: boolean) {
    if (required && !a[field]) { setError('required'); return; }
    next();
  }

  async function save() {
    if (saving) return;
    if (!a.region || !a.gender || !a.date_of_birth) { setError('required'); return; }
    setSaving(true); setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const res = await completeSetup({
      region: a.region, gender: a.gender, date_of_birth: a.date_of_birth,
      first_name: a.first_name, last_name: a.last_name,
      marital_status: a.marital_status, employment: a.employment,
      education: a.education, origin: a.origin, phone: a.phone,
    }, token);

    if (!res.ok) {
      setError(res.reason === 'too_young' ? 'tooYoung' : 'errorGeneric');
      setSaving(false);
      if (SITE_KEY) { setToken(null); window.turnstile?.reset(); }
      return;
    }
    go(STEPS.length - 1, 'fwd'); // -> done
  }

  const animClass = dir === 'fwd' ? 'wiz-anim-fwd' : 'wiz-anim-back';
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="wiz">
      {step.kind !== 'done' && (
        <div className="wiz-progress" aria-hidden><span style={{ width: `${progress}%` }} /></div>
      )}

      <div className={`wiz-step ${animClass}`} key={i}>
        {step.kind === 'welcome' && (
          <>
            <div className="wiz-emoji pop">👋</div>
            <h1 className="wiz-q">{L('welcomeTitle')}</h1>
            <p className="wiz-sub">{L('welcomeBlurb')}</p>
            <button className="btn btn-accent btn-block" onClick={next}>{L('letsGo')}</button>
          </>
        )}

        {step.kind === 'text' && (
          <>
            <h1 className="wiz-q">{L(step.q)}</h1>
            {step.sub && <p className="wiz-sub">{L(step.sub)}</p>}
            <input
              className="wiz-input" autoFocus
              type={step.field === 'phone' ? 'tel' : 'text'}
              value={a[step.field]} placeholder={L(step.ph)}
              onChange={(e) => setField(step.field, e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') nextFromText(step.field, step.required); }}
            />
            {error && <p className="error" style={{ marginTop: 10 }}>{L(error)}</p>}
            <div className="wiz-nav">
              <button className="wiz-back" onClick={back}>{L('back')}</button>
              <span className="spacer" />
              {!step.required && <button className="wiz-back" onClick={next}>{L('skip')}</button>}
              <button className="btn btn-accent" onClick={() => nextFromText(step.field, step.required)}>{L('next')}</button>
            </div>
          </>
        )}

        {step.kind === 'date' && (
          <>
            <h1 className="wiz-q">{L(step.q)}</h1>
            <p className="wiz-sub">{L(step.sub)}</p>
            <input
              className="wiz-input" type="date" max={today} value={a.date_of_birth}
              onChange={(e) => setField('date_of_birth', e.target.value)}
            />
            {error && <p className="error" style={{ marginTop: 10 }}>{L(error)}</p>}
            <div className="wiz-nav">
              <button className="wiz-back" onClick={back}>{L('back')}</button>
              <span className="spacer" />
              <button className="btn btn-accent" onClick={nextFromDate}>{L('next')}</button>
            </div>
          </>
        )}

        {step.kind === 'choice' && (
          <>
            <h1 className="wiz-q">{L(step.q)}</h1>
            <div className="wiz-opts">
              {step.options.map((o) => (
                <button key={o} className="wiz-opt" aria-pressed={a[step.field] === o}
                  onClick={() => pickChoice(step.field, o)}>
                  {o}
                </button>
              ))}
            </div>
            {error && <p className="error" style={{ marginTop: 10 }}>{L(error)}</p>}
            <div className="wiz-nav">
              <button className="wiz-back" onClick={back}>{L('back')}</button>
              <span className="spacer" />
              {!step.required && <button className="wiz-back" onClick={next}>{L('skip')}</button>}
              <button className="btn btn-accent" onClick={() => nextFromChoice(step.field, step.required)}>{L('next')}</button>
            </div>
          </>
        )}

        {step.kind === 'finish' && (
          <>
            <div className="wiz-emoji pop">✅</div>
            <h1 className="wiz-q">{L('almostThere')}</h1>
            {SITE_KEY && <div ref={widgetRef} style={{ margin: '16px 0', minHeight: 65 }} />}
            {error && <p className="error">{L(error)}</p>}
            <div className="wiz-nav">
              <button className="wiz-back" onClick={back}>{L('back')}</button>
              <span className="spacer" />
              <button className="btn btn-accent btn-block" style={{ flex: 2 }}
                disabled={saving || (!!SITE_KEY && !token)}
                onClick={save}>
                {saving ? L('loading') : L('finishSetup')}
              </button>
            </div>
            <p className="muted" style={{ fontSize: 12, marginTop: 14, textAlign: 'center' }}>
              {L('consentLine')}{' '}
              <a href="/privacy" target="_blank">{L('privacy')}</a> · <a href="/terms" target="_blank">{L('terms')}</a>
            </p>
          </>
        )}

        {step.kind === 'done' && (
          <div className="center">
            <div className="wiz-emoji pop">🎉</div>
            <h1 className="wiz-q">{L('doneTitle')}</h1>
            <p className="wiz-sub">{L('doneBlurb')}</p>
            <button className="btn btn-accent btn-block"
              onClick={() => { router.push('/'); router.refresh(); }}>
              {L('goVote')}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
