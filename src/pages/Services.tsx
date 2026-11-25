import { useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useLocale } from '../lib/useLocale';
import { useCatalog } from '../lib/catalog';
import { matches, normalize } from '../lib/arabic';
import { pick } from '../lib/types';
import { loadGsap, prefersReduced, staggerIn, inlineStart } from '../lib/anim';
import Seo from '../components/Seo';
import Icon from '../components/Icon';
import ServiceRow from '../components/ServiceRow';
import AdSlot from '../components/AdSlot';
import NotFound from './NotFound';

type Sort = 'az' | 'popular' | 'new';

export default function Services({ byCategoryRoute = false }: { byCategoryRoute?: boolean }) {
  const { t, lang, to } = useLocale();
  const { catalog, loading } = useCatalog();
  const { slug } = useParams();
  const [sp, setSp] = useSearchParams();
  const list = useRef<HTMLDivElement>(null);

  const q = sp.get('q') || '';
  const cat = byCategoryRoute ? slug || '' : sp.get('cat') || '';
  const sort = (sp.get('sort') as Sort) || 'az';

  const cats = catalog?.categories ?? [];
  const catBySlug = useMemo(() => new Map(cats.map((c) => [c.slug, c])), [cats]);

  // Normalised haystack per service (Arabic-aware: diacritics, alef/ya/ta-marbuta variants, digits)
  const index = useMemo(() => (catalog?.services ?? []).map((s) => {
    const c = catBySlug.get(s.category);
    const hay = normalize([s.title_ar, s.title_en, s.summary_ar, s.summary_en, c?.title_ar, c?.title_en, s.slug.replace(/-/g, ' ')].join(' '));
    return { s, hay };
  }), [catalog, catBySlug]);

  const results = useMemo(() => {
    let r = index.filter(({ s, hay }) => (!cat || s.category === cat) && matches(hay, q)).map((x) => x.s);
    const key = (s: (typeof r)[number]) => pick(s, 'title', lang);
    if (sort === 'az') r = [...r].sort((a, b) => key(a).localeCompare(key(b), lang));
    if (sort === 'popular') r = [...r].sort((a, b) => Number(b.popular) - Number(a.popular) || key(a).localeCompare(key(b), lang));
    if (sort === 'new') r = [...r].sort((a, b) => (b.last_verified || '').localeCompare(a.last_verified || '') || key(a).localeCompare(key(b), lang));
    return r;
  }, [index, q, cat, sort, lang]);

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setSp(next, { replace: true });
  };

  // Animate results whenever the result set changes (search results micro-interaction)
  const sig = results.map((r) => r.id).join('|');
  useEffect(() => {
    if (prefersReduced() || !list.current) return;
    let dead = false;
    loadGsap().then((g) => { if (!dead && list.current) staggerIn(g, list.current.querySelectorAll('[data-service-row]'), { x: inlineStart(10), y: 0 }); });
    return () => { dead = true; };
  }, [sig]);

  const current = catBySlug.get(cat);
  if (byCategoryRoute && catalog && !current) return <NotFound />;

  const title = current ? t('services.inCategory', { name: pick(current, 'title', lang) }) : t('services.title');
  const desc = current ? pick(current, 'desc', lang) : t('services.metaDesc');

  return (
    <div className="container-page py-10 md:py-14">
      <Seo title={title} description={desc} path={byCategoryRoute ? `/category/${slug}` : '/services'} />
      <h1 className="text-2xl md:text-3xl">{title}</h1>
      {current && <p className="mt-2 max-w-prose text-muted">{desc}</p>}

      <div className="mt-8 grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <label htmlFor="svc-q" className="sr-only">{t('services.searchLabel')}</label>
          <Icon name="search" className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted" />
          <input id="svc-q" type="search" value={q} onChange={(e) => update({ q: e.target.value })} placeholder={t('services.placeholder')} className="input ps-12" autoComplete="off" enterKeyHint="search" />
        </div>
        <div>
          <label htmlFor="svc-sort" className="sr-only">{t('services.sort')}</label>
          <select id="svc-sort" className="select md:w-52" value={sort} onChange={(e) => update({ sort: e.target.value === 'az' ? '' : e.target.value })}>
            <option value="az">{t('services.sortAz')}</option>
            <option value="popular">{t('services.sortPopular')}</option>
            <option value="new">{t('services.sortNew')}</option>
          </select>
        </div>
      </div>

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label={t('services.category')}>
        {!byCategoryRoute && (
          <button type="button" className={`chip shrink-0 cursor-pointer border-0 py-2 ${!cat ? '!bg-primary !text-primary-ink' : ''}`} aria-pressed={!cat} onClick={() => update({ cat: '' })}>{t('services.all')}</button>
        )}
        {cats.map((c) => {
          const active = cat === c.slug;
          return byCategoryRoute ? (
            <Link key={c.id} to={to(`/category/${c.slug}`)} className={`chip shrink-0 py-2 no-underline ${active ? '!bg-primary !text-primary-ink' : ''}`} aria-current={active ? 'page' : undefined}>{pick(c, 'title', lang)}</Link>
          ) : (
            <button key={c.id} type="button" className={`chip shrink-0 cursor-pointer border-0 py-2 ${active ? '!bg-primary !text-primary-ink' : ''}`} aria-pressed={active} onClick={() => update({ cat: active ? '' : c.slug })}>{pick(c, 'title', lang)}</button>
          );
        })}
      </div>

      <p className="mt-6 text-sm text-muted" role="status" aria-live="polite">{t('services.results', { count: results.length })}</p>

      <div ref={list} className="mt-2 rounded-xl border border-line bg-surface px-3 md:px-5">
        {loading && <p className="py-10 text-center text-muted">{t('common.loading')}</p>}
        {!loading && results.map((s) => <ServiceRow key={s.id} service={s} category={catBySlug.get(s.category)} />)}
        {!loading && results.length === 0 && (
          <div className="py-14 text-center">
            <Icon name="search" size={36} className="mx-auto text-muted" />
            <h2 className="mt-3 text-xl">{t('services.emptyTitle')}</h2>
            <p className="mx-auto mt-1 max-w-sm text-muted">{t('services.emptyHint')}</p>
            <button type="button" className="btn btn-ghost mt-5" onClick={() => setSp(byCategoryRoute ? { } : {}, { replace: true })}>{t('services.clear')}</button>
          </div>
        )}
      </div>
      <AdSlot id="services-bottom" className="mt-8" />
    </div>
  );
}
