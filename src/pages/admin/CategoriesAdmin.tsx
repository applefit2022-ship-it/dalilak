import { useState } from 'react';
import { useLocale } from '../../lib/useLocale';
import { supabase } from '../../lib/supabase';
import { resetCatalogCache } from '../../lib/data';
import { slugify } from '../../lib/format';
import type { Category } from '../../lib/types';
import { useAdmin } from './AdminLayout';
import Icon from '../../components/Icon';

const ICONS = ['id-card', 'passport', 'shield', 'receipt', 'bolt', 'car', 'building', 'graduation', 'heart', 'briefcase', 'badge', 'scale', 'phone', 'map', 'globe', 'folder'];
const blank = (position: number): Partial<Category> => ({ slug: '', icon: 'folder', position, title_ar: '', title_en: '', desc_ar: '', desc_en: '' });

export default function CategoriesAdmin() {
  const { t, lang } = useLocale();
  const { categories, services, reload } = useAdmin();
  const [edit, setEdit] = useState<Partial<Category> | null>(null);
  const [err, setErr] = useState('');

  const set = (k: keyof Category, v: string | number) => setEdit((p) => ({ ...p, [k]: v }));
  const save = async () => {
    if (!supabase || !edit) return;
    const row = { ...edit, slug: edit.slug?.trim() || slugify(edit.title_en || '') };
    if (!row.slug || !row.title_ar || !row.title_en) { setErr(t('admin.error')); return; }
    const res = row.id
      ? await supabase.from('categories').update(row).eq('id', row.id)
      : await supabase.from('categories').insert(row);
    if (res.error) { setErr(res.error.message); return; }
    resetCatalogCache(); setEdit(null); setErr(''); reload();
  };
  const remove = async (c: Category) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;
    const { error } = await supabase!.from('categories').delete().eq('id', c.id);
    if (error) { setErr(error.message); return; }
    resetCatalogCache(); reload();
  };
  const reorder = async (c: Category, d: number) => {
    const sorted = [...categories].sort((a, b) => a.position - b.position);
    const i = sorted.findIndex((x) => x.id === c.id), j = i + d;
    if (j < 0 || j >= sorted.length) return;
    await Promise.all([
      supabase!.from('categories').update({ position: sorted[j].position }).eq('id', c.id),
      supabase!.from('categories').update({ position: c.position }).eq('id', sorted[j].id),
    ]);
    resetCatalogCache(); reload();
  };

  const inp = (k: keyof Category, label: string, dir?: 'rtl' | 'ltr') => (
    <div><label className="label" htmlFor={`c-${k}`}>{label}</label><input id={`c-${k}`} className="input" dir={dir} value={(edit?.[k] as string) ?? ''} onChange={(e) => set(k, e.target.value)} /></div>
  );

  return (
    <div>
      <button type="button" className="btn btn-primary" onClick={() => setEdit(blank(categories.length + 1))}><Icon name="plus" size={18} />{t('admin.newCategory')}</button>
      {err && <p role="alert" className="mt-3 text-danger">{err}</p>}

      {edit && (
        <form onSubmit={(e) => { e.preventDefault(); save(); }} className="mt-5 max-w-3xl space-y-4 rounded-xl border border-line bg-surface p-5">
          <div className="grid gap-4 md:grid-cols-2">
            {inp('title_ar', t('admin.f.titleAr'), 'rtl')}{inp('title_en', t('admin.f.titleEn'), 'ltr')}
            {inp('desc_ar', t('admin.f.descAr'), 'rtl')}{inp('desc_en', t('admin.f.descEn'), 'ltr')}
            {inp('slug', t('admin.f.slug'), 'ltr')}
            <div><label className="label" htmlFor="c-icon">{t('admin.f.icon')}</label>
              <select id="c-icon" className="select" value={edit.icon} onChange={(e) => set('icon', e.target.value)}>{ICONS.map((i) => <option key={i}>{i}</option>)}</select></div>
          </div>
          <div className="flex gap-2"><button className="btn btn-primary" type="submit">{t('admin.save')}</button><button type="button" className="btn btn-ghost" onClick={() => setEdit(null)}>{t('admin.cancel')}</button></div>
        </form>
      )}

      <ul className="mt-6 list-none rounded-xl border border-line bg-surface p-0">
        {[...categories].sort((a, b) => a.position - b.position).map((c) => (
          <li key={c.id} className="flex items-center gap-3 border-b border-line p-3 last:border-0">
            <span className="tile-icon" aria-hidden="true"><Icon name={c.icon} /></span>
            <span className="min-w-0 flex-1"><strong>{lang === 'ar' ? c.title_ar : c.title_en}</strong>
              <span className="block text-xs text-muted">{c.slug} · {services.filter((s) => s.category_id === c.id).length}</span></span>
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => reorder(c, -1)} aria-label={t('admin.up')}><Icon name="up" size={16} /></button>
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => reorder(c, 1)} aria-label={t('admin.down')}><Icon name="down" size={16} /></button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEdit(c)}>{t('admin.edit')}</button>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(c)} aria-label={t('admin.delete')}><Icon name="trash" size={16} /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}
