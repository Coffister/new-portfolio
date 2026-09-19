import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initializeScrollSystem } from "@/lib/scroll";
import chatbubbles from "@/assets/heroicons/Chatbubbles.svg";
import checklist from "@/assets/heroicons/Checklist.svg";
import coffeemug from "@/assets/heroicons/Coffeemug.svg";
import computer from "@/assets/heroicons/Computer.svg";
import growth from "@/assets/heroicons/Growth.svg";
import layout from "@/assets/heroicons/Layout.svg";
import planet from "@/assets/heroicons/Planet.svg";
import styles from "./HeroIcons.module.css";

interface IconSpec {
  id: string;
  src: string;
  // Home position as a percentage of the field's own box.
  xPercent: number;
  yPercent: number;
  // Rendered width in px; height follows the source SVG's own aspect ratio.
  width: number;
  aspectRatio: number;
  // Idle bob, before any cursor/scroll interaction.
  floatAmplitude: number;
  floatSpeed: number;
  floatPhase: number;
  // Total px of vertical drift across the section's own scroll range —
  // bigger values read as "closer to the camera".
  parallaxRange: number;
}

// Spread across the headline — swap/add more icons here as they arrive,
// physics and layout stay the same. Positions can also be dragged into
// place with ?arrange=1 in the URL — see the edit-mode panel below.
const ICONS: IconSpec[] = [
  { id: "coffeemug", src: coffeemug, xPercent: 12.9, yPercent: 37.9, width: 100, aspectRatio: 93 / 90, floatAmplitude: 9, floatSpeed: 0.55, floatPhase: 0, parallaxRange: 70 },
  { id: "chatbubbles", src: chatbubbles, xPercent: 35.8, yPercent: 29.8, width: 78, aspectRatio: 84 / 92, floatAmplitude: 7, floatSpeed: 0.5, floatPhase: 1.4, parallaxRange: 110 },
  { id: "computer", src: computer, xPercent: 81.8, yPercent: 28.6, width: 96, aspectRatio: 93 / 116, floatAmplitude: 10, floatSpeed: 0.42, floatPhase: 2.6, parallaxRange: 55 },
  { id: "planet", src: planet, xPercent: 74.1, yPercent: 48.4, width: 90, aspectRatio: 87 / 107, floatAmplitude: 8, floatSpeed: 0.6, floatPhase: 3.8, parallaxRange: 95 },
  { id: "growth", src: growth, xPercent: 24.5, yPercent: 56.3, width: 76, aspectRatio: 1, floatAmplitude: 6, floatSpeed: 0.65, floatPhase: 0.7, parallaxRange: 130 },
  { id: "layout", src: layout, xPercent: 72.3, yPercent: 62.2, width: 78, aspectRatio: 1, floatAmplitude: 9, floatSpeed: 0.48, floatPhase: 5.1, parallaxRange: 60 },
  { id: "checklist", src: checklist, xPercent: 46.9, yPercent: 49.1, width: 62, aspectRatio: 100 / 84, floatAmplitude: 6, floatSpeed: 0.7, floatPhase: 4.4, parallaxRange: 85 },
];

const REPEL_RADIUS = 170;
const REPEL_STRENGTH = 4200;
const SPRING_STIFFNESS = 55;
const DAMPING = 7;

// Separate, smaller radius for the hover "pop" — it should feel like the
// icon notices the cursor a beat before it actually gets shoved aside.
const HOVER_RADIUS = 150;
const HOVER_SCALE = 0.16;

// Icons used to appear instantly on mount, before the SplitText headline
// had even finished typing itself in. Stagger them in afterwards instead —
// each one stays invisible and parked just off its home position until its
// own delay elapses, then fades in while the spring pulls it the rest of
// the way home (the same physics loop, just starting a beat late).
const ENTRANCE_BASE_DELAY = 1.1;
const ENTRANCE_STAGGER = 0.09;
const ENTRANCE_OFFSET_Y = 26;

interface IconState {
  home: { x: number; y: number };
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  halfW: number;
  halfH: number;
  entranceDelay: number;
  entranceTriggered: boolean;
}

function isArrangeMode() {
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("arrange") === "1";
}

function serializeLayout(icons: IconSpec[]) {
  const lines = icons.map((icon) => {
    const { id, xPercent, yPercent } = icon;
    return `  // ${id}: xPercent: ${Math.round(xPercent * 10) / 10}, yPercent: ${Math.round(yPercent * 10) / 10}`;
  });
  return lines.join("\n");
}

function HeroIcons() {
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef(new Map<string, HTMLImageElement>());
  // Mutable working copy so drag-to-arrange can move icons without
  // fighting the physics loop, which reads positions from here too.
  const iconsRef = useRef<IconSpec[]>(ICONS.map((icon) => ({ ...icon })));
  const [arrangeMode] = useState(isArrangeMode);
  const [layoutText, setLayoutText] = useState(() => serializeLayout(iconsRef.current));
  const draggingId = useRef<string | null>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion && !arrangeMode) {
      return;
    }

    initializeScrollSystem();

    const state = new Map<string, IconState>();

    const computeHomes = () => {
      const rect = field.getBoundingClientRect();
      iconsRef.current.forEach((icon, index) => {
        const home = {
          x: (icon.xPercent / 100) * rect.width,
          y: (icon.yPercent / 100) * rect.height,
        };
        // Read the icon's actual rendered box (after the CSS clamp() scale
        // in HeroIcons.module.css) rather than its base px size, so the
        // boundary clamp shrinks along with it on narrower desktop widths.
        // offsetWidth/Height ignore the hover "pop" transform (that's a
        // transform, not a layout change), so it stays the resting size.
        const node = nodeRefs.current.get(icon.id);
        const halfW = node ? node.offsetWidth / 2 : icon.width / 2;
        const halfH = node ? node.offsetHeight / 2 : (icon.width * icon.aspectRatio) / 2;

        const existing = state.get(icon.id);
        if (existing) {
          existing.home = home;
          existing.halfW = halfW;
          existing.halfH = halfH;
          if (draggingId.current === icon.id) {
            existing.pos = { ...home };
            existing.vel = { x: 0, y: 0 };
          }
        } else {
          const entranceDelay = arrangeMode ? 0 : ENTRANCE_BASE_DELAY + index * ENTRANCE_STAGGER;
          const startPos = { x: home.x, y: home.y - ENTRANCE_OFFSET_Y };
          state.set(icon.id, {
            home,
            pos: entranceDelay > 0 ? startPos : { ...home },
            vel: { x: 0, y: 0 },
            halfW,
            halfH,
            entranceDelay,
            entranceTriggered: entranceDelay <= 0,
          });
          if (node && entranceDelay > 0) {
            gsap.set(node, { opacity: 0, x: startPos.x - home.x, y: startPos.y - home.y });
          }
        }
      });
    };

    computeHomes();

    const mouse = { x: -Infinity, y: -Infinity };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = field.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    };

    const handlePointerLeave = () => {
      mouse.x = -Infinity;
      mouse.y = -Infinity;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", handlePointerLeave);
    document.addEventListener("pointerleave", handlePointerLeave);

    const resizeObserver = new ResizeObserver(computeHomes);
    resizeObserver.observe(field);

    let scrollProgress = 0;
    const scrollTrigger = ScrollTrigger.create({
      trigger: field,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        scrollProgress = self.progress;
      },
    });

    let elapsed = 0;

    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs / 1000, 1 / 30);
      elapsed += dt;
      const rect = field.getBoundingClientRect();
      const dampingFactor = Math.max(0, 1 - DAMPING * dt);

      iconsRef.current.forEach((icon) => {
        const s = state.get(icon.id);
        if (!s) return;

        const node = nodeRefs.current.get(icon.id);
        const parallaxY = reducedMotion ? 0 : (scrollProgress - 0.5) * icon.parallaxRange;

        if (draggingId.current === icon.id) {
          // Position is being driven directly by the drag handler (via the
          // element's own left/top) — just clear any leftover transform.
          if (node) gsap.set(node, { x: 0, y: parallaxY, scale: 1 });
          return;
        }

        if (!s.entranceTriggered) {
          if (elapsed < s.entranceDelay) {
            // Parked off-position with opacity 0 until its turn comes up —
            // set once in computeHomes, nothing to update per-frame.
            return;
          }
          s.entranceTriggered = true;
          if (node) gsap.to(node, { opacity: 1, duration: 0.6, ease: "power2.out" });
        }

        const floatX = reducedMotion ? 0 : Math.sin(elapsed * icon.floatSpeed + icon.floatPhase) * icon.floatAmplitude;
        const floatY = reducedMotion ? 0 : Math.cos(elapsed * icon.floatSpeed * 0.8 + icon.floatPhase) * icon.floatAmplitude * 0.6;

        const targetX = s.home.x + floatX;
        const targetY = s.home.y + floatY;

        let ax = (targetX - s.pos.x) * SPRING_STIFFNESS;
        let ay = (targetY - s.pos.y) * SPRING_STIFFNESS;

        const dx = s.pos.x - mouse.x;
        const dy = s.pos.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < REPEL_RADIUS) {
          const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
          const safeDist = Math.max(dist, 0.001);
          ax += (dx / safeDist) * force;
          ay += (dy / safeDist) * force;
        }

        s.vel.x = (s.vel.x + ax * dt) * dampingFactor;
        s.vel.y = (s.vel.y + ay * dt) * dampingFactor;

        s.pos.x += s.vel.x * dt;
        s.pos.y += s.vel.y * dt;

        const minX = s.halfW;
        const maxX = rect.width - s.halfW;
        const minY = s.halfH;
        const maxY = rect.height - s.halfH;

        if (s.pos.x < minX) {
          s.pos.x = minX;
          s.vel.x = 0;
        } else if (s.pos.x > maxX) {
          s.pos.x = maxX;
          s.vel.x = 0;
        }

        if (s.pos.y < minY) {
          s.pos.y = minY;
          s.vel.y = 0;
        } else if (s.pos.y > maxY) {
          s.pos.y = maxY;
          s.vel.y = 0;
        }

        const hoverT = Math.max(0, 1 - dist / HOVER_RADIUS);
        const hoverEase = hoverT * hoverT * (3 - 2 * hoverT); // smoothstep
        const scale = 1 + hoverEase * HOVER_SCALE;

        if (node) {
          gsap.set(node, { x: s.pos.x - s.home.x, y: s.pos.y - s.home.y + parallaxY, scale });
        }
      });
    };

    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      scrollTrigger.kill();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", handlePointerLeave);
      document.removeEventListener("pointerleave", handlePointerLeave);
      resizeObserver.disconnect();
    };
  }, [arrangeMode]);

  const handleDragStart = (id: string) => (event: ReactPointerEvent<HTMLImageElement>) => {
    if (!arrangeMode) return;
    event.preventDefault();
    draggingId.current = id;

    const field = fieldRef.current;
    const node = nodeRefs.current.get(id);
    if (!field || !node) return;

    const move = (moveEvent: PointerEvent) => {
      const rect = field.getBoundingClientRect();
      const xPercent = Math.min(98, Math.max(2, ((moveEvent.clientX - rect.left) / rect.width) * 100));
      const yPercent = Math.min(98, Math.max(2, ((moveEvent.clientY - rect.top) / rect.height) * 100));

      const icon = iconsRef.current.find((i) => i.id === id);
      if (!icon) return;
      icon.xPercent = xPercent;
      icon.yPercent = yPercent;

      node.style.left = `${xPercent}%`;
      node.style.top = `${yPercent}%`;

      setLayoutText(serializeLayout(iconsRef.current));
    };

    const up = () => {
      draggingId.current = null;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(layoutText).catch(() => {
      /* clipboard permission denied — the textarea is there to select manually */
    });
  };

  return (
    <>
      <div ref={fieldRef} className={styles.field} aria-hidden="true">
        {iconsRef.current.map((icon) => (
          <img
            key={icon.id}
            ref={(node) => {
              if (node) nodeRefs.current.set(icon.id, node);
              else nodeRefs.current.delete(icon.id);
            }}
            src={icon.src}
            alt=""
            draggable={false}
            onPointerDown={handleDragStart(icon.id)}
            className={arrangeMode ? `${styles.icon} ${styles.iconDraggable}` : styles.icon}
            style={{
              left: `${icon.xPercent}%`,
              top: `${icon.yPercent}%`,
              pointerEvents: arrangeMode ? "auto" : "none",
              "--icon-w": `${icon.width}px`,
              "--icon-h": `${icon.width * icon.aspectRatio}px`,
            } as CSSProperties}
          />
        ))}
      </div>

      {arrangeMode && (
        <div className={styles.arrangePanel}>
          <p className={styles.arrangeTitle}>Presuň ikonky, potom skopíruj súradnice a pošli mi ich v chate.</p>
          <textarea className={styles.arrangeTextarea} readOnly value={layoutText} />
          <button type="button" className={styles.arrangeButton} onClick={handleCopy}>
            Kopírovať pozície
          </button>
        </div>
      )}
    </>
  );
}

export default HeroIcons;
