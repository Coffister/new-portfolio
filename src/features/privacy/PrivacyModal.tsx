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
                  Prevádzkovateľ: Filip Várnik
                  <br />
                  Web: coffister.art
                  <br />
                  E-mail: <a href="mailto:hello@coffister.art">hello@coffister.art</a>
                </p>
                <p>
                  Tieto zásady informujú o tom, ako spracúvam osobné údaje v
                  súlade s GDPR a zákonom č. 18/2018 Z. z. o ochrane osobných
                  údajov.
                </p>

                <h4>1. Aké údaje spracúvam</h4>
                <p>
                  Prostredníctvom formulárov môžem spracúvať vaše meno,
                  e-mailovú adresu, názov spoločnosti, vybraný balík, doplnkové
                  služby a obsah dopytu.
                </p>

                <h4>2. Na čo údaje používam</h4>
                <p>
                  Údaje používam na vybavenie dopytov, komunikáciu a prípravu
                  cenových ponúk. Ak dôjde k spolupráci, spracúvam ich aj na
                  plnenie zmluvy a súvisiacich zákonných povinností.
                </p>
                <p>
                  Právnym základom vybavenia cenového dopytu je vykonanie
                  opatrení pred uzatvorením zmluvy na vašu žiadosť.
                </p>

                <h4>3. Kto má k údajom prístup</h4>
                <p>
                  Na prevádzku webu a e-mailovú komunikáciu využívam služby
                  Vercel, Resend, Porkbun a Google (Gmail). V závislosti od
                  používaných služieb sa údaje môžu spracúvať aj mimo
                  Európskeho hospodárskeho priestoru, ak sú splnené zákonné
                  podmienky.
                </p>
                <p>
                  Dopyty neukladám do vlastnej databázy; prijímam ich
                  prostredníctvom e-mailu.
                </p>

                <h4>4. Ako dlho údaje uchovávam</h4>
                <p>
                  Neúspešné dopyty uchovávam najviac 6 mesiacov od poslednej
                  komunikácie. Údaje súvisiace so spoluprácou uchovávam počas
                  obdobia potrebného na plnenie zmluvných a zákonných
                  povinností.
                </p>

                <h4>5. Vaše práva</h4>
                <p>
                  Máte právo požiadať o prístup k svojim osobným údajom, ich
                  opravu, vymazanie alebo obmedzenie spracúvania. V prípadoch
                  stanovených GDPR môžete namietať spracúvanie alebo požiadať o
                  prenos údajov.
                </p>
                <p>
                  Svoje práva môžete uplatniť na e-mailovej adrese{" "}
                  <a href="mailto:hello@coffister.art">hello@coffister.art</a>. Máte tiež právo podať sťažnosť na Úrad na ochranu
                  osobných údajov Slovenskej republiky.
                </p>

                <h4>6. Záverečné ustanovenia</h4>
                <p>
                  Tieto zásady môžem aktualizovať v prípade zmeny spôsobu
                  spracúvania osobných údajov alebo príslušných právnych
                  predpisov.
                </p>
                <p>Dátum účinnosti: 21. 10. 2026</p>
              </div>
            </Squircle>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
