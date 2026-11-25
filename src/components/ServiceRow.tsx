import { Link } from 'react-router-dom';
import { useLocale } from '../lib/useLocale';
import { pick, type Category, type Service } from '../lib/types';
import Icon from './Icon';

export default function ServiceRow({ service, category, className = '' }: { service: Service; category?: Category; className?: string }) {
  const { to, lang } = useLocale();
  return (
    <Link to={to(`/services/${service.slug}`)} className={`row-link ${className}`} data-service-row>
      {category && <span className="tile-icon hidden sm:grid" aria-hidden="true"><Icon name={category.icon} /></span>}
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-ink">{pick(service, 'title', lang)}</span>
        <span className="mt-0.5 block line-clamp-2 text-sm text-muted">{pick(service, 'summary', lang)}</span>
        {category && <span className="mt-1.5 inline-block text-xs font-semibold text-[color:var(--gold-ink)]">{pick(category, 'title', lang)}</span>}
      </span>
      <Icon name="arrow" className="row-arrow flip-rtl" size={20} />
    </Link>
  );
}
