import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import { storedLang } from './i18n';
import { useLocale } from './lib/useLocale';

// Lazy routes (code-splitting). Home is eager for the fastest first paint.
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const Favorites = lazy(() => import('./pages/Favorites'));
const Auth = lazy(() => import('./pages/Auth'));
const NotFound = lazy(() => import('./pages/NotFound'));
const TextPage = lazy(() => import('./pages/StaticPages').then((m) => ({ default: m.TextPage })));
const Contact = lazy(() => import('./pages/StaticPages').then((m) => ({ default: m.Contact })));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ServicesAdmin = lazy(() => import('./pages/admin/ServicesAdmin'));
const ServiceEditor = lazy(() => import('./pages/admin/ServiceEditor'));
const CategoriesAdmin = lazy(() => import('./pages/admin/CategoriesAdmin'));
const ImportExport = lazy(() => import('./pages/admin/ImportExport'));

function Fallback() {
  const { t } = useLocale();
  return <div className="container-page py-20 text-center text-muted" role="status">{t('common.loading')}</div>;
}

export default function App() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/" element={<Navigate to={`/${storedLang()}`} replace />} />
        <Route path="/:lang" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="services/:slug" element={<ServiceDetail />} />
          <Route path="category/:slug" element={<Services byCategoryRoute />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="login" element={<Auth mode="login" />} />
          <Route path="signup" element={<Auth mode="signup" />} />
          <Route path="reset" element={<Auth mode="reset" />} />
          <Route path="about" element={<TextPage k="about" />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<TextPage k="privacy" />} />
          <Route path="terms" element={<TextPage k="terms" />} />
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="services" element={<ServicesAdmin />} />
            <Route path="services/:id" element={<ServiceEditor />} />
            <Route path="categories" element={<CategoriesAdmin />} />
            <Route path="import-export" element={<ImportExport />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<Layout />}>
          <Route path="*" element={null} />
        </Route>
      </Routes>
    </Suspense>
  );
}
