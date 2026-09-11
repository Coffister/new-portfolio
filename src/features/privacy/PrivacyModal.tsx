import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "@phosphor-icons/react";

import { Squircle } from "@/ui/primitives";

import styles from "./PrivacyModal.module.css";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.backdrop}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Ochrana osobných údajov"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <Squircle radius="lg" className={styles.squircle}>
              <div className={styles.header}>
                <h3>Ochrana osobných údajov</h3>
                <button
                  type="button"
                  className={styles.closeButton}
                  onClick={onClose}
                  aria-label="Zavrieť"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              <div className={styles.body}>
                <p>
                  Prevádzkovateľom je Filip Várnik (Coffister), kontakt:{" "}
                  <a href="mailto:hello@coffister.art">hello@coffister.art</a>.
                  Podnikanie momentálne nie je formálne registrované ako
                  živnosť/s.r.o. — po registrácii tu doplníme IČO.
                </p>

                <h4>Aké údaje spracúvame</h4>
                <p>
                  Meno/email a text správy, ktoré vyplníte v kontaktnom
                  formulári alebo v kalkulačke odhadu na tejto stránke.
                </p>

                <h4>Na aký účel</h4>
                <p>
                  Výlučne na to, aby sme vám mohli odpovedať na váš dopyt.
                  Právnym základom je oprávnený záujem odpovedať na otázku,
                  ktorú ste nám sami adresovali (čl. 6 ods. 1 písm. f GDPR).
                </p>

                <h4>Komu sa údaje odovzdávajú</h4>
                <ul>
                  <li>
                    <strong>Resend</strong> (Resend, Inc., USA) — doručenie
                    emailu s vaším dopytom.
                  </li>
                  <li>
                    <strong>Supabase</strong> — hosting funkcie, ktorá dopyt
                    odovzdá do Resend. Údaje sa v Supabase trvalo neukladajú.
                  </li>
                </ul>

                <h4>Ako dlho</h4>
                <p>
                  Údaje uchovávame len v emailovej schránke, kým je to
                  potrebné na vybavenie dopytu, najviac po dobu bežnej
                  emailovej korešpondencie.
                </p>

                <h4>Vaše práva</h4>
                <p>
                  Máte právo na prístup k údajom, ich opravu, vymazanie
                  alebo namietanie proti spracúvaniu. Stačí napísať na{" "}
                  <a href="mailto:hello@coffister.art">hello@coffister.art</a>.
                </p>
              </div>
            </Squircle>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
