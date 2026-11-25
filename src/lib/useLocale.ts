import { useTranslation } from 'react-i18next';
import type { Lang } from './types';

/** Current language + a helper that prefixes internal paths with the language segment. */
export function useLocale() {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language === 'en' ? 'en' : 'ar') as Lang;
  const to = (path = '') => `/${lang}${path.startsWith('/') || path === '' ? path : '/' + path}`;
  return { t, lang, to, dir: lang === 'ar' ? 'rtl' : 'ltr' };
}
