import seed from '../data/seed.json';
import { supabase } from './supabase';
import type { Catalog, Category, Service } from './types';

/** Seed JSON has no ids/uuid: the slug doubles as the id (also used for localStorage favorites). */
function seedCatalog(): Catalog {
  const categories: Category[] = (seed.categories as Omit<Category, 'id'>[]).map((c) => ({ ...c, id: c.slug }));
  const services: Service[] = (seed.services as any[]).map((s) => ({
    ...s,
    id: s.slug,
    category_id: s.category,
    category: s.category,
  }));
  return { categories, services, source: 'seed' };
}

let cache: Promise<Catalog> | null = null;

/** Public catalogue: published services only (RLS also enforces this server-side). */
export function loadCatalog(force = false): Promise<Catalog> {
  if (cache && !force) return cache;
  cache = (async () => {
    if (!supabase) return seedCatalog();
    try {
      const [c, s] = await Promise.all([
        supabase.from('categories').select('*').order('position'),
        supabase.from('services').select('*').eq('published', true).order('title_en'),
      ]);
      if (c.error || s.error || !c.data || !s.data) throw c.error || s.error;
      if (!c.data.length) return seedCatalog(); // empty database → show bundled content
      const slugById = new Map<string, string>(c.data.map((x: any) => [x.id, x.slug]));
      const services = (s.data as any[]).map((x) => ({ ...x, category: slugById.get(x.category_id) || '' })) as Service[];
      return { categories: c.data as Category[], services, source: 'supabase' as const };
    } catch (e) {
      console.warn('Supabase unavailable, using bundled seed content.', e);
      return seedCatalog();
    }
  })();
  return cache;
}

export function resetCatalogCache() { cache = null; }

/** Seed (used by admin export fallback / prerender consumers). */
export { seedCatalog };
