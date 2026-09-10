import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import { useCursor } from "@/providers/CursorProvider";

import styles from "./EstimateEmailInput.module.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALIDATION_DELAY = 1200;

// strip anything that can't legally appear in an email address as the user types
function sanitizeEmail(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9@._+-]/g, "");
}

interface EstimateEmailInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function EstimateEmailInput({
  value,
  onChange,
}: EstimateEmailInputProps) {
  const [showError, setShowError] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const validationTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { setVariant } = useCursor();

  const isValid = value.length === 0 || EMAIL_PATTERN.test(value);

  // hide the tooltip while typing, then re-check after a few seconds of inactivity
  useEffect(() => {
    setShowError(false);
    clearTimeout(validationTimeout.current);

    if (value.length === 0) return;

    validationTimeout.current = setTimeout(() => {
      setShowError(!EMAIL_PATTERN.test(value));
    }, VALIDATION_DELAY);

    return () => clearTimeout(validationTimeout.current);
  }, [value]);

  useEffect(() => {
    if (!showError) return;

    const updatePosition = () => {
      if (!inputRef.current) return;

      const rect = inputRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 10, left: rect.left + rect.width / 2 });
    };

    updatePosition();

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [showError]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(sanitizeEmail(event.target.value));
  };

  const handleBlur = () => {
    clearTimeout(validationTimeout.current);
    setShowError(!isValid);
    setVariant("default");
  };

  return (
    <span className={styles.root}>
      <input
        ref={inputRef}
        type="email"
        inputMode="email"
        autoComplete="email"
        spellCheck={false}
        placeholder="vas@email.sk"
        value={value}
        onChange={handleChange}
        onFocus={() => setVariant("pointer")}
        onBlur={handleBlur}
        className={`${styles.input} ${showError ? styles.inputError : ""}`}
        style={{ width: `${Math.max(value.length, 12)}ch` }}
      />

      {createPortal(
        <AnimatePresence>
          {showError && (
            <div className={styles.tooltipAnchor} style={{ top: position.top, left: position.left }}>
              <motion.div
                className={styles.tooltip}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                Prosím zadajte platnú emailovú adresu
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </span>
  );
}
