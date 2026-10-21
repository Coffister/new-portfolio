import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import Squircle from "@/ui/primitives/Squircle";
import { LinkButton } from "@/ui/components";
import { scrollToSection } from "@/lib/scroll";

import logo from "@/assets/coffister-dark.svg";
import emailIcon from "@/assets/email-small.svg";

import styles from "./Navbar.module.css";

const CTA_LABEL = "Chcem ponuku";

// Sections where the floating mobile CTA would only get in the way: the
// pricing form it points to, and the footer's own contact.
const FLOATING_CTA_HIDDEN_IN = ["pricing", "footer"];

function goToPricing(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  scrollToSection("pricing");
}

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [inHiddenSection, setInHiddenSection] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const threshold = 20;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // the hero carries its own CTAs
      setPastHero(currentScrollY > window.innerHeight * 0.6);

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
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      setInHiddenSection(visible.size > 0);
    });

    for (const id of FLOATING_CTA_HIDDEN_IN) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  const showFloatingCta = pastHero && !inHiddenSection;

  return (
    <>
      <header
        className={`${styles.navbar} ${hidden ? styles.hidden : ""}`}
        onMouseEnter={() => {
          if (hidden) {
            setHidden(false);
          }
        }}
      >
        {/* Mobile: no pill, just the logo on a full-width fading backdrop. */}
        <div className={styles.mobileBar}>
          <img src={logo} alt="Coffister" className={styles.logo} />
        </div>

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

                  <div className={`${styles.cta} ${styles.shine}`}>
                    <LinkButton href="#pricing" size="sm" onClick={goToPricing}>
                      {CTA_LABEL}
                    </LinkButton>
                  </div>
                </div>
              </div>
            </div>
          </Squircle>
        </div>
      </header>

      {/* Outside the header: its transform would pin a fixed child to it. */}
      <div
        className={`${styles.floatingCta} ${styles.shine} ${showFloatingCta ? "" : styles.floatingCtaHidden}`}
        inert={!showFloatingCta}
      >
        <LinkButton href="#pricing" size="md" fullWidth onClick={goToPricing}>
          {CTA_LABEL}
        </LinkButton>
      </div>
    </>
  );
}
