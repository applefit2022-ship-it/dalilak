import { supabase } from '../../lib/supabase';
import type { Category, Service } from '../../lib/types';

/** Admin reads include unpublished rows (RLS lets admins see everything). */
export async function fetchAdminAll(): Promise<{ categories: Category[]; services: Service[] }> {
  if (!supabase) throw new Error('not-configured');
  const [c, s] = await Promise.all([
    supabase.from('categories').select('*').order('position'),
    supabase.from('services').select('*').order('updated_at', { ascending: false }),
  ]);
  if (c.error) throw c.error;
  if (s.error) throw s.error;
  const slugById = new Map<string, string>((c.data as Category[]).map((x) => [x.id, x.slug]));
  const services = (s.data as Service[]).map((x) => ({ ...x, category: slugById.get(x.category_id) || '' }));
  return { categories: c.data as Category[], services };
}

/** Strip client-only fields before writing. */
export function toRow(s: Partial<Service>) {
  const { category, id, updated_at, ...rest } = s as Service;
  void category; void updated_at;
  return id ? { id, ...rest } : rest;
}
