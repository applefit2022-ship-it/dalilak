import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH is set by the GitHub Actions workflow (e.g. "/dalilak/" for project pages, "/" for user pages / custom domain).
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          i18n: ['i18next', 'react-i18next'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});
