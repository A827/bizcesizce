'use client';
import { useLang } from '@/components/LanguageProvider';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const { t } = useLang();
  return (
    <main className="shell" style={{ paddingTop: 100, textAlign: 'center' }}>
      <p className="error">{t('errorGeneric')}</p>
      <button className="btn btn-accent" style={{ marginTop: 16 }} onClick={reset}>{t('retry')}</button>
    </main>
  );
}
