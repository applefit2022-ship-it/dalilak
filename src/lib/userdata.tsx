import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth';

/* ───────── Favorites ─────────
 * Logged-in (Supabase configured): rows in public.favorites (RLS: own rows only).
 * Supabase not configured (seed fallback): localStorage.
 * Guest with Supabase configured: toggle() returns 'auth' so the UI can prompt to sign in. */

const LS_FAV = 'dalilak.favorites';

interface FavCtx {
  favorites: Set<string>;
  toggle: (serviceId: string) => Promise<'added' | 'removed' | 'auth' | 'error'>;
  ready: boolean;
}
const Fav = createContext<FavCtx | null>(null);

function readLocal(): string[] {
  try { return JSON.parse(localStorage.getItem(LS_FAV) || '[]'); } catch { return []; }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    let alive = true;
    (async () => {
      if (!supabase) { setFavorites(new Set(readLocal())); setReady(true); return; }
      if (!user) { setFavorites(new Set()); setReady(true); return; }
      const { data } = await supabase.from('favorites').select('service_id');
      if (alive) { setFavorites(new Set((data || []).map((r: any) => r.service_id))); setReady(true); }
    })();
    return () => { alive = false; };
  }, [user, loading]);

  const toggle = useCallback<FavCtx['toggle']>(async (id) => {
    const has = favorites.has(id);
    const next = new Set(favorites);
    if (!supabase) {
      has ? next.delete(id) : next.add(id);
      setFavorites(next);
      localStorage.setItem(LS_FAV, JSON.stringify([...next]));
      return has ? 'removed' : 'added';
    }
    if (!user) return 'auth';
    has ? next.delete(id) : next.add(id);
    setFavorites(next); // optimistic
    const res = has
      ? await supabase.from('favorites').delete().eq('service_id', id).eq('user_id', user.id)
      : await supabase.from('favorites').insert({ service_id: id, user_id: user.id });
    if (res.error) { setFavorites(favorites); return 'error'; }
    return has ? 'removed' : 'added';
  }, [favorites, user]);

  const value = useMemo(() => ({ favorites, toggle, ready }), [favorites, toggle, ready]);
  return <Fav.Provider value={value}>{children}</Fav.Provider>;
}

export function useFavorites() {
  const v = useContext(Fav);
  if (!v) throw new Error('useFavorites outside provider');
  return v;
}

/* ───────── Checklist state (ticked documents) ─────────
 * Guests / no Supabase: localStorage per service. Logged-in: public.checklist_state (RLS: own rows only). */

export function useChecklist(serviceId: string | undefined) {
  const { user, loading } = useAuth();
  const [checked, setChecked] = useState<number[]>([]);
  const timer = useRef<number | undefined>(undefined);
  const key = serviceId ? `dalilak.check.${serviceId}` : '';

  useEffect(() => {
    if (!serviceId || loading) return;
    let alive = true;
    const local = (() => { try { return JSON.parse(localStorage.getItem(key) || '[]') as number[]; } catch { return []; } })();
    if (!supabase || !user) { setChecked(local); return; }
    supabase.from('checklist_state').select('checked').eq('service_id', serviceId).maybeSingle().then(({ data }) => {
      if (!alive) return;
      setChecked(Array.isArray(data?.checked) ? (data!.checked as number[]) : local);
    });
    return () => { alive = false; };
  }, [serviceId, user, loading, key]);

  const persist = useCallback((next: number[]) => {
    if (!serviceId) return;
    if (!supabase || !user) { localStorage.setItem(key, JSON.stringify(next)); return; }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      supabase!.from('checklist_state').upsert({ user_id: user.id, service_id: serviceId, checked: next }, { onConflict: 'user_id,service_id' });
    }, 400);
  }, [serviceId, user, key]);

  const toggle = useCallback((i: number) => {
    setChecked((prev) => {
      const next = prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i];
      persist(next);
      return next;
    });
  }, [persist]);

  const clear = useCallback(() => { setChecked([]); persist([]); }, [persist]);
  return { checked, toggle, clear };
}
