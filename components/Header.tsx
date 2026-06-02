'use client';
import Link from 'next/link';
import { useLang } from './LanguageProvider';

export function Header() {
  const { lang, setLang } = useLang();
  return (
    <header className="header">
      <Link href="/" className="logo">Bizce<b>sizce</b></Link>
      <button
        className="btn btn-ghost"
        style={{ padding: '8px 14px', minHeight: 0 }}
        onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
        aria-label="Change language"
      >
        <span className="mono">{lang === 'tr' ? 'EN' : 'TR'}</span>
      </button>
    </header>
  );
}
