'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useLang } from './LanguageProvider';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const { t, lang, setLang } = useLang();
  const [menu, setMenu] = useState(false);

  const navLinks = (
    <>
      <Link href="/" onClick={() => setMenu(false)}>{t('navHome')}</Link>
      <Link href="/nasil-calisir" onClick={() => setMenu(false)}>{t('howItWorks')}</Link>
      <Link href="/archive" onClick={() => setMenu(false)}>{t('archive')}</Link>
      <Link href="/profile" onClick={() => setMenu(false)}>{t('profileLink')}</Link>
    </>
  );

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo-block" aria-label="Bizce sizce">
          <span className="logo">Bizce<b>sizce</b></span>
          <span className="logo-tag">{t('headerTag')}</span>
        </Link>

        <nav className="header-nav">{navLinks}</nav>

        <div className="header-actions">
          <ThemeToggle />
          <button className="icon-btn" onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')} aria-label="Change language">
            <span className="mono">{lang === 'tr' ? 'EN' : 'TR'}</span>
          </button>
          <button className="icon-btn menu-btn" onClick={() => setMenu((m) => !m)}
            aria-label="Menu" aria-expanded={menu}>☰</button>
        </div>

        <div className={`menu-panel${menu ? ' open' : ''}`}>{navLinks}</div>
      </div>
    </header>
  );
}
