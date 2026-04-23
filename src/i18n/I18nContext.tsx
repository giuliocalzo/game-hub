import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Lang } from './types';
import { TRANSLATIONS } from './translations';

const STORAGE_KEY = 'gamehub.lang';

type TFn = (key: string, vars?: Record<string, string | number>) => string;

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TFn;
}

const I18nContext = createContext<I18nValue | null>(null);

const detectInitial = (): Lang => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (saved === 'en' || saved === 'it' || saved === 'de') return saved;
  } catch {
    /* no-op */
  }
  const nav = (typeof navigator !== 'undefined' ? navigator.language : 'en') || 'en';
  if (nav.startsWith('it')) return 'it';
  if (nav.startsWith('de')) return 'de';
  return 'en';
};

const interpolate = (s: string, vars?: Record<string, string | number>): string => {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) =>
    Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : `{${k}}`,
  );
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => detectInitial());

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* no-op */
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = lang;
  }, [lang]);

  const t: TFn = useCallback(
    (key, vars) => {
      const dict = TRANSLATIONS[lang];
      const enDict = TRANSLATIONS.en;
      const raw = dict[key] ?? enDict[key] ?? key;
      return interpolate(raw, vars);
    },
    [lang],
  );

  const value = useMemo<I18nValue>(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useTranslation = (): I18nValue => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider');
  return ctx;
};
