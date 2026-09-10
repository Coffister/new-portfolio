import { useEffect, useRef, useState } from "react";
import Squircle from "@/ui/primitives/Squircle";

import logo from "@/assets/coffister-dark.svg";
import emailIcon from "@/assets/email-small.svg";
import whatsappIcon from "@/assets/whatsapp.svg";

import styles from "./Navbar.module.css";

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const threshold = 20;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (Math.abs(delta) < 4) {
        return;
      }

      if (currentScrollY > lastScrollY.current && currentScrollY > threshold) {
        setHidden(true);
      } else if (currentScrollY < lastScrollY.current) {
        setHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`${styles.navbar} ${hidden ? styles.hidden : ""}`}
      onMouseEnter={() => {
        if (hidden) {
          setHidden(false);
        }
      }}
    >
      <div className={styles.blurWrapper}>
        <Squircle radius="sm">
          <div className={styles.surface}>
            <div className={styles.inner}>
              <img
                src={logo}
                alt="Coffister"
                className={styles.logo}
              />

              <div className={styles.actions}>
                <img
                  src={emailIcon}
                  alt="hello@coffister.art"
                  className={styles.email}
                />

                <Squircle radius="xs">
                  <button className={styles.whatsapp} type="button" aria-label="WhatsApp">
                    <img src={whatsappIcon} alt="" />
                  </button>
                </Squircle>
              </div>
            </div>
          </div>
        </Squircle>
      </div>
    </header>
  );
}
