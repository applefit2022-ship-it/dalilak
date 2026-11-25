import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './ar';
import en from './en';
import type { Lang } from '../lib/types';

export const LANGS: Lang[] = ['ar', 'en'];
export const isLang = (v: string | undefined): v is Lang => v === 'ar' || v === 'en';

export function storedLang(): Lang {
  try {
    const v = localStorage.getItem('dalilak.lang');
    if (isLang(v || undefined)) return v as Lang;
  } catch { /* ignore */ }
  return 'ar';
}

i18n.use(initReactI18next).init({
  resources: { ar: { translation: ar }, en: { translation: en } },
  lng: storedLang(),
  fallbackLng: 'ar',
  interpolation: { escapeValue: false },
  returnObjects: true,
});

/** Applies lang + dir to <html> and persists the choice. */
export function applyLang(lang: Lang) {
  if (i18n.language !== lang) i18n.changeLanguage(lang);
  const el = document.documentElement;
  el.lang = lang;
  el.dir = lang === 'ar' ? 'rtl' : 'ltr';
  try { localStorage.setItem('dalilak.lang', lang); } catch { /* ignore */ }
}

export default i18n;
