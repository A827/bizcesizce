'use client';
import { useLang } from './LanguageProvider';
export function SuggestLabel() {
  const { t } = useLang();
  return <>{t('suggestCta')}</>;
}
