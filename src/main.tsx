import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './i18n';
import './index.css';
import App from './App';
import { AuthProvider } from './lib/auth';
import { CatalogProvider } from './lib/catalog';
import { FavoritesProvider } from './lib/userdata';
import { initMotionFlag } from './lib/anim';

initMotionFlag();

// BrowserRouter + prerendered route folders + 404.html fallback (see README) keeps deep links working on GitHub Pages.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <AuthProvider>
        <CatalogProvider>
          <FavoritesProvider>
            <App />
          </FavoritesProvider>
        </CatalogProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
