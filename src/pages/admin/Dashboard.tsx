import { useEffect, useRef } from 'react';
import { useLocale } from '../../lib/useLocale';
import { countTo } from '../../lib/anim';
import { useAdmin } from './AdminLayout';

export default function Dashboard() {
  const { t } = useLocale();
  const { services, categories, loading } = useAdmin();
  const published = services.filter((s) => s.published).length;
  const stats: [string, number][] = [
    ['services', services.length], ['published', published], ['drafts', services.length - published],
    ['review', services.filter((s) => s.needs_review).length], ['categories', categories.length],
  ];
  const refs = useRef<(HTMLElement | null)[]>([]);
  const key = stats.map((s) => s[1]).join(',');
  useEffect(() => { if (!loading) stats.forEach(([, n], i) => countTo(refs.current[i], n)); /* eslint-disable-next-line */ }, [key, loading]);

  return (
    <dl className="m-0 grid grid-cols-2 gap-4 md:grid-cols-5">
      {stats.map(([k], i) => (
        <div key={k} className="rounded-xl border border-line bg-surface p-5">
          <dt className="text-sm text-muted">{t(`admin.counts.${k}`)}</dt>
          <dd ref={(el) => { refs.current[i] = el; }} className="m-0 mt-1 text-3xl font-semibold tabular-nums" aria-live="polite">0</dd>
        </div>
      ))}
    </dl>
  );
}
