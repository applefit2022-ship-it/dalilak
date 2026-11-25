import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config, supabaseConfigured } from './config';

/** null when Supabase env vars are missing → the site runs in "seed-only" fallback mode. */
export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;
