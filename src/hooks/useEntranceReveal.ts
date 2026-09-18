import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export interface EntranceRevealOptions {
  target?: "self" | "children";

  y?: number;
  blur?: number;
  opacity?: number;

  duration?: number;
  delay?: number;
  stagger?: number;

  ease?: string;
}

const defaultOptions: Required<EntranceRevealOptions> = {
  target: "self",
  y: 32,
  blur: 10,
  opacity: 0,
  duration: 1,
  delay: 0,
  stagger: 0.15,
  ease: "power3.out",
};

/**
 * Plays a fade/blur/rise-in animation once, on mount — unlike
 * useScrollReveal, which scrubs to scroll position and never gets to play
 * for content that's already in view on load (e.g. a hero at the top of
 * the page).
 */
export function useEntranceReveal<T extends HTMLElement = HTMLElement>(options: EntranceRevealOptions = {}) {
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotionQuery.matches) {
      return;
    }

    const config = { ...defaultOptions, ...options };

    const ctx = gsap.context(() => {
      const targets = config.target === "children"
        ? Array.from(element.children)
        : [element];

      const revealTargets = targets.filter((child): child is HTMLElement => child instanceof HTMLElement);
      if (!revealTargets.length) return;

      gsap.set(revealTargets, {
        opacity: config.opacity,
        filter: `blur(${config.blur}px)`,
        y: config.y,
      });

      gsap.to(revealTargets, {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: config.duration,
        delay: config.delay,
        stagger: config.stagger,
        ease: config.ease,
      });
    });

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.target, options.y, options.blur, options.opacity, options.duration, options.delay, options.stagger, options.ease]);

  return elementRef;
}
