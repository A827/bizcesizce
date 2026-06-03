'use client';
import { useLang } from './LanguageProvider';

export function ArchiveHeading() {
  const { t } = useLang();
  return <h1 className="serif" style={{ fontSize: 30, margin: '8px 0 4px' }}>{t('archive')}</h1>;
}
