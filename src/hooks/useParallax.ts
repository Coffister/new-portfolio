import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initializeScrollSystem, getLenis } from "@/lib/scroll";

export interface ParallaxOptions {
  // Vertical travel as a percentage of the element's own height (negative moves up).
  speed?: number;
  scrub?: boolean | number;
  // Element whose scroll pass drives the animation (defaults to the moving element itself).
  trigger?: RefObject<HTMLElement | null>;
  start?: string;
  end?: string;
}

const defaultOptions: Required<Omit<ParallaxOptions, "trigger">> = {
  speed: -20,
  scrub: true,
  start: "top bottom",
  end: "bottom top",
};

export function useParallax<T extends HTMLElement = HTMLElement>(options: ParallaxOptions = {}) {
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    initializeScrollSystem();

    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotionQuery.matches) {
      gsap.set(element, { yPercent: 0 });
      return;
    }

    const config = { ...defaultOptions, ...options };
    const triggerElement = options.trigger?.current ?? element;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        element,
        { yPercent: -config.speed / 2 },
        {
          yPercent: config.speed / 2,
          ease: "none",
          scrollTrigger: {
            trigger: triggerElement,
            start: config.start,
            end: config.end,
            scrub: config.scrub,
          },
        },
      );
    });

    const lenis = getLenis();
    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
    }

    return () => {
      ctx.revert();
      const lenis = getLenis();
      if (lenis) {
        lenis.off("scroll", ScrollTrigger.update);
      }
    };
  }, [options.speed, options.scrub, options.trigger, options.start, options.end]);

  return elementRef;
}
