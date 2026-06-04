'use client';
import Link from 'next/link';
import { useLang } from './LanguageProvider';
import { SponsorSlot } from './SponsorSlot';

export function Footer() {
  const { t } = useLang();
  return (
    <>
      <SponsorSlot placement="footer" />
      <footer className="footer">
        <Link href="/nasil-calisir">{t('howItWorks')}</Link>
        <Link href="/archive">{t('archive')}</Link>
        <Link href="/advertise">{t('advertise')}</Link>
        <Link href="/privacy">{t('privacy')}</Link>
        <Link href="/terms">{t('terms')}</Link>
        <span className="mono" style={{ marginLeft: 'auto' }}>bizcesizce.com</span>
      </footer>
    </>
  );
}
