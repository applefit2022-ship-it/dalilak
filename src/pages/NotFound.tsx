import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { useLocale } from '../lib/useLocale';
import { useAnim } from '../lib/anim';
import Seo from '../components/Seo';

export default function NotFound() {
  const { t, to } = useLocale();
  const root = useRef<HTMLDivElement>(null);
  useAnim(root, ({ gsap }) => {
    gsap.fromTo('.nf-a', { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.55 });
  }, []);
  return (
    <div ref={root} className="container-page py-24 text-center">
      <Seo title={t('notFound.title')} description={t('notFound.body')} path="/404" noindex />
      <p className="nf-a rv text-7xl font-semibold text-primary" aria-hidden="true">404</p>
      <h1 className="nf-a rv mt-4 text-2xl">{t('notFound.title')}</h1>
      <p className="nf-a rv mx-auto mt-2 max-w-md text-muted">{t('notFound.body')}</p>
      <Link to={to('')} className="nf-a rv btn btn-primary mt-8 no-underline">{t('notFound.home')}</Link>
    </div>
  );
}
