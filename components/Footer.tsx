'use client';
import Link from 'next/link';
import { useLang } from './LanguageProvider';

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="footer">
      <Link href="/privacy">{t('privacy')}</Link>
      <Link href="/terms">{t('terms')}</Link>
      <span className="mono" style={{ marginLeft: 'auto' }}>bizcesizce.com</span>
    </footer>
  );
}
