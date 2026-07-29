"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function ScrollObserver() {
  const pathname = usePathname();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Clear old scroll triggers on route change
    ScrollTrigger.getAll().forEach(t => t.kill());

    const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (REDUCED) return;

    const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
    const EASE_MASK = "cubic-bezier(0.16, 1, 0.30, 1)";
    const DUR = { s: 0.48, m: 0.9, l: 1.4 };

    // 1. maskReveal
    // [data-motion="mask"]
    const maskNodes = document.querySelectorAll('[data-motion="mask"]');
    maskNodes.forEach(el => {
      gsap.fromTo(
        el,
        { clipPath: "inset(0 0 100% 0)", y: 12 },
        {
          clipPath: "inset(0 0 0% 0)",
          y: 0,
          duration: DUR.l,
          ease: EASE_MASK,
          scrollTrigger: { trigger: el, start: "top 82%", once: true }
        }
      );
    });

    // 2. hairlineDraw
    // [data-motion="hairline"]
    const hairNodes = document.querySelectorAll('[data-motion="hairline"]');
    hairNodes.forEach(el => {
      gsap.set(el, { transformOrigin: "left" });
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: DUR.m,
          ease: EASE_OUT,
          scrollTrigger: { trigger: el, start: "top 88%", once: true }
        }
      );
    });

    // 3. slowParallax
    // [data-motion="parallax"]
    const parallaxNodes = document.querySelectorAll('[data-motion="parallax"]');
    parallaxNodes.forEach((el: any) => {
      let amount = parseFloat(el.getAttribute("data-parallax") || "0.12");
      let shift = ((el as HTMLElement).offsetHeight || window.innerHeight) * amount;
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
    
    // Refresh scrolltrigger after fonts load
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { ScrollTrigger.refresh(); });
    }

  }, [pathname]);

  return null;
}
