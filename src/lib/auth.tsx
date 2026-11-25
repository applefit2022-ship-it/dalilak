import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { config } from './config';

interface AuthCtx {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  enabled: boolean;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signInGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(Boolean(supabase));

  const loadRole = useCallback(async (u: User | null) => {
    if (!supabase || !u) return setIsAdmin(false);
    const { data } = await supabase.from('profiles').select('role').eq('id', u.id).maybeSingle();
    setIsAdmin(data?.role === 'admin');
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      setUser(data.session?.user ?? null);
      await loadRole(data.session?.user ?? null);
      if (alive) setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      // defer to avoid deadlocks inside the auth callback
      setTimeout(() => loadRole(session?.user ?? null), 0);
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, [loadRole]);

  const redirect = `${window.location.origin}${config.base}`;

  const value = useMemo<AuthCtx>(() => ({
    user, isAdmin, loading, enabled: Boolean(supabase),
    signUp: async (email, password) => {
      if (!supabase) return 'not-configured';
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirect } });
      return error ? error.message : null;
    },
    signIn: async (email, password) => {
      if (!supabase) return 'not-configured';
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error ? error.message : null;
    },
    signInGoogle: async () => {
      if (!supabase) return 'not-configured';
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirect } });
      return error ? error.message : null;
    },
    signOut: async () => { if (supabase) await supabase.auth.signOut(); },
    resetPassword: async (email) => {
      if (!supabase) return 'not-configured';
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirect });
      return error ? error.message : null;
    },
  }), [user, isAdmin, loading, redirect]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth outside AuthProvider');
  return v;
}
