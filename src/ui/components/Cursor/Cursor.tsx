import { useEffect, useRef, useState } from "react";

import styles from "./Cursor.module.css";

import defaultIcon from "@/assets/cursor/default.png";
import dragIcon from "@/assets/cursor/drag-animated.svg";
import pointerIcon from "@/assets/cursor/pointer.png";

import { useCursor } from "@/providers/CursorProvider";

const cursorIcons = {
  default: defaultIcon,
  drag: dragIcon,
  pointer: pointerIcon,
  pill: defaultIcon, // zatiaľ placeholder
} as const;

const CURSOR_SIZES = {
  default: 24,
  drag: 48,
  pointer: 32,
  pill: 160,
} as const;

// where the visual tip sits inside each icon (fraction of width/height), not the image center
const CURSOR_HOTSPOTS = {
  default: { x: 0.2, y: 0.12 },
  drag: { x: 0.5, y: 0.5 },
  pointer: { x: 0.35, y: 0.08 },
  pill: { x: 0.5, y: 0.5 },
} as const;

export default function Cursor() {
  const { variant } = useCursor();
  const [isChanging, setIsChanging] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const cursorRef = useRef<HTMLDivElement>(null);

  const position = useRef({
    x: 0,
    y: 0,
  });

  const target = useRef({
    x: 0,
    y: 0,
  });

  useEffect(() => {
  setIsChanging(true);

  const timeout = setTimeout(() => {
    setIsChanging(false);
  }, 150);

  return () => clearTimeout(timeout);
}, [variant]);

  // Only run the JS cursor for real pointing devices that haven't asked for
  // reduced motion. Everywhere else we keep the native cursor (see index.css)
  // so a device with no fine pointer is never left with no cursor at all.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const sync = () => setEnabled(finePointer.matches && !reduceMotion.matches);

    sync();
    finePointer.addEventListener("change", sync);
    reduceMotion.addEventListener("change", sync);

    return () => {
      finePointer.removeEventListener("change", sync);
      reduceMotion.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("has-custom-cursor", enabled);
    return () => root.classList.remove("has-custom-cursor");
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const move = (e: MouseEvent) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    window.addEventListener("mousemove", move);

    let raf = 0;

    const animate = () => {
      position.current.x +=
        (target.current.x - position.current.x) * 0.35;

      position.current.y +=
        (target.current.y - position.current.y) * 0.35;

      if (cursorRef.current) {
        const hotspot = CURSOR_HOTSPOTS[variant];

        cursorRef.current.style.transform = `
          translate3d(
            ${position.current.x}px,
            ${position.current.y}px,
            0
          )
          translate(${-hotspot.x * 100}%, ${-hotspot.y * 100}%)
        `;

        const size = CURSOR_SIZES[variant];

        cursorRef.current.style.width = `${size}px`;
        cursorRef.current.style.height = `${size}px`;
      }

      raf = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, [variant, enabled]);

  if (!enabled) return null;

  return (
<div
  ref={cursorRef}
  className={`${styles.cursor} ${
    isChanging ? styles.changing : ""
  }`}
>
      <img
        src={cursorIcons[variant]}
        alt=""
        className={styles.icon}
      />
    </div>
  );
}