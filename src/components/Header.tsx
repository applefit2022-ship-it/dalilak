import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useLocale } from '../lib/useLocale';
import { useAuth } from '../lib/auth';
import { loadGsap, prefersReduced, spin, staggerIn, inlineStart } from '../lib/anim';
import Icon from './Icon';

function Logo() {
  const { t } = useLocale();
  return (
    <span className="flex items-center gap-2.5">
      <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="var(--primary)" /><path d="M32 12 14 22v4h36v-4L32 12Zm-14 18v14h6V30h-6Zm11 0v14h6V30h-6Zm11 0v14h6V30h-6ZM14 48v4h36v-4H14Z" fill="var(--primary-ink)" /><circle cx="48" cy="16" r="5" fill="var(--gold)" /></svg>
      <span className="text-lg font-semibold tracking-tight">{t('brand.name')}</span>
    </span>
  );
}

export default function Header() {
  const { t, lang, to } = useLocale();
  const { user, isAdmin, signOut, enabled } = useAuth();
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute('data-theme') || 'light');
  const themeIcon = useRef<HTMLSpanElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  // path with the language segment swapped
  const rest = loc.pathname.replace(/^\/(ar|en)(?=\/|$)/, '') || '';
  const otherLang = lang === 'ar' ? 'en' : 'ar';
  const switchTo = `/${otherLang}${rest}${loc.search}${loc.hash}`;

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  useEffect(() => {
    if (!open || prefersReduced() || !menu.current) return;
    let dead = false;
    loadGsap().then((g) => {
      if (dead || !menu.current) return;
      staggerIn(g, menu.current.querySelectorAll('a,button'), { x: inlineStart(14), y: 0, stagger: 0.04 });
    });
    return () => { dead = true; };
  }, [open]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('dalilak.theme', next); } catch { /* ignore */ }
    setTheme(next);
    spin(themeIcon.current, 120);
  };

  const link = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-semibold no-underline transition-colors ${isActive ? 'text-primary bg-primary-soft' : 'text-ink hover:bg-raised'}`;

  const nav = (
    <>
      <NavLink to={to('')} end className={link}>{t('nav.home')}</NavLink>
      <NavLink to={to('/services')} className={link}>{t('nav.services')}</NavLink>
      <NavLink to={to('/favorites')} className={link}>{t('nav.favorites')}</NavLink>
      <NavLink to={to('/about')} className={link}>{t('nav.about')}</NavLink>
      <NavLink to={to('/contact')} className={link}>{t('nav.contact')}</NavLink>
      {isAdmin && <NavLink to={to('/admin')} className={link}>{t('nav.admin')}</NavLink>}
    </>
  );

  return (
    <header role="banner" className="no-print sticky top-0 z-40 border-b border-line bg-[color:var(--bg)]/90 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--bg)]/80">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link to={to('')} aria-label={t('brand.full')} className="no-underline text-ink"><Logo /></Link>

        <nav aria-label={t('nav.main')} className="hidden items-center gap-1 lg:flex">{nav}</nav>

        <div className="flex items-center gap-1.5">
          <Link to={switchTo} hrefLang={otherLang} lang={otherLang} className="btn btn-ghost btn-sm no-underline" aria-label={t('nav.language')} data-press>
            <Icon name="globe" size={18} /><span>{t('nav.langName')}</span>
          </Link>
          <button type="button" className="btn btn-quiet" onClick={toggleTheme} aria-label={t('nav.theme')} aria-pressed={theme === 'dark'} data-press>
            <span ref={themeIcon} className="grid"><Icon name={theme === 'dark' ? 'sun' : 'moon'} /></span>
          </button>
          {enabled && (user ? (
            <button type="button" className="btn btn-ghost btn-sm hidden sm:inline-flex" onClick={() => signOut()}>{t('nav.logout')}</button>
          ) : (
            <Link to={to('/login')} className="btn btn-primary btn-sm hidden no-underline sm:inline-flex">{t('nav.login')}</Link>
          ))}
          <button type="button" className="btn btn-quiet lg:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? t('nav.closeMenu') : t('nav.menu')} onClick={() => setOpen((v) => !v)}>
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" ref={menu} className="border-t border-line bg-[color:var(--bg)] lg:hidden">
          <nav aria-label={t('nav.main')} className="container-page flex flex-col gap-1 py-3">
            {nav}
            {enabled && (user
              ? <button type="button" className="btn btn-ghost mt-2" onClick={() => signOut()}>{t('nav.logout')}</button>
              : <div className="mt-2 flex gap-2"><Link to={to('/login')} className="btn btn-primary flex-1 no-underline">{t('nav.login')}</Link><Link to={to('/signup')} className="btn btn-ghost flex-1 no-underline">{t('nav.signup')}</Link></div>)}
          </nav>
        </div>
      )}
    </header>
  );
}
