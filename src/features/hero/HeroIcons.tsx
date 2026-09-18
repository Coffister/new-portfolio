import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./HeroIcons.module.css";

interface IconSpec {
  id: string;
  // Home position as a percentage of the field's own box.
  xPercent: number;
  yPercent: number;
  size: number;
}

// Placeholder squares scattered around the headline — swap for real icons
// once the artwork is ready, physics stays the same.
const ICONS: IconSpec[] = [
  { id: "a", xPercent: 10, yPercent: 20, size: 64 },
  { id: "b", xPercent: 34, yPercent: 8, size: 44 },
  { id: "c", xPercent: 88, yPercent: 16, size: 56 },
  { id: "d", xPercent: 92, yPercent: 58, size: 60 },
  { id: "e", xPercent: 16, yPercent: 82, size: 48 },
  { id: "f", xPercent: 66, yPercent: 88, size: 52 },
];

const REPEL_RADIUS = 160;
const REPEL_STRENGTH = 4200;
const SPRING_STIFFNESS = 55;
const DAMPING = 7;

interface IconState {
  home: { x: number; y: number };
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  half: number;
}

function HeroIcons() {
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef(new Map<string, HTMLDivElement>());

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
          state.set(icon.id, { home, pos: { ...home }, vel: { x: 0, y: 0 }, half: icon.size / 2 });
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

        const minX = s.half;
        const maxX = rect.width - s.half;
        const minY = s.half;
        const maxY = rect.height - s.half;

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
        <div
          key={icon.id}
          ref={(node) => {
            if (node) nodeRefs.current.set(icon.id, node);
            else nodeRefs.current.delete(icon.id);
          }}
          className={styles.icon}
          style={{
            left: `${icon.xPercent}%`,
            top: `${icon.yPercent}%`,
            width: icon.size,
            height: icon.size,
            marginLeft: -icon.size / 2,
            marginTop: -icon.size / 2,
          }}
        />
      ))}
    </div>
  );
}

export default HeroIcons;
