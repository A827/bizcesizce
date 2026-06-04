'use client';
import { useEffect } from 'react';
import { logError } from '@/lib/actions';

// Catches errors in the root layout itself. Must render its own <html>/<body>.
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    logError({
      message: error.message, stack: error.stack,
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      kind: 'client',
    });
  }, [error]);
  return (
    <html lang="tr">
      <body style={{ background: '#0d0d0f', color: '#f4f1e9', fontFamily: 'system-ui, sans-serif',
        display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div>
          <p style={{ color: '#ff5d52' }}>Bir şeyler ters gitti. · Something went wrong.</p>
          <button onClick={reset} style={{ marginTop: 16, padding: '12px 18px', borderRadius: 999,
            background: '#e8c547', color: '#1a1500', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Tekrar dene · Retry
          </button>
        </div>
      </body>
    </html>
  );
}
