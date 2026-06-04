'use client';
import { useEffect } from 'react';
import { useLang } from '@/components/LanguageProvider';
import { logError } from '@/lib/actions';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const { t } = useLang();
  useEffect(() => {
    logError({
      message: error.message, stack: error.stack,
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      kind: 'client',
    });
  }, [error]);
  return (
    <main className="shell" style={{ paddingTop: 100, textAlign: 'center' }}>
      <p className="error">{t('errorGeneric')}</p>
      <button className="btn btn-accent" style={{ marginTop: 16 }} onClick={reset}>{t('retry')}</button>
    </main>
  );
}
