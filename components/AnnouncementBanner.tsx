'use client';
import { useEffect, useState } from 'react';
import { useLang } from './LanguageProvider';
import { getAnnouncement, Announcement } from '@/lib/actions';

export function AnnouncementBanner() {
  const { lang } = useLang();
  const [a, setA] = useState<Announcement>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => { getAnnouncement().then(setA); }, []);
  if (!a || dismissed) return null;
  const text = (lang === 'tr' ? a.tr : (a.en || a.tr));
  if (!text) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0',
      background: 'var(--accent)', color: 'var(--accent-ink)', borderRadius: 'var(--radius)',
      padding: '12px 16px', fontSize: 14, fontWeight: 500 }}>
      <span style={{ flex: 1 }}>{text}</span>
      <button onClick={() => setDismissed(true)} aria-label="Kapat"
        style={{ background: 'transparent', border: 'none', color: 'var(--accent-ink)', cursor: 'pointer',
          fontSize: 18, lineHeight: 1, padding: 4 }}>×</button>
    </div>
  );
}
