'use client';
import { useLang } from './LanguageProvider';

export function SuspendedNotice() {
  const { t } = useLang();
  return (
    <div className="card" style={{ textAlign: 'center', marginTop: 40, borderColor: 'var(--coral)' }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>🚫</div>
      <h1 className="serif" style={{ fontSize: 24, margin: '0 0 8px' }}>{t('suspendedTitle')}</h1>
      <p className="muted" style={{ margin: 0 }}>{t('suspendedBlurb')}</p>
    </div>
  );
}
