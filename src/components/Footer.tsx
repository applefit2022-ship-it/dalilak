import { Link } from 'react-router-dom';
import { useLocale } from '../lib/useLocale';
import AdSlot from './AdSlot';

export default function Footer() {
  const { t, to } = useLocale();
  return (
    <footer role="contentinfo" className="no-print mt-20 border-t border-line bg-raised">
      <div className="container-page py-10">
        <AdSlot id="footer" className="mb-8" />
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="text-lg font-semibold">{t('brand.name')}</p>
            <p className="mt-1 max-w-prose text-sm text-muted">{t('brand.tagline')}</p>
            <p className="mt-4 max-w-prose rounded-lg border border-line bg-surface p-3 text-sm" role="note">{t('disclaimer.footer')}</p>
          </div>
          <nav aria-label={t('footer.explore')}>
            <p className="text-sm font-semibold">{t('footer.explore')}</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="text-muted hover:text-primary" to={to('/services')}>{t('nav.services')}</Link></li>
              <li><Link className="text-muted hover:text-primary" to={to('/favorites')}>{t('nav.favorites')}</Link></li>
              <li><Link className="text-muted hover:text-primary" to={to('/about')}>{t('nav.about')}</Link></li>
              <li><Link className="text-muted hover:text-primary" to={to('/contact')}>{t('nav.contact')}</Link></li>
            </ul>
          </nav>
          <nav aria-label={t('footer.legal')}>
            <p className="text-sm font-semibold">{t('footer.legal')}</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="text-muted hover:text-primary" to={to('/privacy')}>{t('footer.privacy')}</Link></li>
              <li><Link className="text-muted hover:text-primary" to={to('/terms')}>{t('footer.terms')}</Link></li>
            </ul>
          </nav>
        </div>
        <p className="mt-8 border-t border-line pt-5 text-xs text-muted">{t('footer.rights', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
