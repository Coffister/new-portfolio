import { useEffect, useRef } from "react";
import { gsap } from "gsap";
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
}

// Clustered tight around the headline's center — swap/add more icons here
// as they arrive, physics and layout stay the same.
const ICONS: IconSpec[] = [
  { id: "coffeemug", src: coffeemug, xPercent: 34, yPercent: 26, width: 64, aspectRatio: 93 / 90 },
  { id: "chatbubbles", src: chatbubbles, xPercent: 52, yPercent: 20, width: 48, aspectRatio: 84 / 92 },
  { id: "computer", src: computer, xPercent: 68, yPercent: 29, width: 60, aspectRatio: 93 / 116 },
  { id: "planet", src: planet, xPercent: 69, yPercent: 45, width: 58, aspectRatio: 87 / 107 },
  { id: "growth", src: growth, xPercent: 38, yPercent: 48, width: 48, aspectRatio: 1 },
  { id: "layout", src: layout, xPercent: 55, yPercent: 55, width: 50, aspectRatio: 1 },
  { id: "checklist", src: checklist, xPercent: 46, yPercent: 37, width: 42, aspectRatio: 100 / 84 },
];

const REPEL_RADIUS = 160;
const REPEL_STRENGTH = 4200;
const SPRING_STIFFNESS = 55;
const DAMPING = 7;

interface IconState {
  home: { x: number; y: number };
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  halfW: number;
  halfH: number;
}

function HeroIcons() {
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef(new Map<string, HTMLImageElement>());

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const state = new Map<string, IconState>();

    const computeHomes = () => {
      const rect = field.getBoundingClientRect();
      ICONS.forEach((icon) => {
        const home = {
          x: (icon.xPercent / 100) * rect.width,
          y: (icon.yPercent / 100) * rect.height,
        };
        const existing = state.get(icon.id);
        if (existing) {
          existing.home = home;
        } else {
          state.set(icon.id, {
            home,
            pos: { ...home },
            vel: { x: 0, y: 0 },
            halfW: icon.width / 2,
            halfH: (icon.width * icon.aspectRatio) / 2,
          });
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

    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs / 1000, 1 / 30);
      const rect = field.getBoundingClientRect();
      const dampingFactor = Math.max(0, 1 - DAMPING * dt);

      ICONS.forEach((icon) => {
        const s = state.get(icon.id);
        if (!s) return;

        let ax = (s.home.x - s.pos.x) * SPRING_STIFFNESS;
        let ay = (s.home.y - s.pos.y) * SPRING_STIFFNESS;

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

        const node = nodeRefs.current.get(icon.id);
        if (node) {
          gsap.set(node, { x: s.pos.x - s.home.x, y: s.pos.y - s.home.y });
        }
      });
    };

    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", handlePointerLeave);
      document.removeEventListener("pointerleave", handlePointerLeave);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div ref={fieldRef} className={styles.field} aria-hidden="true">
      {ICONS.map((icon) => (
        <img
          key={icon.id}
          ref={(node) => {
            if (node) nodeRefs.current.set(icon.id, node);
            else nodeRefs.current.delete(icon.id);
          }}
          src={icon.src}
          alt=""
          className={styles.icon}
          style={{
            left: `${icon.xPercent}%`,
            top: `${icon.yPercent}%`,
            width: icon.width,
            height: icon.width * icon.aspectRatio,
            marginLeft: -icon.width / 2,
            marginTop: -(icon.width * icon.aspectRatio) / 2,
          }}
        />
      ))}
    </div>
  );
}

export default HeroIcons;
