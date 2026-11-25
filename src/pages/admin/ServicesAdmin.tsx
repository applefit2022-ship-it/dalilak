import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../../lib/useLocale';
import { matches, normalize } from '../../lib/arabic';
import { supabase } from '../../lib/supabase';
import { resetCatalogCache } from '../../lib/data';
import { staggerIn, loadGsap, prefersReduced } from '../../lib/anim';
import { useEffect } from 'react';
import { useAdmin } from './AdminLayout';
import Icon from '../../components/Icon';

export default function ServicesAdmin() {
  const { t, lang, to } = useLocale();
  const { services, categories, reload, loading } = useAdmin();
  const [q, setQ] = useState('');
  const box = useRef<HTMLTableSectionElement>(null);
  const catTitle = new Map(categories.map((c) => [c.slug, lang === 'ar' ? c.title_ar : c.title_en]));

  const rows = useMemo(() => services.filter((s) => matches(normalize(`${s.title_ar} ${s.title_en} ${s.slug}`), q)), [services, q]);
  const sig = rows.map((r) => r.id).join();
  useEffect(() => {
    if (prefersReduced() || !box.current) return;
    let dead = false;
    loadGsap().then((g) => { if (!dead && box.current) staggerIn(g, box.current.querySelectorAll('tr'), { y: 8, stagger: 0.02 }); });
    return () => { dead = true; };
  }, [sig]);

  const togglePublish = async (id: string, published: boolean) => {
    await supabase?.from('services').update({ published: !published }).eq('id', id);
    resetCatalogCache(); reload();
  };
  const remove = async (id: string) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    await supabase?.from('services').delete().eq('id', id);
    resetCatalogCache(); reload();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="adm-q" className="sr-only">{t('admin.search')}</label>
        <input id="adm-q" type="search" className="input max-w-sm" placeholder={t('admin.search')} value={q} onChange={(e) => setQ(e.target.value)} />
        <Link to={to('/admin/services/new')} className="btn btn-primary no-underline"><Icon name="plus" size={18} />{t('admin.new')}</Link>
      </div>
      {loading ? <p className="mt-6 text-muted">{t('admin.loading')}</p> : (
        <div className="mt-5 overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <thead><tr className="border-b border-line text-start text-muted">
              <th scope="col" className="p-3 text-start">{t('admin.f.titleAr')} / {t('admin.f.titleEn')}</th>
              <th scope="col" className="p-3 text-start">{t('admin.f.category')}</th>
              <th scope="col" className="p-3 text-start">{t('admin.lastVerified')}</th>
              <th scope="col" className="p-3" />
            </tr></thead>
            <tbody ref={box}>
              {rows.map((s) => (
                <tr key={s.id} className="border-b border-line last:border-0">
                  <td className="p-3">
                    <Link to={to(`/admin/services/${s.id}`)} className="font-semibold no-underline">{lang === 'ar' ? s.title_ar : s.title_en}</Link>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <span className={`chip ${s.published ? '' : 'chip-warn'}`}>{s.published ? t('admin.published') : t('admin.draft')}</span>
                      {s.needs_review && <span className="chip chip-gold">{t('admin.needsReview')}</span>}
                    </div>
                  </td>
                  <td className="p-3 text-muted">{catTitle.get(s.category)}</td>
                  <td className="p-3 tabular-nums text-muted">{s.last_verified || '—'}</td>
                  <td className="p-3"><div className="flex justify-end gap-1.5">
                    <Link to={to(`/admin/services/${s.id}`)} className="btn btn-ghost btn-sm no-underline">{t('admin.edit')}</Link>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => togglePublish(s.id, s.published)}>{s.published ? t('admin.unpublish') : t('admin.publish')}</button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(s.id)} aria-label={t('admin.delete')}><Icon name="trash" size={16} /></button>
                  </div></td>
                </tr>
              ))}
              {!rows.length && <tr><td className="p-6 text-center text-muted" colSpan={4}>{t('admin.empty')}</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
