'use client';
import { useEffect, useState } from 'react';
import { useLang } from './LanguageProvider';
import { getSponsors } from '@/lib/actions';
import { Sponsor, SponsorPlacement } from '@/lib/types';

// A clearly-labelled, direct-sponsor slot. No tracking, no programmatic ads.
export function SponsorSlot({ placement }: { placement: SponsorPlacement }) {
  const { t, lang } = useLang();
  const [sponsor, setSponsor] = useState<Sponsor | null>(null);

  useEffect(() => {
    let alive = true;
    getSponsors(placement).then((list) => {
      if (!alive || list.length === 0) return;
      // Rotate fairly: pick a random active sponsor for this slot.
      setSponsor(list[Math.floor(Math.random() * list.length)]);
    });
    return () => { alive = false; };
  }, [placement]);

  if (!sponsor) return null;
  const label = (lang === 'tr' ? sponsor.label_tr : (sponsor.label_en || sponsor.label_tr));

  return (
    <a href={sponsor.url} target="_blank" rel="noopener noreferrer sponsored"
      style={{ display: 'block', textDecoration: 'none', margin: '16px 0',
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '14px 18px' }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase',
        color: 'var(--muted)', marginBottom: 4 }}>{t('sponsored')}</div>
      <div style={{ color: 'var(--text)', fontSize: 15 }}>{label}</div>
    </a>
  );
}
