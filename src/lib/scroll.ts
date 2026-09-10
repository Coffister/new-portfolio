import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let lenisInstance: Lenis | null = null;
let rafHandler: ((time: number) => void) | null = null;
let initialized = false;

export function initializeScrollSystem() {
  if (initialized || typeof window === "undefined") {
    return lenisInstance;
  }

  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({
    duration: 1.5,
    smoothWheel: true,
    // Touch scrolling is left native (Lenis default) — smoothing it fights
    // the browser's momentum scroll on mobile.
    syncTouch: false,
    gestureOrientation: "vertical",
    orientation: "vertical",
  });

  rafHandler = (time: number) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(rafHandler);
  gsap.ticker.lagSmoothing(0);
  lenis.on("scroll", ScrollTrigger.update);

  lenisInstance = lenis;
  initialized = true;

  return lenis;
}

export function getLenis() {
  return lenisInstance;
}

/** Smoothly scrolls to a section by id, using Lenis when available. */
export function scrollToSection(id: string, offset = -80) {
  if (typeof document === "undefined") return;

  const target = document.getElementById(id);
  if (!target) return;

  if (lenisInstance) {
    lenisInstance.scrollTo(target, { offset });
  } else {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function destroyScrollSystem() {
  if (!initialized || !lenisInstance || !rafHandler) {
    return;
  }

  gsap.ticker.remove(rafHandler);
  lenisInstance.off("scroll", ScrollTrigger.update);
  lenisInstance.destroy();

  lenisInstance = null;
  rafHandler = null;
  initialized = false;
}
