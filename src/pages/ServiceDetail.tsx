import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLocale } from '../lib/useLocale';
import { useCatalog } from '../lib/catalog';
import { useChecklist } from '../lib/userdata';
import { pick } from '../lib/types';
import { formatDate } from '../lib/format';
import { drawTick, inlineStart, loadGsap, prefersReduced, revealOnScroll, useAnim } from '../lib/anim';
import Seo from '../components/Seo';
import Icon from '../components/Icon';
import Disclaimer from '../components/Disclaimer';
import FavoriteButton from '../components/FavoriteButton';
import ServiceRow from '../components/ServiceRow';
import AdSlot from '../components/AdSlot';
import NotFound from './NotFound';

export default function ServiceDetail() {
  const { slug } = useParams();
  const { t, lang, to } = useLocale();
  const { catalog, loading } = useCatalog();
  const service = catalog?.services.find((s) => s.slug === slug);
  const category = catalog?.categories.find((c) => c.slug === service?.category);
  const { checked, toggle, clear } = useChecklist(service?.id);
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState('');

  // Entrance + scroll-triggered reveals + animated step timeline (direction aware)
  useAnim(root, (g, el) => {
    const { gsap, ScrollTrigger } = g;
    gsap.fromTo('.sd-head > *', { opacity: 0, x: inlineStart(18) }, { opacity: 1, x: 0, duration: 0.55, stagger: 0.07 });
    revealOnScroll(g, el, '.rv-scroll');
    const tl = el.querySelector('.timeline');
    if (tl) {
      gsap.fromTo('.tl-line-fill', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: tl, start: 'top 80%', end: 'bottom 65%', scrub: 0.4 } });
      gsap.fromTo('.tl-num', { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.12, scrollTrigger: { trigger: tl, start: 'top 80%', once: true } });
    }
    ScrollTrigger.refresh();
  }, [service?.id]);

  const total = service?.documents.length ?? 0;
  const done = checked.filter((i) => i < total).length;

  // progress bar micro-animation
  useAnim(root, ({ gsap }) => {
    if (bar.current) gsap.to(bar.current, { scaleX: total ? done / total : 0, duration: 0.4, ease: 'power2.out' });
  }, [done, total]);

  const related = useMemo(
    () => (catalog?.services ?? []).filter((s) => service && s.category === service.category && s.id !== service.id).slice(0, 3),
    [catalog, service],
  );

  if (loading) return <div className="container-page py-20 text-center text-muted">{t('common.loading')}</div>;
  if (!service) return <NotFound />;

  const title = pick(service, 'title', lang);
  const summary = pick(service, 'summary', lang);
  const fees = pick(service, 'fees', lang);
  const duration = pick(service, 'duration', lang);
  const location = pick(service, 'location', lang);
  const tips = pick(service, 'tips', lang);
  const pageUrl = window.location.href.split('#')[0];

  const onCheck = (i: number) => (e: ChangeEvent<HTMLInputElement>) => {
    toggle(i);
    if (e.target.checked) drawTick(e.target.nextElementSibling?.querySelector('path') as SVGPathElement | null);
  };

  const flash = (msg: string) => { setToast(msg); window.setTimeout(() => setToast(''), 2200); };
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title, text: summary, url: pageUrl });
      else { await navigator.clipboard.writeText(pageUrl); flash(t('service.copied')); }
    } catch { /* user cancelled */ }
  };

  const onPrint = () => window.print();

  // Structured data: HowTo + FAQPage
  const docNames = service.documents.map((d) => pick(d, '', lang) || (lang === 'ar' ? d.ar : d.en));
  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'HowTo', name: title, description: summary, inLanguage: lang,
      step: service.steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: lang === 'ar' ? s.ar : s.en })),
      supply: service.documents.map((d) => ({ '@type': 'HowToSupply', name: lang === 'ar' ? d.ar : d.en })),
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: lang,
      mainEntity: [
        { q: lang === 'ar' ? `ما المستندات المطلوبة: ${title}؟` : `What documents are required: ${title}?`, a: docNames.join(lang === 'ar' ? '، ' : ', ') },
        { q: lang === 'ar' ? 'كم تبلغ الرسوم؟' : 'How much does it cost?', a: fees },
        { q: lang === 'ar' ? 'كم تستغرق الخدمة؟' : 'How long does it take?', a: duration },
        { q: lang === 'ar' ? 'أين أقدم الطلب؟' : 'Where do I apply?', a: location },
      ].filter((x) => x.a).map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })),
    },
  ];

  return (
    <div ref={root} className="container-page py-8 md:py-12">
      <Seo title={title} description={`${summary} ${t('disclaimer.footer')}`.slice(0, 300)} path={`/services/${service.slug}`} jsonLd={jsonLd} />

      {/* Print-only masthead */}
      <div className="print-only mb-4 border-b border-black pb-2">
        <p className="m-0 text-sm font-semibold">{t('brand.name')} – {t('service.printedFrom')}</p>
        <p className="m-0 text-xs">{pageUrl}</p>
      </div>

      <nav aria-label="breadcrumb" className="no-print mb-6 flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link to={to('/services')} className="hover:text-primary">{t('nav.services')}</Link>
        <Icon name="arrow" size={14} className="flip-rtl" />
        {category && <Link to={to(`/category/${category.slug}`)} className="hover:text-primary">{pick(category, 'title', lang)}</Link>}
      </nav>

      <header className="sd-head max-w-3xl">
        <p className="eyebrow">{category ? pick(category, 'title', lang) : ''}</p>
        <h1 className="mt-2 text-2xl md:text-3xl">{title}</h1>
        <p className="mt-3 text-lg text-muted">{summary}</p>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
          <Icon name="clock" size={16} />
          <span>{t('service.lastUpdated')}: <time dateTime={service.last_verified || undefined}>{formatDate(service.last_verified, lang)}</time></span>
        </p>
        <div className="no-print mt-5 flex flex-wrap gap-2">
          <FavoriteButton serviceId={service.id} />
          <button type="button" className="btn btn-ghost" onClick={onPrint}><Icon name="print" size={20} />{t('service.print')}</button>
          <button type="button" className="btn btn-ghost" onClick={share}><Icon name="share" size={20} />{t('service.share')}</button>
        </div>
        <p role="status" aria-live="polite" className="no-print mt-2 h-5 text-sm text-[color:var(--ok)]">{toast}</p>
      </header>

      <div className="mt-8 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0 space-y-12">
          {/* Documents checklist */}
          <section aria-labelledby="docs-h" className="rv-scroll">
            <h2 id="docs-h" className="text-xl">{t('service.documents')}</h2>
            <p className="no-print mt-1 text-sm text-muted">{t('service.documentsHint')}</p>
            <div className="no-print mt-4 flex items-center gap-3 text-sm">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-primary-soft" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label={t('service.progress', { done, total })}>
                <div ref={bar} className="h-full origin-[inline-start] rounded-full bg-primary" style={{ transform: `scaleX(${total ? done / total : 0})`, transformOrigin: lang === 'ar' ? 'right' : 'left' }} />
              </div>
              <span className="font-semibold tabular-nums">{t('service.progress', { done, total })}</span>
              {done > 0 && <button type="button" className="btn btn-quiet btn-sm" onClick={clear}>{t('service.reset')}</button>}
            </div>
            <ul className="mt-3 list-none p-0">
              {service.documents.map((d, i) => {
                const note = pick(d, 'note', lang);
                return (
                  <li key={i}>
                    <label className="check-row">
                      <input type="checkbox" className="check-input sr-only" checked={checked.includes(i)} onChange={onCheck(i)} />
                      <span className="check-box" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                      </span>
                      <span className="check-text min-w-0">
                        <span className="doc-title block font-semibold">{lang === 'ar' ? d.ar : d.en}</span>
                        {note && <span className="mt-0.5 block text-sm text-muted">{note}</span>}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Steps timeline */}
          <section aria-labelledby="steps-h">
            <h2 id="steps-h" className="rv-scroll text-xl">{t('service.steps')}</h2>
            <ol className="timeline mt-6 list-none p-0">
              <span className="tl-line" aria-hidden="true"><span className="tl-line-fill" /></span>
              {service.steps.map((s, i) => {
                const detail = pick(s, 'detail', lang);
                return (
                  <li key={i} className="tl-step rv-scroll">
                    <span className="tl-num" aria-hidden="true">{i + 1}</span>
                    <p className="m-0 pt-1 font-semibold">{lang === 'ar' ? s.ar : s.en}</p>
                    {detail && <p className="mt-1 text-sm text-muted">{detail}</p>}
                  </li>
                );
              })}
            </ol>
          </section>

          {tips && (
            <section aria-labelledby="tips-h" className="rv-scroll">
              <h2 id="tips-h" className="text-xl">{t('service.tips')}</h2>
              <p className="mt-2 max-w-prose rounded-lg bg-gold-soft p-4" style={{ borderInlineStart: '4px solid var(--gold)' }}>{tips}</p>
            </section>
          )}
        </div>

        <aside className="min-w-0 space-y-10" aria-label={t('service.info')}>
          <section aria-labelledby="info-h" className="rv-scroll">
            <h2 id="info-h" className="text-xl">{t('service.info')}</h2>
            <dl className="mt-3 m-0">
              {[
                ['coins', t('service.fees'), fees],
                ['clock', t('service.duration'), duration],
                ['map', t('service.location'), location],
              ].map(([icon, label, value]) => (
                <div key={label} className="info-row flex gap-3 border-b border-line py-3">
                  <span className="tile-icon flex-none" aria-hidden="true"><Icon name={icon} /></span>
                  <div className="min-w-0">
                    <dt className="text-sm font-semibold text-muted">{label}</dt>
                    <dd className="m-0 mt-0.5">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="links-h" className="rv-scroll print-links">
            <h2 id="links-h" className="text-xl">{t('service.links')}</h2>
            <ul className="mt-3 list-none p-0">
              {service.links.map((l) => (
                <li key={l.url} className="border-b border-line">
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 py-3 font-semibold no-underline hover:text-primary">
                    <span>{lang === 'ar' ? l.label_ar : l.label_en}<span className="sr-only"> ({t('common.external')})</span></span>
                    <Icon name="external" size={18} className="flex-none text-muted no-print" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <AdSlot id="service-sidebar" />
        </aside>
      </div>

      <Disclaimer className="rv-scroll mt-12 max-w-3xl" />

      {related.length > 0 && (
        <section className="no-print mt-14" aria-labelledby="rel-h">
          <h2 id="rel-h" className="rv-scroll text-xl">{t('service.related')}</h2>
          <div className="mt-3 rounded-xl border border-line bg-surface px-3 md:px-5">
            {related.map((s) => <div key={s.id} className="rv-scroll"><ServiceRow service={s} /></div>)}
          </div>
        </section>
      )}
    </div>
  );
}

// keep tree-shakers from dropping side-effect imports used only for types in some builds
void loadGsap; void prefersReduced;
