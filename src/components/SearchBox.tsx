import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocale } from '../lib/useLocale';
import Icon from './Icon';

/** Hero search: submits to /services?q=… where results filter instantly. */
export default function SearchBox({ large = false }: { large?: boolean }) {
  const { t, to } = useLocale();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    nav(`${to('/services')}${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
  };
  return (
    <form role="search" onSubmit={submit} className="flex w-full gap-2" aria-label={t('hero.label')}>
      <div className="relative flex-1">
        <Icon name="search" className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search" value={q} onChange={(e) => setQ(e.target.value)} enterKeyHint="search" autoComplete="off"
          placeholder={t('hero.placeholder')} aria-label={t('hero.label')}
          className={`input ps-12 ${large ? 'min-h-[3.5rem] text-lg' : ''}`}
        />
      </div>
      <button type="submit" className={`btn btn-primary ${large ? 'min-h-[3.5rem] px-6' : ''}`}>{t('hero.button')}</button>
    </form>
  );
}
