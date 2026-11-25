import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { applyLang, isLang, storedLang } from '../i18n';
import { useLocale } from '../lib/useLocale';
import { installPressFeedback, loadGsap, prefersReduced } from '../lib/anim';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const { lang } = useParams();
  const loc = useLocation();

  // Unprefixed URLs such as /admin or /services/x → add the stored language prefix.
  if (!isLang(lang)) return <Navigate to={`/${storedLang()}${loc.pathname}${loc.search}${loc.hash}`} replace />;

  // Synchronous + idempotent: sets i18n language, <html lang/dir> and persists the choice.
  applyLang(lang);
  return <Shell />;
}

function Shell() {
  const { t } = useLocale();
  const loc = useLocation();
  const main = useRef<HTMLElement>(null);
  const first = useRef(true);

  useEffect(() => installPressFeedback(), []);

  // Route transition: short fade/rise on the content area + scroll to top (or to #hash).
  useEffect(() => {
    if (loc.hash) { document.getElementById(loc.hash.slice(1))?.scrollIntoView(); }
    else window.scrollTo(0, 0);
    if (first.current) { first.current = false; return; }
    if (prefersReduced() || !main.current) return;
    let dead = false;
    loadGsap().then(({ gsap }) => {
      if (dead || !main.current) return;
      gsap.fromTo(main.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.38, ease: 'power2.out', clearProps: 'transform,opacity' });
    });
    return () => { dead = true; };
  }, [loc.pathname]);

  return (
    <>
      <a href="#main" className="skip-link">{t('nav.skip')}</a>
      <Header />
      <main id="main" ref={main} tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
