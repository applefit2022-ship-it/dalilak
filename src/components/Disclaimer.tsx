import { useLocale } from '../lib/useLocale';
import Icon from './Icon';

export default function Disclaimer({ className = '' }: { className?: string }) {
  const { t } = useLocale();
  return (
    <div role="note" className={`disclaimer-box flex gap-3 rounded-lg border border-line bg-gold-soft p-4 text-sm ${className}`} style={{ borderInlineStartWidth: 4, borderInlineStartColor: 'var(--gold)' }}>
      <Icon name="info" size={20} className="mt-0.5 flex-none text-[color:var(--gold-ink)]" />
      <p className="m-0">
        <strong className="font-semibold">{t('disclaimer.title')}: </strong>
        {t('disclaimer.short')}
      </p>
    </div>
  );
}
