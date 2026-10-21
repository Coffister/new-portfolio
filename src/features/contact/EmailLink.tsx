import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { MouseEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "@phosphor-icons/react";

import { useCursor } from "@/providers/CursorProvider";

import styles from "./EmailLink.module.css";

export const CONTACT_EMAIL = "hello@coffister.art";

const COPIED_DURATION = 2000;

// Desktop visitors mostly use webmail, so mailto: would open an unset-up
// mail app; there a click copies the address instead. Touch devices keep
// mailto:, their mail app is nearly always set up.
const COPY_QUERY = "(hover: hover) and (pointer: fine)";

interface EmailLinkProps {
  children: ReactNode;
  className?: string;
}

export default function EmailLink({ children, className }: EmailLinkProps) {
  // where the "copied" toast shows; null = hidden
  const [toastAt, setToastAt] = useState<{ x: number; y: number } | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { setVariant } = useCursor();

  useEffect(() => () => clearTimeout(timeout.current), []);

  const handleClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (!window.matchMedia(COPY_QUERY).matches) return;

    event.preventDefault();
    // keyboard activation has no pointer position: anchor under the link
    const rect = event.currentTarget.getBoundingClientRect();
    const at = event.detail > 0
      ? { x: event.clientX, y: event.clientY }
      : { x: rect.left + rect.width / 2, y: rect.bottom };

    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
    } catch {
      // no clipboard access (insecure context, denied): fall back to mailto:
      window.location.href = `mailto:${CONTACT_EMAIL}`;
      return;
    }

    setToastAt(at);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setToastAt(null), COPIED_DURATION);
  };

  return (
    <a
      href={`mailto:${CONTACT_EMAIL}`}
      className={`${styles.link} ${className ?? ""}`}
      onClick={handleClick}
      onMouseEnter={() => setVariant("pointer")}
      onMouseLeave={() => setVariant("default")}
    >
      {children}

      {/* Portalled: the navbar's squircle clip-path would cut it off.
          Skipped in the prerender, which has no document. */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {toastAt && (
            <div className={styles.toastAnchor} style={{ left: toastAt.x, top: toastAt.y }}>
              <motion.span
                className={styles.toast}
                role="status"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                Skopírované
                <Check size={14} weight="bold" aria-hidden="true" />
              </motion.span>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </a>
  );
}
