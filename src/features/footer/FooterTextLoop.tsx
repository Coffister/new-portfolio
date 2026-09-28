import { useEffect, useRef, useState } from "react";

import styles from "./FooterTextLoop.module.css";

const CURVE_PATH =
  "M -100 230 C 180 90, 460 70, 620 160 C 780 250, 1020 260, 1180 160 C 1340 60, 1520 50, 1700 130";

const LOOP_TEXT = "hello@coffister.art";
const LOOP_REPEATS = 9;
const LOOP_CONTENT = `${LOOP_TEXT} ✦ `.repeat(LOOP_REPEATS).trim();

export default function FooterTextLoop() {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(query.matches);

    const handleChange = (event: MediaQueryListEvent) => setReduceMotion(event.matches);
    query.addEventListener("change", handleChange);

    return () => query.removeEventListener("change", handleChange);
  }, []);

  return (
    <svg
      className={styles.loop}
      viewBox="0 0 1600 320"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        ref={pathRef}
        id="footer-loop-path"
        className={styles.ribbon}
        d={CURVE_PATH}
      />

      {pathLength > 0 && (
        <>
          <text className={styles.text}>
            <textPath
              href="#footer-loop-path"
              startOffset="0%"
              textLength={pathLength}
              lengthAdjust="spacingAndGlyphs"
            >
              {LOOP_CONTENT}
              {!reduceMotion && (
                <animate
                  attributeName="startOffset"
                  values="0%;-100%"
                  dur="24s"
                  repeatCount="indefinite"
                />
              )}
            </textPath>
          </text>

          <text className={styles.text}>
            <textPath
              href="#footer-loop-path"
              startOffset="100%"
              textLength={pathLength}
              lengthAdjust="spacingAndGlyphs"
            >
              {LOOP_CONTENT}
              {!reduceMotion && (
                <animate
                  attributeName="startOffset"
                  values="100%;0%"
                  dur="24s"
                  repeatCount="indefinite"
                />
              )}
            </textPath>
          </text>
        </>
      )}
    </svg>
  );
}
