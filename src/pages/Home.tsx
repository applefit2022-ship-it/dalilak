import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../lib/useLocale';
import { useCatalog } from '../lib/catalog';
import { pick } from '../lib/types';
import { inlineStart, revealOnScroll, useAnim } from '../lib/anim';
import Seo from '../components/Seo';
import SearchBox from '../components/SearchBox';
import Icon from '../components/Icon';
import ServiceRow from '../components/ServiceRow';
import Disclaimer from '../components/Disclaimer';
import AdSlot from '../components/AdSlot';

export default function Home() {
  const { t, lang, to } = useLocale();
  const { catalog } = useCatalog();
  const root = useRef<HTMLDivElement>(null);
  const cats = catalog?.categories ?? [];
  const popular = (catalog?.services ?? []).filter((s) => s.popular).slice(0, 8);
  const catBySlug = new Map(cats.map((c) => [c.slug, c]));
  const counts = new Map<string, number>();
  catalog?.services.forEach((s) => counts.set(s.category, (counts.get(s.category) || 0) + 1));

  // Hero entrance timeline (mirrors direction in RTL)
  useAnim(root, ({ gsap }) => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.hero-a', { opacity: 0, x: inlineStart(22) }, { opacity: 1, x: 0, duration: 0.6, stagger: 0.09 })
      .fromTo('.hero-b', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.08 }, '-=0.3')
      .fromTo('.hero-deco', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.8 }, 0.1);
  }, []);

  // Category grid + sections reveal once the catalogue is ready
  useAnim(root, (g, el) => {
    revealOnScroll(g, el, '.rv-scroll');
  }, [catalog?.categories.length]);

  return (
    <div ref={root}>
      <Seo title={t('seo.homeTitle')} description={t('seo.homeDesc')} path="/" />

      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden="true" className="hero-deco rv pointer-events-none absolute -end-24 -top-24 h-96 w-96 rounded-full" style={{ background: 'radial-gradient(closest-side, var(--primary-soft), transparent)' }} />
        <div className="container-page relative py-14 md:py-24">
          <p className="hero-a rv eyebrow">{t('hero.kicker')}</p>
          <span className="hero-a rv rule-gold mt-3" />
          <h1 className="hero-a rv mt-5 max-w-3xl text-3xl">{t('hero.title')}</h1>
          <p className="hero-b rv mt-4 max-w-prose text-lg text-muted">{t('hero.sub')}</p>
          <div className="hero-b rv mt-8 max-w-2xl"><SearchBox large /></div>
          <p className="hero-b rv mt-5 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>{t('hero.try')}</span>
            {popular.slice(0, 3).map((s) => (
              <Link key={s.id} to={to(`/services/${s.slug}`)} className="chip no-underline">{pick(s, 'title', lang)}</Link>
            ))}
          </p>
        </div>
      </section>

      <section className="container-page py-14" aria-labelledby="cats-h">
        <div className="rv-scroll max-w-prose">
          <h2 id="cats-h" className="text-2xl">{t('home.categories')}</h2>
          <p className="mt-2 text-muted">{t('home.categoriesSub')}</p>
        </div>
        <ul className="mt-8 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 md:gap-4 lg:grid-cols-5">
          {cats.map((c) => (
            <li key={c.id} className="rv-scroll">
              <Link to={to(`/category/${c.slug}`)} className="tile no-underline">
                <span className="tile-icon"><Icon name={c.icon} /></span>
                <span className="text-[0.95rem] font-semibold leading-snug">{pick(c, 'title', lang)}</span>
                <span className="mt-auto text-xs text-muted">{t('home.servicesCount', { count: counts.get(c.slug) || 0 })}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <AdSlot id="home-mid" className="container-page" />

      <section className="border-y border-line bg-raised py-14" aria-labelledby="pop-h">
        <div className="container-page">
          <div className="rv-scroll flex items-end justify-between gap-4">
            <h2 id="pop-h" className="text-2xl">{t('home.popular')}</h2>
            <Link to={to('/services')} className="btn btn-ghost btn-sm no-underline">{t('home.viewAll')}<Icon name="arrow" size={16} className="flip-rtl" /></Link>
          </div>
          <div className="mt-6 rounded-xl border border-line bg-surface px-3 md:px-5">
            {popular.map((s) => (
              <div key={s.id} className="rv-scroll"><ServiceRow service={s} category={catBySlug.get(s.category)} /></div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14" aria-labelledby="how-h">
        <h2 id="how-h" className="rv-scroll text-2xl">{t('home.how')}</h2>
        <ol className="mt-8 grid list-none gap-8 p-0 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <li key={n} className="rv-scroll flex gap-4">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-primary text-lg font-semibold text-primary-ink" aria-hidden="true">{n}</span>
              <div>
                <h3 className="text-lg">{t(`home.how${n}t`)}</h3>
                <p className="mt-1 text-muted">{t(`home.how${n}d`)}</p>
              </div>
            </li>
          ))}
        </ol>
        <Disclaimer className="rv-scroll mt-12 max-w-3xl" />
      </section>
    </div>
  );
}
