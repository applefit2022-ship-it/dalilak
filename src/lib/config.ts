const env = import.meta.env;

export const config = {
  /** Single flag that turns the (reserved) ad slots on. No ad network is integrated in v1. */
  adsEnabled: false,
  supabaseUrl: (env.VITE_SUPABASE_URL as string | undefined) || '',
  supabaseAnonKey: (env.VITE_SUPABASE_ANON_KEY as string | undefined) || '',
  googleAuth: env.VITE_GOOGLE_AUTH === 'true',
  contactEmail: (env.VITE_CONTACT_EMAIL as string | undefined) || 'hello@example.com',
  base: (env.BASE_URL as string) || '/',
};

export const supabaseConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey);
