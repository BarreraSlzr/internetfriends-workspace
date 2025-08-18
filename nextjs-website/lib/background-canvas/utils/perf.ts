export function now() { return (typeof performance !== 'undefined' ? performance.now() : Date.now()); }

export function fpsToMs(fps: number) { return 1000 / Math.max(1, fps); }

export function shouldAnimate(): boolean {
  if (typeof document === 'undefined') return false;
  if (document.hidden) return false;
  const m = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  return !(m && m.matches);
}
