import { useState } from 'react';
import { useLocale } from '../../lib/useLocale';
import { supabase } from '../../lib/supabase';
import { resetCatalogCache } from '../../lib/data';
import { useAdmin } from './AdminLayout';

/** Export / import format: { "categories": [...], "services": [{ ..., "category": "<category slug>" }] }
 *  (same shape as src/data/seed.json). Import upserts by slug; categories are matched/created by slug. */
export default function ImportExport() {
  const { t } = useLocale();
  const { services, categories, reload } = useAdmin();
  const [text, setText] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const doExport = () => {
    const payload = {
      categories: categories.map(({ id, ...c }) => c),
      services: services.map(({ id, category_id, updated_at, ...s }) => s),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dalilak-services-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const onFile = async (f: File | undefined) => { if (f) setText(await f.text()); };

  const doImport = async () => {
    if (!supabase) return;
    try {
      const data = JSON.parse(text);
      const cats: any[] = Array.isArray(data.categories) ? data.categories : [];
      const svcs: any[] = Array.isArray(data.services) ? data.services : Array.isArray(data) ? data : [];
      if (cats.length) {
        const { error } = await supabase.from('categories').upsert(cats.map(({ id, ...c }) => c), { onConflict: 'slug' });
        if (error) throw error;
      }
      const { data: allCats, error: ce } = await supabase.from('categories').select('id,slug');
      if (ce) throw ce;
      const idBySlug = new Map((allCats || []).map((c: any) => [c.slug, c.id]));
      const rows = svcs.map(({ id, category, category_id, updated_at, ...s }) => {
        const cid = idBySlug.get(category) || category_id;
        if (!cid) throw new Error(`Unknown category for service "${s.slug}"`);
        return { ...s, category_id: cid };
      });
      const { error } = await supabase.from('services').upsert(rows, { onConflict: 'slug' });
      if (error) throw error;
      resetCatalogCache(); await reload();
      setMsg({ ok: true, text: t('admin.importDone', { n: rows.length }) });
    } catch (e: any) {
      setMsg({ ok: false, text: `${t('admin.importError')}: ${e?.message || e}` });
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <section><button type="button" className="btn btn-primary" onClick={doExport}>{t('admin.export')}</button></section>
      <section className="space-y-3">
        <h2 className="text-xl">{t('admin.import')}</h2>
        <p className="text-sm text-muted">{t('admin.importHint')}</p>
        <div><label htmlFor="imp-f" className="label">{t('admin.chooseFile')}</label><input id="imp-f" type="file" accept="application/json,.json" onChange={(e) => onFile(e.target.files?.[0])} /></div>
        <div><label htmlFor="imp-t" className="label">{t('admin.pasteJson')}</label><textarea id="imp-t" dir="ltr" className="textarea min-h-[12rem] font-mono text-sm" value={text} onChange={(e) => setText(e.target.value)} /></div>
        <button type="button" className="btn btn-primary" disabled={!text.trim()} onClick={doImport}>{t('admin.runImport')}</button>
        {msg && <p role={msg.ok ? 'status' : 'alert'} className={msg.ok ? 'text-[color:var(--ok)]' : 'text-danger'}>{msg.text}</p>}
      </section>
    </div>
  );
}
