'use client';
// Holds the current language (TR default) and remembers the choice.
import { createContext, useContext, useEffect, useState } from 'react';
import { Lang, StringKey, t as translate } from '@/lib/i18n';

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: StringKey) => string };
const LanguageContext = createContext<Ctx>({ lang: 'tr', setLang: () => {}, t: (k) => translate(k, 'tr') });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('tr');

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && window.localStorage.getItem('lang')) as Lang | null;
    if (saved === 'tr' || saved === 'en') setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { window.localStorage.setItem('lang', l); } catch {}
    document.documentElement.lang = l;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: (k) => translate(k, lang) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
