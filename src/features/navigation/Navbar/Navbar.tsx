import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { PencilSimple } from "@phosphor-icons/react";
import Squircle from "@/ui/primitives/Squircle";
import { LinkButton } from "@/ui/components";
import { scrollToSection } from "@/lib/scroll";
import EmailLink, { CONTACT_EMAIL } from "@/features/contact/EmailLink";

import logo from "@/assets/coffister-dark.svg";
import emailIcon from "@/assets/email-small.svg";

import styles from "./Navbar.module.css";

const CTA_LABEL = "Chcem ponuku";

// Sections where the floating mobile CTA would only get in the way: the
// pricing form it points to, and the footer's own contact.
const FLOATING_CTA_HIDDEN_IN = ["pricing", "footer"];

// A pen signing on a loop: it stays put and rocks on its nib while the
// signature slides out from under it to the left, like paper moving under
// a hand (Navbar.module.css). Narrow, so it never reaches the label.
const ctaIcon = (
  <span className={styles.sign}>
    <span className={styles.signTrail}>
      <svg viewBox="0 0 24 6" fill="none" aria-hidden="true">
        <path
          d="M0 3 Q3 0.5 6 3 T12 3 T18 3 T24 3"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </svg>
    </span>
    <PencilSimple className={styles.signPen} size={13} weight="bold" />
  </span>
);

function goToPricing(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  scrollToSection("pricing");
}

export default function Navbar() {
  const [pastHero, setPastHero] = useState(false);
  const [inHiddenSection, setInHiddenSection] = useState(false);

  useEffect(() => {
    // the hero carries its own CTAs
    const handleScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.6);

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
      <header className={styles.navbar}>
        {/* Mobile: no pill, just the logo on a full-width fading backdrop. */}
        <div className={styles.mobileBar}>
          <img src={logo} alt="Coffister" className={styles.logo} />
        </div>

        <div className={styles.blurWrapper}>
          <Squircle radius="lg">
            <div className={styles.surface}>
              <div className={styles.inner}>
                <img
                  src={logo}
                  alt="Coffister"
                  className={styles.logo}
                />

                <div className={styles.actions}>
                  <EmailLink className={styles.email}>
                    <img src={emailIcon} alt={CONTACT_EMAIL} />
                  </EmailLink>

                  <div className={`${styles.cta} ${styles.shine}`}>
                    <LinkButton href="#pricing" size="sm" icon={ctaIcon} onClick={goToPricing}>
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
        <LinkButton href="#pricing" size="md" fullWidth icon={ctaIcon} onClick={goToPricing}>
          {CTA_LABEL}
        </LinkButton>
      </div>
    </>
  );
}
