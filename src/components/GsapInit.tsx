'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

export function GsapInit() {
  const pathname = usePathname();

  useEffect(() => {
    const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (REDUCED) return;

    gsap.registerPlugin(ScrollTrigger);

    const EASE = {
      out: "cubic-bezier(0.22, 1, 0.36, 1)",
      inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
      mask: "cubic-bezier(0.16, 1, 0.30, 1)"
    };
    const DUR = { s: 0.48, m: 0.9, l: 1.4 };

    // Cleanup previous triggers on route change
    ScrollTrigger.getAll().forEach(t => t.kill());

    const maskEls = document.querySelectorAll('[data-motion="mask"]');
    maskEls.forEach(el => {
      gsap.fromTo(
        el,
        { clipPath: "inset(0 0 100% 0)", y: 12 },
        {
          clipPath: "inset(0 0 0% 0)",
          y: 0,
          duration: DUR.l,
          ease: EASE.mask,
          scrollTrigger: { trigger: el, start: "top 82%", once: true }
        }
      );
    });

    const hairlineEls = document.querySelectorAll('[data-motion="hairline"]');
    hairlineEls.forEach(el => {
      gsap.set(el, { transformOrigin: "left" });
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: DUR.m,
          ease: EASE.out,
          scrollTrigger: { trigger: el, start: "top 88%", once: true }
        }
      );
    });

    const parallaxEls = document.querySelectorAll('[data-motion="parallax"]');
    parallaxEls.forEach(el => {
      const amount = parseFloat(el.getAttribute("data-parallax") || "0.12");
      const element = el as HTMLElement;
      const shift = (element.offsetHeight || window.innerHeight) * amount;
      gsap.fromTo(
        el,
        { y: -shift / 2 },
        {
          y: shift / 2,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement || el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.1
          }
        }
      );
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { ScrollTrigger.refresh(); });
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [pathname]);

  return null;
}
