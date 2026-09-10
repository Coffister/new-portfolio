import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import { Check } from "@phosphor-icons/react";

import { useCursor } from "@/providers/CursorProvider";
import ChevronDownIcon from "@/ui/icons/ChevronDownIcon";

import styles from "./EstimateSelect.module.css";

const TYPE_SPEED = 20;
const AUTO_CLOSE_DELAY = 5000;

// erases the previous label character by character, then types the new one in
function useTypewriter(text: string, speed = TYPE_SPEED) {
  const [displayText, setDisplayText] = useState(text);
  const displayRef = useRef(text);

  useEffect(() => {
    if (displayRef.current === text) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const type = () => {
      if (cancelled) return;

      if (displayRef.current.length >= text.length) {
        displayRef.current = text;
        setDisplayText(text);
        return;
      }

      displayRef.current = text.slice(0, displayRef.current.length + 1);
      setDisplayText(displayRef.current);
      timeoutId = setTimeout(type, speed);
    };

    const erase = () => {
      if (cancelled) return;

      if (displayRef.current.length === 0) {
        type();
        return;
      }

      displayRef.current = displayRef.current.slice(0, -1);
      setDisplayText(displayRef.current);
      timeoutId = setTimeout(erase, speed);
    };

    erase();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [text, speed]);

  return displayText;
}

interface EstimateSelectSingleProps {
  multiple?: false;
  options: string[];
  value: number;
  onChange: (index: number) => void;
}

interface EstimateSelectMultipleProps {
  multiple: true;
  options: string[];
  values: number[];
  onChange: (values: number[]) => void;
}

type EstimateSelectProps = EstimateSelectSingleProps | EstimateSelectMultipleProps;

export default function EstimateSelect(props: EstimateSelectProps) {
  const { options, multiple } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const autoCloseTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { setVariant } = useCursor();

  const selectedIndices = multiple ? props.values : [props.value];
  const label = selectedIndices.map((index) => options[index]).join(", ");

  // in multi-select mode, only commit the new label once the dropdown closes
  const [committedLabel, setCommittedLabel] = useState(label);

  useEffect(() => {
    if (multiple && isOpen) return;
    setCommittedLabel(label);
  }, [multiple, isOpen, label]);

  const displayLabel = useTypewriter(committedLabel);
  const isTyping = displayLabel !== committedLabel;

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 8, left: rect.left });
    };

    updatePosition();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        (!rootRef.current || !rootRef.current.contains(target)) &&
        (!listRef.current || !listRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  // closes the dropdown automatically after a period of no interaction with it
  const resetAutoClose = () => {
    clearTimeout(autoCloseTimeout.current);
    autoCloseTimeout.current = setTimeout(() => setIsOpen(false), AUTO_CLOSE_DELAY);
  };

  useEffect(() => {
    if (!isOpen) return;

    resetAutoClose();

    return () => clearTimeout(autoCloseTimeout.current);
  }, [isOpen]);

  // Move keyboard focus into the list when it opens.
  useEffect(() => {
    if (!isOpen) return;
    const firstIndex = selectedIndices[0] ?? 0;
    const timer = window.setTimeout(() => optionRefs.current[firstIndex]?.focus(), 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const focusOptionAt = (index: number) => {
    const count = options.length;
    if (count === 0) return;
    optionRefs.current[((index % count) + count) % count]?.focus();
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  const handleListKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
    resetAutoClose();
    const current = optionRefs.current.findIndex((el) => el === document.activeElement);

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusOptionAt(current + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusOptionAt(current - 1);
        break;
      case "Home":
        event.preventDefault();
        focusOptionAt(0);
        break;
      case "End":
        event.preventDefault();
        focusOptionAt(options.length - 1);
        break;
      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
        break;
      case "Tab":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelect = (index: number) => {
    if (multiple) {
      resetAutoClose();

      const isSelected = props.values.includes(index);

      if (isSelected) {
        if (props.values.length === 1) return; // keep at least one option selected
        props.onChange(props.values.filter((selected) => selected !== index));
      } else {
        props.onChange([...props.values, index].sort((a, b) => a - b));
      }

      return;
    }

    props.onChange(index);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <span className={styles.root} ref={rootRef}>
      <button
        type="button"
        ref={triggerRef}
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        onMouseEnter={() => setVariant("pointer")}
        onMouseLeave={() => setVariant("default")}
      >
        {displayLabel}
        {isTyping && <span className={styles.caret} aria-hidden />}
        <motion.span
          className={styles.chevron}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <ChevronDownIcon />
        </motion.span>
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.ul
              ref={listRef}
              className={styles.list}
              role="listbox"
              aria-multiselectable={multiple || undefined}
              style={{ top: position.top, left: position.left }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onKeyDown={handleListKeyDown}
            >
              {options.map((option, index) => (
                <li key={option} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedIndices.includes(index)}
                    tabIndex={-1}
                    ref={(el) => {
                      optionRefs.current[index] = el;
                    }}
                    className={`${styles.item} ${
                      selectedIndices.includes(index) ? styles.itemActive : ""
                    }`}
                    onClick={() => handleSelect(index)}
                    onMouseEnter={() => setVariant("pointer")}
                    onMouseLeave={() => setVariant("default")}
                  >
                    {option}

                    {selectedIndices.includes(index) && (
                      <Check className={styles.check} size={14} weight="bold" />
                    )}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>,
        document.body
      )}
    </span>
  );
}
