import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initializeScrollSystem, getLenis } from "@/lib/scroll";

export interface ScrollRevealOptions {
  target?: "self" | "children";

  y?: number;
  blur?: number;
  scale?: number;
  opacity?: number;

  start?: string;
  end?: string;

  scrub?: boolean | number;

  stagger?: number;

  once?: boolean;

  markers?: boolean;
}

const defaultOptions: Required<Pick<ScrollRevealOptions, "target" | "y" | "blur" | "scale" | "opacity" | "start" | "end" | "scrub" | "stagger" | "once" | "markers">> = {
  target: "self",
  y: 48,
  blur: 10,
  scale: 1,
  opacity: 0,
  start: "top 85%",
  end: "top 35%",
  scrub: 0.6,
  stagger: 0,
  once: false,
  markers: false,
};

export function useScrollReveal<T extends HTMLElement = HTMLElement>(options: ScrollRevealOptions = {}) {
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    initializeScrollSystem();

    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotionQuery.matches) {
      gsap.set(element, {
        opacity: 1,
        filter: "blur(0px)",
        x: 0,
        y: 0,
        scale: 1,
      });
      return;
    }

    const ctx = gsap.context(() => {
      const targets = options.target === "children"
        ? Array.from(element.children)
        : [element];

      if (targets.length === 0) {
        return;
      }

      const config = {
        ...defaultOptions,
        ...options,
      };

      const revealTargets = targets.filter((child): child is HTMLElement => child instanceof HTMLElement);

      if (!revealTargets.length) {
        return;
      }

      gsap.set(revealTargets, {
        opacity: config.opacity,
        filter: `blur(${config.blur}px)`,
        y: config.y,
        scale: config.scale,
      });

      const tween = gsap.to(revealTargets, {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        scale: 1,
        duration: 1,
        ease: "none",
        stagger: config.stagger,
        paused: true,
        overwrite: true,
      });

      const trigger = ScrollTrigger.create({
        trigger: element,
        start: config.start,
        end: config.end,
        scrub: config.scrub,
        markers: config.markers,
        once: config.once,
        onUpdate: (self) => {
          const progress = self.progress;
          tween.progress(progress);
        },
        onToggle: (self) => {
          if (config.once && self.isActive === false && self.progress >= 1) {
            ScrollTrigger.getAll().forEach((triggerInstance) => {
              if (triggerInstance === trigger) {
                return;
              }
            });
          }
        },
      });

      return () => {
        trigger.kill();
        tween.kill();
      };
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
  }, [options.target, options.y, options.blur, options.scale, options.opacity, options.start, options.end, options.scrub, options.stagger, options.once, options.markers]);

  return elementRef;
}
