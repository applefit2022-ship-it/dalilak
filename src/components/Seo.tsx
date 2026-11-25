import { useEffect } from 'react';
import { config } from '../lib/config';
import { useLocale } from '../lib/useLocale';

interface Props {
  title: string;
  description: string;
  /** path without the language prefix, e.g. "/services/passport-new" */
  path: string;
  jsonLd?: object | object[];
  noindex?: boolean;
}

function setMeta(sel: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(sel);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content);
}
function setLink(rel: string, href: string, hreflang?: string) {
  const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector<HTMLLinkElement>(sel);
  if (!el) { el = document.createElement('link'); el.rel = rel; if (hreflang) el.hreflang = hreflang; document.head.appendChild(el); }
  el.href = href;
}

/** Per-page title / description / canonical / hreflang / Open Graph / JSON-LD (client side;
 *  the same tags are baked into static HTML for public routes by scripts/postbuild.mjs). */
export default function Seo({ title, description, path, jsonLd, noindex }: Props) {
  const { lang } = useLocale();
  useEffect(() => {
    const origin = window.location.origin + config.base.replace(/\/$/, '');
    const url = (l: string) => `${origin}/${l}${path === '/' ? '' : path}`;
    const full = title.includes('Dalilak') || title.includes('دليلك') ? title : `${title} | ${lang === 'ar' ? 'دليلك' : 'Dalilak'}`;
    document.title = full;
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow');
    setMeta('meta[property="og:title"]', 'property', 'og:title', full);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    setMeta('meta[property="og:url"]', 'property', 'og:url', url(lang));
    setMeta('meta[property="og:locale"]', 'property', 'og:locale', lang === 'ar' ? 'ar_EG' : 'en_US');
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary');
    setLink('canonical', url(lang));
    setLink('alternate', url('ar'), 'ar');
    setLink('alternate', url('en'), 'en');
    setLink('alternate', url('ar'), 'x-default');

    const old = document.getElementById('ld-json');
    old?.remove();
    if (jsonLd) {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.id = 'ld-json';
      s.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(s);
    }
    return () => { document.getElementById('ld-json')?.remove(); };
  }, [title, description, path, lang, noindex, jsonLd]);
  return null;
}
