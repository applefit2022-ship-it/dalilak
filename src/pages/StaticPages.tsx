import { useRef, useState, type FormEvent } from 'react';
import { useLocale } from '../lib/useLocale';
import { config } from '../lib/config';
import { inlineStart, useAnim } from '../lib/anim';
import Seo from '../components/Seo';
import Disclaimer from '../components/Disclaimer';

type Key = 'about' | 'privacy' | 'terms';

export function TextPage({ k }: { k: Key }) {
  const { t } = useLocale();
  const root = useRef<HTMLDivElement>(null);
  const body = t(`${k}.body`, { returnObjects: true }) as unknown as string[];
  useAnim(root, ({ gsap }) => {
    gsap.fromTo('.tp-a', { opacity: 0, x: inlineStart(16) }, { opacity: 1, x: 0, stagger: 0.07, duration: 0.5 });
  }, [k]);
  return (
    <div ref={root} className="container-page py-12 md:py-16">
      <Seo title={t(`${k}.title`)} description={t(`${k}.metaDesc`)} path={`/${k}`} />
      <div className="max-w-prose prose-block">
        <h1 className="tp-a rv text-2xl md:text-3xl">{t(`${k}.title`)}</h1>
        <span className="tp-a rv rule-gold mb-8 mt-3" />
        {Array.isArray(body) && body.map((p, i) => <p key={i} className="tp-a rv">{p}</p>)}
        {(k === 'terms' || k === 'about') && <Disclaimer className="tp-a rv mt-8" />}
      </div>
    </div>
  );
}

export function Contact() {
  const { t } = useLocale();
  const root = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  useAnim(root, ({ gsap }) => {
    gsap.fromTo('.ct-a', { opacity: 0, x: inlineStart(16) }, { opacity: 1, x: 0, stagger: 0.07, duration: 0.5 });
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const body = `${message}\n\n— ${name} <${email}>`;
    window.location.href = `mailto:${config.contactEmail}?subject=${encodeURIComponent(t('contact.subject'))}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div ref={root} className="container-page py-12 md:py-16">
      <Seo title={t('contact.title')} description={t('contact.metaDesc')} path="/contact" />
      <div className="max-w-xl">
        <h1 className="ct-a rv text-2xl md:text-3xl">{t('contact.title')}</h1>
        <span className="ct-a rv rule-gold mt-3" />
        <p className="ct-a rv mt-6 text-muted">{t('contact.intro')}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="ct-a rv"><label htmlFor="c-n" className="label">{t('contact.name')}</label><input id="c-n" className="input" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></div>
          <div className="ct-a rv"><label htmlFor="c-e" className="label">{t('contact.email')}</label><input id="c-e" type="email" dir="ltr" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
          <div className="ct-a rv"><label htmlFor="c-m" className="label">{t('contact.message')}</label><textarea id="c-m" className="textarea" required value={message} onChange={(e) => setMessage(e.target.value)} /></div>
          <button type="submit" className="ct-a rv btn btn-primary">{t('contact.send')}</button>
          <p className="ct-a rv text-sm text-muted">{t('contact.note')}</p>
        </form>
        <p className="ct-a rv mt-8 text-sm">{t('contact.direct')} <a href={`mailto:${config.contactEmail}`} dir="ltr">{config.contactEmail}</a></p>
      </div>
    </div>
  );
}
