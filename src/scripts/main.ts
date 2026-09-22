// Small, always-on behaviour. Heavier scroll effects (Lenis + GSAP) live in
// motion.ts and are loaded after first paint, only when motion is allowed.

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── Lazy looping clips: load when near the viewport, pause when off-screen ──
const clips = document.querySelectorAll<HTMLVideoElement>('video[data-lazy-video]');
if (clips.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        const v = target as HTMLVideoElement;
        if (isIntersecting) {
          if (!v.src && v.dataset.src) {
            v.src = v.dataset.src;
            v.preload = 'auto';
          }
          if (reduceMotion) v.controls = true;
          else v.play().catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    },
    { rootMargin: '200px 0px' },
  );
  clips.forEach((v) => io.observe(v));
}

// ── BibTeX buttons copy the entry to the clipboard ──
document.querySelectorAll<HTMLButtonElement>('[data-bibtex]').forEach((btn) => {
  const label = btn.querySelector<HTMLElement>('[data-bibtex-label]');
  btn.addEventListener('click', async () => {
    let text = 'Copied!';
    try {
      await navigator.clipboard.writeText(btn.dataset.bibtex ?? '');
    } catch {
      text = 'Copy failed';
    }
    if (label) {
      label.textContent = text;
      setTimeout(() => (label.textContent = 'BibTeX'), 1600);
    }
  });
});

// ── Scroll effects, after the page has loaded ──
if (!reduceMotion) {
  const start = () => import('./motion').then((m) => m.initMotion());
  const idle = (cb: () => void) =>
    'requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 1500 }) : setTimeout(cb, 200);
  if (document.readyState === 'complete') idle(start);
  else addEventListener('load', () => idle(start), { once: true });
}
