import { useEffect, type RefObject } from 'react';
import type gsapType from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';

/* GSAP is loaded lazily (dynamic import) so it never blocks first paint.
 * Only core + ScrollTrigger (both free) are used. Easing is ease-out only: no bounce/elastic. */

export interface G { gsap: typeof gsapType; ScrollTrigger: typeof ScrollTriggerType }

let loader: Promise<G> | null = null;
export function loadGsap(): Promise<G> {
  if (!loader) {
    loader = Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([g, st]) => {
      const gsap = g.gsap || (g as any).default;
      const ScrollTrigger = st.ScrollTrigger || (st as any).default;
      gsap.registerPlugin(ScrollTrigger);
      gsap.defaults({ ease: 'power3.out', duration: 0.5 });
      return { gsap, ScrollTrigger };
    });
  }
  return loader;
}

export const prefersReduced = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Offset towards the inline-start edge: from the left in LTR, from the right in RTL. */
export const inlineStart = (px: number) => (document.documentElement.dir === 'rtl' ? px : -px);

export const EASE = 'power3.out';

/** Motion switch read by CSS (`html[data-motion=on] .rv {opacity:0}`) so content never flashes. */
export function initMotionFlag() {
  const el = document.documentElement;
  el.dataset.motion = prefersReduced() ? 'off' : 'on';
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', (e) => {
    el.dataset.motion = e.matches ? 'off' : 'on';
  });
}

/** Run GSAP code inside a gsap.context bound to `scope`; everything (tweens + ScrollTriggers) is reverted on unmount. */
export function useAnim(scope: RefObject<HTMLElement | null>, fn: (g: G, root: HTMLElement) => void, deps: unknown[] = []) {
  useEffect(() => {
    if (prefersReduced()) return;
    let dead = false;
    let ctx: { revert: () => void } | undefined;
    loadGsap()
      .then((g) => {
        if (dead || !scope.current) return;
        const root = scope.current;
        ctx = g.gsap.context(() => fn(g, root), root);
      })
      .catch(() => { document.documentElement.dataset.motion = 'off'; });
    return () => { dead = true; ctx?.revert(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Standard scroll-triggered reveal for every `.rv` element inside `root` that is not part of a custom animation. */
export function revealOnScroll({ gsap, ScrollTrigger }: G, root: HTMLElement, selector = '.rv-scroll') {
  const items = gsap.utils.toArray<HTMLElement>(root.querySelectorAll(selector));
  if (!items.length) return;
  ScrollTrigger.batch(items, {
    start: 'top 92%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, overwrite: true }),
  });
  gsap.set(items, { y: 18 });
}

/** Staggered entrance for a set of freshly rendered elements (search results, lists). */
export function staggerIn(g: G, els: Element[] | NodeListOf<Element>, opts: { y?: number; x?: number; stagger?: number } = {}) {
  const list = Array.from(els).slice(0, 24);
  if (!list.length) return;
  g.gsap.fromTo(list, { opacity: 0, y: opts.y ?? 12, x: opts.x ?? 0 },
    { opacity: 1, y: 0, x: 0, duration: 0.4, stagger: opts.stagger ?? 0.035, clearProps: 'transform', overwrite: 'auto' });
}

/** Small one-shot helpers (fire & forget, no-op under reduced motion). */
export async function pop(el: Element | null) {
  if (!el || prefersReduced()) return;
  const { gsap } = await loadGsap();
  gsap.fromTo(el, { scale: 0.72 }, { scale: 1, duration: 0.45, ease: 'expo.out', clearProps: 'transform' });
}

export async function spin(el: Element | null, deg = 180) {
  if (!el || prefersReduced()) return;
  const { gsap } = await loadGsap();
  gsap.fromTo(el, { rotate: -deg, opacity: 0.2 }, { rotate: 0, opacity: 1, duration: 0.5, ease: 'expo.out', clearProps: 'transform' });
}

export async function drawTick(path: SVGPathElement | null) {
  if (!path || prefersReduced()) return;
  const { gsap } = await loadGsap();
  const len = path.getTotalLength?.() || 24;
  gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.28, ease: 'power2.out', clearProps: 'strokeDasharray,strokeDashoffset' });
}

export async function countTo(el: HTMLElement | null, to: number) {
  if (!el) return;
  if (prefersReduced()) { el.textContent = String(to); return; }
  const { gsap } = await loadGsap();
  const o = { v: 0 };
  gsap.to(o, { v: to, duration: 0.9, ease: 'power2.out', onUpdate: () => { el.textContent = String(Math.round(o.v)); } });
}

/** Global press feedback on any `.btn` / `[data-press]` (event delegation, installed once). */
export function installPressFeedback() {
  if (prefersReduced()) return () => {};
  let active: HTMLElement | null = null;
  const down = async (e: PointerEvent) => {
    const t = (e.target as HTMLElement)?.closest?.('.btn, [data-press]') as HTMLElement | null;
    if (!t || (t as HTMLButtonElement).disabled) return;
    active = t;
    const { gsap } = await loadGsap();
    gsap.to(t, { scale: 0.965, duration: 0.12, ease: 'power2.out', overwrite: 'auto' });
  };
  const up = async () => {
    if (!active) return;
    const t = active; active = null;
    const { gsap } = await loadGsap();
    gsap.to(t, { scale: 1, duration: 0.3, ease: 'power3.out', overwrite: 'auto', clearProps: 'transform' });
  };
  document.addEventListener('pointerdown', down, { passive: true });
  document.addEventListener('pointerup', up, { passive: true });
  document.addEventListener('pointercancel', up, { passive: true });
  return () => {
    document.removeEventListener('pointerdown', down);
    document.removeEventListener('pointerup', up);
    document.removeEventListener('pointercancel', up);
  };
}
