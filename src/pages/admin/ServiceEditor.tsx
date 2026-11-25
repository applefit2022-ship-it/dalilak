import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLocale } from '../../lib/useLocale';
import { supabase } from '../../lib/supabase';
import { resetCatalogCache } from '../../lib/data';
import { slugify } from '../../lib/format';
import type { DocItem, LinkItem, Service, StepItem } from '../../lib/types';
import { useAdmin } from './AdminLayout';
import { toRow } from './adminData';
import Icon from '../../components/Icon';

const blank = (): Partial<Service> => ({
  slug: '', category_id: '', title_ar: '', title_en: '', summary_ar: '', summary_en: '', documents: [], steps: [], links: [],
  fees_ar: '', fees_en: '', duration_ar: '', duration_en: '', location_ar: '', location_en: '', tips_ar: '', tips_en: '',
  popular: false, published: false, needs_review: true, last_verified: null,
});

function move<T>(arr: T[], i: number, d: number): T[] {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const c = [...arr];
  [c[i], c[j]] = [c[j], c[i]];
  return c;
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return <div><label htmlFor={id} className="label">{label}</label>{children}</div>;
}

/** Ordered list editor with move up / down / remove. */
function ListEditor<T extends Record<string, string>>({ title, items, onChange, fields, empty }: {
  title: string; items: T[]; onChange: (v: T[]) => void; fields: { key: keyof T & string; label: string; dir?: 'rtl' | 'ltr'; long?: boolean }[]; empty: T;
}) {
  const { t } = useLocale();
  return (
    <fieldset className="rounded-xl border border-line p-4">
      <legend className="px-2 font-semibold">{title}</legend>
      <ol className="m-0 list-none space-y-3 p-0">
        {items.map((it, i) => (
          <li key={i} className="rounded-lg border border-line bg-raised p-3">
            <div className="grid gap-2 md:grid-cols-2">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="label text-xs" htmlFor={`${title}-${i}-${f.key}`}>{f.label}</label>
                  <input id={`${title}-${i}-${f.key}`} className="input" dir={f.dir} value={it[f.key] || ''}
                    onChange={(e) => onChange(items.map((x, k) => (k === i ? { ...x, [f.key]: e.target.value } : x)))} />
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-1">
              <button type="button" className="btn btn-quiet btn-sm" onClick={() => onChange(move(items, i, -1))} disabled={i === 0} aria-label={t('admin.up')}><Icon name="up" size={16} /></button>
              <button type="button" className="btn btn-quiet btn-sm" onClick={() => onChange(move(items, i, 1))} disabled={i === items.length - 1} aria-label={t('admin.down')}><Icon name="down" size={16} /></button>
              <button type="button" className="btn btn-quiet btn-sm text-danger" onClick={() => onChange(items.filter((_, k) => k !== i))} aria-label={t('admin.remove')}><Icon name="trash" size={16} /></button>
            </div>
          </li>
        ))}
      </ol>
      <button type="button" className="btn btn-ghost btn-sm mt-3" onClick={() => onChange([...items, { ...empty }])}><Icon name="plus" size={16} />{t('admin.addRow')}</button>
    </fieldset>
  );
}

export default function ServiceEditor() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const { t, to } = useLocale();
  const nav = useNavigate();
  const { services, categories, reload, loading } = useAdmin();
  const [s, setS] = useState<Partial<Service>>(blank());
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (isNew) { setS({ ...blank(), category_id: categories[0]?.id || '' }); return; }
    const found = services.find((x) => x.id === id);
    if (found) setS(found);
  }, [id, isNew, services, categories]);

  const set = <K extends keyof Service>(k: K, v: Service[K]) => setS((p) => ({ ...p, [k]: v }));
  const text = (k: keyof Service, label: string, long = false, dir?: 'rtl' | 'ltr') => (
    <Field id={`f-${k}`} label={label}>
      {long
        ? <textarea id={`f-${k}`} className="textarea" dir={dir} value={(s[k] as string) || ''} onChange={(e) => set(k, e.target.value as never)} />
        : <input id={`f-${k}`} className="input" dir={dir} value={(s[k] as string) || ''} onChange={(e) => set(k, e.target.value as never)} />}
    </Field>
  );

  const save = async () => {
    if (!supabase) return;
    setState('saving'); setErr('');
    const slug = s.slug?.trim() || slugify(s.title_en || '');
    if (!slug || !s.title_ar || !s.title_en || !s.category_id) { setState('error'); setErr(t('admin.error')); return; }
    const row = toRow({ ...s, slug });
    const res = isNew ? await supabase.from('services').insert(row).select('id').single() : await supabase.from('services').update(row).eq('id', id!).select('id').single();
    if (res.error) { setState('error'); setErr(res.error.message); return; }
    resetCatalogCache(); await reload(); setState('saved');
    if (isNew) nav(to(`/admin/services/${(res.data as { id: string }).id}`), { replace: true });
  };

  if (loading) return <p className="text-muted">{t('admin.loading')}</p>;

  return (
    <form onSubmit={(e) => { e.preventDefault(); save(); }} className="max-w-4xl space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {text('title_ar', t('admin.f.titleAr'), false, 'rtl')}
        {text('title_en', t('admin.f.titleEn'), false, 'ltr')}
        {text('summary_ar', t('admin.f.summaryAr'), true, 'rtl')}
        {text('summary_en', t('admin.f.summaryEn'), true, 'ltr')}
        {text('slug', t('admin.f.slug'), false, 'ltr')}
        <Field id="f-cat" label={t('admin.f.category')}>
          <select id="f-cat" className="select" value={s.category_id || ''} onChange={(e) => set('category_id', e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.title_en} / {c.title_ar}</option>)}
          </select>
        </Field>
      </div>

      <ListEditor<DocItem & Record<string, string>> title={t('admin.docs')} items={(s.documents || []) as never} onChange={(v) => set('documents', v as DocItem[])}
        empty={{ ar: '', en: '', note_ar: '', note_en: '' }}
        fields={[{ key: 'ar', label: t('admin.docAr'), dir: 'rtl' }, { key: 'en', label: t('admin.docEn'), dir: 'ltr' }, { key: 'note_ar', label: t('admin.noteAr'), dir: 'rtl' }, { key: 'note_en', label: t('admin.noteEn'), dir: 'ltr' }]} />
      <ListEditor<StepItem & Record<string, string>> title={t('admin.steps')} items={(s.steps || []) as never} onChange={(v) => set('steps', v as StepItem[])}
        empty={{ ar: '', en: '', detail_ar: '', detail_en: '' }}
        fields={[{ key: 'ar', label: t('admin.stepAr'), dir: 'rtl' }, { key: 'en', label: t('admin.stepEn'), dir: 'ltr' }, { key: 'detail_ar', label: t('admin.detailAr'), dir: 'rtl' }, { key: 'detail_en', label: t('admin.detailEn'), dir: 'ltr' }]} />

      <div className="grid gap-4 md:grid-cols-2">
        {text('fees_ar', t('admin.f.feesAr'), false, 'rtl')}{text('fees_en', t('admin.f.feesEn'), false, 'ltr')}
        {text('duration_ar', t('admin.f.durationAr'), false, 'rtl')}{text('duration_en', t('admin.f.durationEn'), false, 'ltr')}
        {text('location_ar', t('admin.f.locationAr'), false, 'rtl')}{text('location_en', t('admin.f.locationEn'), false, 'ltr')}
      </div>

      <ListEditor<LinkItem & Record<string, string>> title={t('admin.links')} items={(s.links || []) as never} onChange={(v) => set('links', v as LinkItem[])}
        empty={{ label_ar: '', label_en: '', url: 'https://' }}
        fields={[{ key: 'label_ar', label: t('admin.labelAr'), dir: 'rtl' }, { key: 'label_en', label: t('admin.labelEn'), dir: 'ltr' }, { key: 'url', label: t('admin.url'), dir: 'ltr' }]} />

      <div className="grid gap-4 md:grid-cols-2">
        {text('tips_ar', t('admin.f.tipsAr'), true, 'rtl')}{text('tips_en', t('admin.f.tipsEn'), true, 'ltr')}
      </div>

      <fieldset className="grid gap-4 rounded-xl border border-line p-4 md:grid-cols-4">
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!s.published} onChange={(e) => set('published', e.target.checked)} />{t('admin.published')}</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!s.popular} onChange={(e) => set('popular', e.target.checked)} />{t('admin.f.popular')}</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!s.needs_review} onChange={(e) => set('needs_review', e.target.checked)} />{t('admin.needsReview')}</label>
        <div>
          <label htmlFor="f-lv" className="label">{t('admin.lastVerified')}</label>
          <div className="flex gap-2">
            <input id="f-lv" type="date" className="input" value={s.last_verified || ''} onChange={(e) => set('last_verified', e.target.value || null)} />
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { set('last_verified', new Date().toISOString().slice(0, 10)); set('needs_review', false); }}>{t('admin.markVerified')}</button>
          </div>
        </div>
      </fieldset>

      <div className="sticky bottom-0 -mx-4 flex items-center gap-3 border-t border-line bg-[color:var(--bg)] p-4">
        <button type="submit" className="btn btn-primary" disabled={state === 'saving'}>{state === 'saving' ? t('admin.saving') : t('admin.save')}</button>
        <button type="button" className="btn btn-ghost" onClick={() => nav(to('/admin/services'))}>{t('admin.cancel')}</button>
        <span role="status" className={state === 'error' ? 'text-danger' : 'text-[color:var(--ok)]'}>{state === 'saved' ? t('admin.saved') : state === 'error' ? err : ''}</span>
      </div>
    </form>
  );
}
