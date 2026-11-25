import { useRef, useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useLocale } from '../lib/useLocale';
import { useAuth } from '../lib/auth';
import { config } from '../lib/config';
import { inlineStart, useAnim } from '../lib/anim';
import Seo from '../components/Seo';

type Mode = 'login' | 'signup' | 'reset';

export default function Auth({ mode }: { mode: Mode }) {
  const { t, to } = useLocale();
  const { user, enabled, signIn, signUp, signInGoogle, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useAnim(root, ({ gsap }) => {
    gsap.fromTo('.au-a', { opacity: 0, x: inlineStart(16) }, { opacity: 1, x: 0, stagger: 0.07, duration: 0.5 });
  }, [mode]);

  if (user) return <Navigate to={to('/favorites')} replace />;

  const title = mode === 'login' ? t('auth.loginTitle') : mode === 'signup' ? t('auth.signupTitle') : t('auth.resetTitle');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    let err: string | null = null;
    if (mode === 'login') err = await signIn(email, password);
    if (mode === 'signup') {
      err = await signUp(email, password);
      if (!err) setMsg({ kind: 'ok', text: t('auth.checkEmail') });
    }
    if (mode === 'reset') {
      err = await resetPassword(email);
      if (!err) setMsg({ kind: 'ok', text: t('auth.resetSent') });
    }
    if (err) setMsg({ kind: 'err', text: err === 'not-configured' ? t('auth.notConfigured') : err });
    setBusy(false);
  };

  return (
    <div ref={root} className="container-page py-12 md:py-20">
      <Seo title={title} description={t('auth.metaDesc')} path={`/${mode}`} noindex />
      <div className="mx-auto max-w-md">
        <h1 className="au-a rv text-2xl">{title}</h1>
        <span className="au-a rv rule-gold mt-3" />
        {!enabled && <p role="alert" className="au-a rv mt-6 rounded-lg bg-gold-soft p-4 text-sm">{t('auth.notConfigured')}</p>}

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate={false}>
          <div className="au-a rv">
            <label htmlFor="em" className="label">{t('auth.email')}</label>
            <input id="em" type="email" required autoComplete="email" inputMode="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
          </div>
          {mode !== 'reset' && (
            <div className="au-a rv">
              <label htmlFor="pw" className="label">{t('auth.password')}</label>
              <input id="pw" type="password" required minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="input" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" aria-describedby="pw-h" />
              {mode === 'signup' && <p id="pw-h" className="mt-1 text-xs text-muted">{t('auth.passwordHint')}</p>}
            </div>
          )}
          {msg && <p role={msg.kind === 'err' ? 'alert' : 'status'} className={`text-sm ${msg.kind === 'err' ? 'text-danger' : 'text-[color:var(--ok)]'}`}>{msg.text}</p>}
          <button type="submit" disabled={busy || !enabled} className="au-a rv btn btn-primary w-full">
            {mode === 'login' ? t('auth.loginBtn') : mode === 'signup' ? t('auth.signupBtn') : t('auth.resetBtn')}
          </button>
        </form>

        {config.googleAuth && mode !== 'reset' && enabled && (
          <>
            <p className="au-a rv my-5 text-center text-sm text-muted">{t('auth.or')}</p>
            <button type="button" className="au-a rv btn btn-ghost w-full" onClick={async () => { const e = await signInGoogle(); if (e) setMsg({ kind: 'err', text: e }); }}>{t('auth.google')}</button>
          </>
        )}

        <div className="au-a rv mt-8 space-y-2 text-sm">
          {mode === 'login' && (<>
            <p><Link to={to('/reset')}>{t('auth.forgot')}</Link></p>
            <p className="text-muted">{t('auth.noAccount')} <Link to={to('/signup')}>{t('nav.signup')}</Link></p>
          </>)}
          {mode === 'signup' && <p className="text-muted">{t('auth.haveAccount')} <Link to={to('/login')}>{t('nav.login')}</Link></p>}
          {mode === 'reset' && <p><Link to={to('/login')}>{t('auth.backToLogin')}</Link></p>}
        </div>
      </div>
    </div>
  );
}
