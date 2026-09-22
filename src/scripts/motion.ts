// Scroll experience modelled on lonsdale.fr: Lenis smooth wheel scrolling
// (native touch scrolling on phones) + GSAP ScrollTrigger effects tied to
// scroll position. Only loaded when prefers-reduced-motion is off.
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

export function initMotion() {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  // Smooth wheel scrolling. Same defaults Lonsdale uses: lerp 0.1,
  // smoothWheel on, syncTouch off (phones keep native momentum scrolling).
  const navHeight = document.querySelector<HTMLElement>('[data-nav]')?.offsetHeight ?? 64;
  const lenis = new Lenis({ anchors: { offset: -navHeight } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Hero: video drifts and zooms slightly, text lifts and fades as you leave.
  const hero = document.getElementById('top');
  if (hero) {
    gsap.to('[data-hero-media]', {
      scale: 1.08,
      yPercent: 8,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
    gsap.to('[data-hero-content]', {
      y: -80,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: '70% top', scrub: true },
    });
  }

  // Headings: characters light up one after another as they scroll in
  // (Lonsdale's BlurScrollEffect: opacity 0 → 1, stagger 0.05, scrubbed).
  document.querySelectorAll<HTMLElement>('[data-reveal="chars"]').forEach((el) => {
    const split = SplitText.create(el, { type: 'chars,words' });
    gsap.fromTo(
      split.chars,
      { opacity: 0.08 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.05,
        scrollTrigger: { trigger: el, start: 'top bottom-=5%', end: 'bottom center+=20%', scrub: true },
      },
    );
  });

  // About lead paragraph: same idea, word by word, never fully invisible.
  const lead = document.querySelector<HTMLElement>('[data-reveal-first-paragraph] p');
  if (lead) {
    const split = SplitText.create(lead, { type: 'words' });
    gsap.fromTo(
      split.words,
      { opacity: 0.18 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.05,
        scrollTrigger: { trigger: lead, start: 'top bottom-=10%', end: 'bottom center', scrub: true },
      },
    );
  }

  // Rows and cards: a short fade-up the first time they enter.
  const items = gsap.utils.toArray<HTMLElement>('[data-reveal="fade"]');
  gsap.set(items, { opacity: 0, y: 28 });
  ScrollTrigger.batch(items, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.08,
        overwrite: true,
        // Drop the leftover transform so the element stops being an isolated
        // layer (lets logo blend modes reach the page background).
        clearProps: 'transform,opacity',
      }),
  });
  // Anything already above the fold (e.g. after a reload mid-page) shows at once.
  ScrollTrigger.refresh();
  items.forEach((el) => {
    if (el.getBoundingClientRect().top < innerHeight * 0.9) gsap.set(el, { clearProps: 'transform,opacity' });
  });
}
