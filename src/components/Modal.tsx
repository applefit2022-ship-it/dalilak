import { useEffect, useRef, type ReactNode } from 'react';
import { loadGsap, prefersReduced } from '../lib/anim';
import { useLocale } from '../lib/useLocale';
import Icon from './Icon';

/** Accessible modal dialog: focus trap, Esc to close, animated in with GSAP. */
export default function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const { t } = useLocale();
  const box = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const focusables = () => box.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])') ?? [];
    focusables()[0]?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const f = Array.from(focusables());
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', key);
    document.body.style.overflow = 'hidden';

    let dead = false;
    if (!prefersReduced()) {
      loadGsap().then(({ gsap }) => {
        if (dead) return;
        if (veil.current) gsap.fromTo(veil.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
        if (box.current) gsap.fromTo(box.current, { opacity: 0, y: 18, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.32, clearProps: 'transform' });
      });
    }
    return () => { dead = true; document.removeEventListener('keydown', key); document.body.style.overflow = ''; prev?.focus?.(); };
  }, [onClose]);

  return (
    <div className="no-print fixed inset-0 z-50 grid place-items-center p-4">
      <div ref={veil} className="absolute inset-0 bg-[color:var(--ink)]/50" onClick={onClose} aria-hidden="true" />
      <div ref={box} role="dialog" aria-modal="true" aria-label={title} className="relative w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-[var(--shadow)]">
        <button type="button" className="btn btn-quiet absolute end-2 top-2" onClick={onClose} aria-label={t('common.close')}><Icon name="close" /></button>
        <h2 className="pe-10 text-xl">{title}</h2>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
