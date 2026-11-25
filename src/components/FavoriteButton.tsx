import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../lib/userdata';
import { useLocale } from '../lib/useLocale';
import { pop } from '../lib/anim';
import Icon from './Icon';
import Modal from './Modal';

export default function FavoriteButton({ serviceId }: { serviceId: string }) {
  const { t, to } = useLocale();
  const { favorites, toggle } = useFavorites();
  const [prompt, setPrompt] = useState(false);
  const icon = useRef<HTMLSpanElement>(null);
  const saved = favorites.has(serviceId);

  const onClick = async () => {
    const r = await toggle(serviceId);
    if (r === 'auth') setPrompt(true);
    else if (r === 'added') pop(icon.current);
  };

  return (
    <>
      <button type="button" className={`btn ${saved ? 'btn-primary' : 'btn-ghost'}`} onClick={onClick} aria-pressed={saved}>
        <span ref={icon} className="grid"><Icon name="heart" filled={saved} size={20} /></span>
        {saved ? t('service.saved') : t('service.save')}
      </button>
      {prompt && (
        <Modal title={t('prompt.title')} onClose={() => setPrompt(false)}>
          <p className="m-0 text-muted">{t('prompt.body')}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to={to('/login')} className="btn btn-primary no-underline">{t('nav.login')}</Link>
            <Link to={to('/signup')} className="btn btn-ghost no-underline">{t('nav.signup')}</Link>
            <button type="button" className="btn btn-quiet" onClick={() => setPrompt(false)}>{t('prompt.cancel')}</button>
          </div>
        </Modal>
      )}
    </>
  );
}
