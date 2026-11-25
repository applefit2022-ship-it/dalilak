import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useLocale } from '../../lib/useLocale';
import { useAuth } from '../../lib/auth';
import { inlineStart, useAnim } from '../../lib/anim';
import type { Category, Service } from '../../lib/types';
import { fetchAdminAll } from './adminData';
import Seo from '../../components/Seo';

interface AdminCtx { categories: Category[]; services: Service[]; reload: () => Promise<void>; loading: boolean; error: string }
const Ctx = createContext<AdminCtx>({ categories: [], services: [], reload: async () => {}, loading: true, error: '' });
export const useAdmin = () => useContext(Ctx);

export default function AdminLayout() {
  const { t, to } = useLocale();
  const { user, isAdmin, loading: authLoading, enabled } = useAuth();
  const [data, setData] = useState<{ categories: Category[]; services: Service[] }>({ categories: [], services: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const root = useRef<HTMLDivElement>(null);

  const reload = useCallback(async () => {
    try { setData(await fetchAdminAll()); setError(''); } catch (e: any) { setError(e?.message || t('admin.error')); }
    setLoading(false);
  }, [t]);

  useEffect(() => { if (isAdmin) reload(); }, [isAdmin, reload]);
  useAnim(root, ({ gsap }) => { gsap.fromTo('.ad-nav a', { opacity: 0, x: inlineStart(10) }, { opacity: 1, x: 0, stagger: 0.05, duration: 0.4 }); }, [isAdmin]);

  if (!enabled) return <div className="container-page py-16"><p role="alert" className="max-w-lg rounded-lg bg-gold-soft p-4">{t('admin.notConfigured')}</p></div>;
  if (authLoading) return <div className="container-page py-16 text-muted">{t('common.loading')}</div>;
  if (!isAdmin) {
    return (
      <div className="container-page py-16">
        <Seo title={t('admin.denied')} description={t('admin.deniedHint')} path="/admin" noindex />
        <h1 className="text-2xl">{t('admin.denied')}</h1>
        <p className="mt-2 text-muted">{t('admin.deniedHint')}</p>
        {!user && <Link to={to('/login')} className="btn btn-primary mt-5 no-underline">{t('nav.login')}</Link>}
      </div>
    );
  }

  const link = ({ isActive }: { isActive: boolean }) => `rounded-lg px-3 py-2 text-sm font-semibold no-underline ${isActive ? 'bg-primary-soft text-primary' : 'text-ink hover:bg-raised'}`;
  return (
    <Ctx.Provider value={{ ...data, reload, loading, error }}>
      <div ref={root} className="container-page py-8">
        <Seo title={t('admin.title')} description={t('admin.title')} path="/admin" noindex />
        <h1 className="text-2xl">{t('admin.title')}</h1>
        <nav className="ad-nav mt-4 flex flex-wrap gap-1 border-b border-line pb-3" aria-label={t('admin.title')}>
          <NavLink end to={to('/admin')} className={link}>{t('admin.dashboard')}</NavLink>
          <NavLink to={to('/admin/services')} className={link}>{t('admin.services')}</NavLink>
          <NavLink to={to('/admin/categories')} className={link}>{t('admin.categories')}</NavLink>
          <NavLink to={to('/admin/import-export')} className={link}>{t('admin.importExport')}</NavLink>
        </nav>
        {error && <p role="alert" className="mt-4 text-danger">{error}</p>}
        <div className="mt-6"><Outlet /></div>
      </div>
    </Ctx.Provider>
  );
}
