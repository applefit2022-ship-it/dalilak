import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../lib/useLocale';
import { useCatalog } from '../lib/catalog';
import { useFavorites } from '../lib/userdata';
import { useAuth } from '../lib/auth';
import { revealOnScroll, useAnim } from '../lib/anim';
import Seo from '../components/Seo';
import Icon from '../components/Icon';
import ServiceRow from '../components/ServiceRow';

export default function Favorites() {
  const { t, to } = useLocale();
  const { catalog } = useCatalog();
  const { favorites, ready } = useFavorites();
  const { user, enabled, loading } = useAuth();
  const root = useRef<HTMLDivElement>(null);
  const items = (catalog?.services ?? []).filter((s) => favorites.has(s.id));
  const catBy = new Map((catalog?.categories ?? []).map((c) => [c.slug, c]));
  const needLogin = enabled && !loading && !user;

  useAnim(root, (g, el) => revealOnScroll(g, el, '.rv-scroll'), [items.length, needLogin]);

  return (
    <div ref={root} className="container-page py-10 md:py-14">
      <Seo title={t('favorites.title')} description={t('favorites.metaDesc')} path="/favorites" noindex />
      <h1 className="text-2xl md:text-3xl">{t('favorites.title')}</h1>

      {needLogin ? (
        <div className="rv-scroll mt-10 max-w-lg">
          <Icon name="heart" size={36} className="text-muted" />
          <h2 className="mt-3 text-xl">{t('favorites.signinNeeded')}</h2>
          <p className="mt-1 text-muted">{t('favorites.signinHint')}</p>
          <div className="mt-5 flex gap-2">
            <Link to={to('/login')} className="btn btn-primary no-underline">{t('nav.login')}</Link>
            <Link to={to('/signup')} className="btn btn-ghost no-underline">{t('nav.signup')}</Link>
          </div>
        </div>
      ) : !ready || loading ? (
        <p className="mt-10 text-muted">{t('common.loading')}</p>
      ) : items.length === 0 ? (
        <div className="rv-scroll mt-10 max-w-lg">
          <Icon name="heart" size={36} className="text-muted" />
          <h2 className="mt-3 text-xl">{t('favorites.empty')}</h2>
          <p className="mt-1 text-muted">{t('favorites.emptyHint')}</p>
          <Link to={to('/services')} className="btn btn-primary mt-5 no-underline">{t('favorites.browse')}</Link>
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-line bg-surface px-3 md:px-5">
          {items.map((s) => <div key={s.id} className="rv-scroll"><ServiceRow service={s} category={catBy.get(s.category)} /></div>)}
        </div>
      )}
    </div>
  );
}
