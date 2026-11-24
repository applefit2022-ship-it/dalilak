// Static generation for public routes (GitHub Pages friendly).
// For every public route in both languages we write dist/<lang>/<route>/index.html containing the built SPA shell,
// per-page <title>/description/canonical/hreflang/Open Graph, JSON-LD (HowTo + FAQ) and crawlable body text.
// The SPA then takes over on load. Also writes 404.html (SPA fallback), sitemap.xml and robots.txt.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const base = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');
const site = (process.env.SITE_URL || `http://localhost:4173${base}`).replace(/\/?$/, '/');
const seed = JSON.parse(readFileSync('src/data/seed.json', 'utf8'));
const shell = readFileSync(join(dist, 'index.html'), 'utf8');
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const T = {
  ar: { brand: 'دليلك', home: 'دليلك الحكومي – دليل الخدمات الحكومية المصرية', homeDesc: 'المستندات والخطوات والرسوم والروابط الرسمية للخدمات الحكومية المصرية.', services: 'كل الخدمات', servicesDesc: 'ابحث في الخدمات الحكومية المصرية: المستندات المطلوبة والخطوات والرسوم.', disc: 'موقع إرشادي وليس موقعًا حكوميًا. تأكد من الجهة الرسمية.', docs: 'المستندات المطلوبة', steps: 'الخطوات', fees: 'الرسوم', dur: 'المدة', loc: 'مكان التقديم', cat: 'الخدمات في قسم', about: 'عن دليلك', privacy: 'سياسة الخصوصية', terms: 'الشروط وإخلاء المسؤولية', contact: 'تواصل معنا' },
  en: { brand: 'Dalilak', home: 'Dalilak – Egyptian Government Services Guide', homeDesc: 'Documents, steps, fees and official links for Egyptian government services.', services: 'All services', servicesDesc: 'Search Egyptian government services: required documents, steps and fees.', disc: 'Informational guide, not a government website. Confirm with the official source.', docs: 'Required documents', steps: 'Steps', fees: 'Fees', dur: 'Duration', loc: 'Where to apply', cat: 'Services in', about: 'About Dalilak', privacy: 'Privacy Policy', terms: 'Terms & Disclaimer', contact: 'Contact' },
};
const pages = []; // {lang, path, title, desc, body, ld}
for (const lang of ['ar', 'en']) {
  const t = T[lang], k = (o, f) => o[`${f}_${lang}`];
  pages.push({ lang, path: '', title: t.home, desc: t.homeDesc, body: `<h1>${esc(t.home)}</h1><p>${esc(t.homeDesc)}</p>` });
  pages.push({ lang, path: 'services', title: `${t.services} | ${t.brand}`, desc: t.servicesDesc, body: `<h1>${esc(t.services)}</h1><ul>${seed.services.map((s) => `<li><a href="${base}${lang}/services/${s.slug}">${esc(k(s, 'title'))}</a></li>`).join('')}</ul>` });
  for (const [p, key] of [['about', 'about'], ['privacy', 'privacy'], ['terms', 'terms'], ['contact', 'contact']])
    pages.push({ lang, path: p, title: `${t[key]} | ${t.brand}`, desc: t[key], body: `<h1>${esc(t[key])}</h1>` });
  for (const c of seed.categories) {
    const list = seed.services.filter((s) => s.category === c.slug);
    pages.push({ lang, path: `category/${c.slug}`, title: `${t.cat} ${k(c, 'title')} | ${t.brand}`, desc: k(c, 'desc'),
      body: `<h1>${esc(k(c, 'title'))}</h1><p>${esc(k(c, 'desc'))}</p><ul>${list.map((s) => `<li><a href="${base}${lang}/services/${s.slug}">${esc(k(s, 'title'))}</a></li>`).join('')}</ul>` });
  }
  for (const s of seed.services) {
    const docs = s.documents.map((d) => d[lang]), steps = s.steps.map((d) => d[lang]);
    const ld = [
      { '@context': 'https://schema.org', '@type': 'HowTo', name: k(s, 'title'), description: k(s, 'summary'), inLanguage: lang,
        step: steps.map((n, i) => ({ '@type': 'HowToStep', position: i + 1, name: n })), supply: docs.map((n) => ({ '@type': 'HowToSupply', name: n })) },
      { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: lang, mainEntity: [
        [`${t.docs}`, docs.join(lang === 'ar' ? '، ' : ', ')], [t.fees, k(s, 'fees')], [t.dur, k(s, 'duration')], [t.loc, k(s, 'location')],
      ].filter((x) => x[1]).map(([q, a]) => ({ '@type': 'Question', name: `${k(s, 'title')}: ${q}`, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    ];
    pages.push({ lang, path: `services/${s.slug}`, title: `${k(s, 'title')} | ${t.brand}`, desc: `${k(s, 'summary')} ${t.disc}`.slice(0, 300), ld,
      body: `<h1>${esc(k(s, 'title'))}</h1><p>${esc(k(s, 'summary'))}</p><h2>${t.docs}</h2><ul>${docs.map((d) => `<li>${esc(d)}</li>`).join('')}</ul><h2>${t.steps}</h2><ol>${steps.map((d) => `<li>${esc(d)}</li>`).join('')}</ol><h2>${t.fees}</h2><p>${esc(k(s, 'fees'))}</p><h2>${t.dur}</h2><p>${esc(k(s, 'duration'))}</p><h2>${t.loc}</h2><p>${esc(k(s, 'location'))}</p><p><em>${esc(t.disc)}</em></p>` });
  }
}

const url = (lang, path) => `${site}${lang}${path ? '/' + path : ''}`;
for (const p of pages) {
  const alts = ['ar', 'en'].map((l) => `<link rel="alternate" hreflang="${l}" href="${url(l, p.path)}" />`).join('') + `<link rel="alternate" hreflang="x-default" href="${url('ar', p.path)}" />`;
  const head = `<title>${esc(p.title)}</title><meta name="description" content="${esc(p.desc)}" /><link rel="canonical" href="${url(p.lang, p.path)}" />${alts}` +
    `<meta property="og:type" content="website" /><meta property="og:title" content="${esc(p.title)}" /><meta property="og:description" content="${esc(p.desc)}" /><meta property="og:url" content="${url(p.lang, p.path)}" /><meta property="og:locale" content="${p.lang === 'ar' ? 'ar_EG' : 'en_US'}" /><meta name="twitter:card" content="summary" />` +
    (p.ld ? `<script type="application/ld+json" id="ld-json">${JSON.stringify(p.ld).replace(/</g, '\\u003c')}</script>` : '');
  let html = shell
    .replace(/<title>.*?<\/title>/s, '')
    .replace(/<meta name="description"[^>]*>/, '')
    .replace('</head>', `${head}</head>`)
    .replace(/<html lang="ar" dir="rtl">/, `<html lang="${p.lang}" dir="${p.lang === 'ar' ? 'rtl' : 'ltr'}">`)
    .replace('<div id="root"></div>', `<div id="root"><main>${p.body}</main></div>`);
  const dir = join(dist, p.lang, p.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

copyFileSync(join(dist, 'index.html'), join(dist, '404.html')); // SPA fallback for unknown deep links / admin / auth routes
const urls = pages.map((p) => `<url><loc>${url(p.lang, p.path)}</loc>${['ar', 'en'].map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${url(l, p.path)}"/>`).join('')}</url>`).join('');
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`);
const robotsPath = join(dist, 'robots.txt');
writeFileSync(robotsPath, readFileSync(robotsPath, 'utf8').replace('__SITE_URL__', site).replace('Disallow: /admin', `Disallow: ${base}ar/admin\nDisallow: ${base}en/admin`));
console.log(`postbuild: ${pages.length} static pages, sitemap, 404.html`);
