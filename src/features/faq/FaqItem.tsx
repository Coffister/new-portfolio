import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import { Box, Text, Squircle } from "@/ui/primitives";
import PlusIcon from "@/ui/icons/PlusIcon";
import Button from "@/ui/components/Button";

import styles from "./FaqItem.module.css";
import { useCursor } from "@/providers/CursorProvider";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALIDATION_DELAY = 1200;
const CONTACT_EMAIL = "hello@coffister.art";

function sanitizeEmail(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9@._+-]/g, "");
}

interface FaqItemProps {
  question: string;
  answer?: string;
  isCustom?: boolean;

  isOpen: boolean;
  onToggle: () => void;
}

export default function FaqItem({
  question,
  answer = "",
  isCustom = false,
  isOpen,
  onToggle,
}: FaqItemProps) {
  const { setVariant } = useCursor();
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [showError, setShowError] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const emailRef = useRef<HTMLInputElement>(null);
  const validationTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const isValid = email.length === 0 || EMAIL_PATTERN.test(email);

  useEffect(() => {
    setShowError(false);
    clearTimeout(validationTimeout.current);

    if (email.length === 0) return;

    validationTimeout.current = setTimeout(() => {
      setShowError(!EMAIL_PATTERN.test(email));
    }, VALIDATION_DELAY);

    return () => clearTimeout(validationTimeout.current);
  }, [email]);

  useEffect(() => {
    if (!showError) return;

    const updatePosition = () => {
      if (!emailRef.current) return;

      const rect = emailRef.current.getBoundingClientRect();
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!message.trim() || !email.trim() || !EMAIL_PATTERN.test(email)) {
      setShowError(true);
      return;
    }

    const subject = "Otázka z FAQ";
    const body = `${message}\n\nOdpovedať na: ${email}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setMessage("");
    setEmail("");
    setShowError(false);
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(sanitizeEmail(event.target.value));
  };

  const handleEmailBlur = () => {
    clearTimeout(validationTimeout.current);
    setShowError(!isValid);
    setVariant("default");
  };

  return (
    <Squircle radius="sm" className={styles.item}>
      <div
        className={styles.header}
        onClick={onToggle}
        onMouseEnter={() => setVariant("pointer")}
        onMouseLeave={() => setVariant("default")}
      >
        <Text as="h3" variant="sectionSubtitle">
          {question}
        </Text>

        <motion.div
          className={styles.icon}
          animate={{
            rotate: isOpen ? 45 : 0,
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
        >
          <PlusIcon />
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
            }}
            className={styles.wrapper}
          >
            <Box className={styles.answer}>
              {isCustom ? (
                <form className={styles.customForm} onSubmit={handleSubmit}>
                  <label className={styles.field}>
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Aká je vaša otázka?"
                      rows={5}
                    />
                  </label>

                  <div className={styles.emailRow}>
                    <label className={`${styles.field} ${styles.emailField}`}>
                      <span className={styles.emailWrap}>
                        <input
                          ref={emailRef}
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          spellCheck={false}
                          value={email}
                          onChange={handleEmailChange}
                          onFocus={() => setVariant("pointer")}
                          onBlur={handleEmailBlur}
                          placeholder="Email na odoslanie odpovedi"
                          className={`${styles.emailInput} ${showError ? styles.inputError : ""}`}
                          style={{ width: "100%" }}
                        />

                        {createPortal(
                          <AnimatePresence>
                            {showError && (
                              <div
                                className={styles.tooltipAnchor}
                                style={{ top: position.top, left: position.left }}
                              >
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
                          document.body,
                        )}
                      </span>
                    </label>

                    <Button type="submit" className={styles.submitButton}>
                      Odoslať
                    </Button>
                  </div>
                </form>
              ) : (
                <Text variant="body">{answer}</Text>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Squircle>
  );
}
