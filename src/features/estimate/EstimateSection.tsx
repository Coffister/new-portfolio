import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "@phosphor-icons/react";

import { Box, Container, Section, Squircle, Stack, Text } from "@/ui/primitives";
import { useScrollReveal } from "@/hooks/useScrollReveal";

import EstimateSelect from "./EstimateSelect";
import EstimateEmailInput from "./EstimateEmailInput";
import {
  entityOptions,
  serviceOptions,
  scopeOptions,
  budgetOptions,
  timelineOptions,
  defaultSelections,
  calculateEstimate,
  formatPrice,
  formatDuration,
  type EstimateSelections,
} from "./estimate";

import styles from "./EstimateSection.module.css";

const RECALCULATION_DELAY = 500;
const CONTACT_CHECK_DELAY = 700;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactStatus = "idle" | "checking" | "done";

export default function EstimateSection() {
  const reveal = useScrollReveal<HTMLDivElement>({ target: "children", stagger: 0.32 });

  const [selections, setSelections] = useState<EstimateSelections>(defaultSelections);
  const [email, setEmail] = useState("");
  const [estimate, setEstimate] = useState(() => calculateEstimate(defaultSelections));
  const [isCalculating, setIsCalculating] = useState(false);
  const [contactStatus, setContactStatus] = useState<ContactStatus>("idle");

  const recalculationTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const contactTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastCalculatedRef = useRef(selections);

  useEffect(() => {
    return () => {
      clearTimeout(recalculationTimeout.current);
      clearTimeout(contactTimeout.current);
    };
  }, []);

  // Debounced recalculation lives in an effect (not inside the state updater) so
  // it stays a pure setState and behaves correctly under StrictMode. The ref
  // guard skips the mount pass (and StrictMode's double invoke) where the
  // selections object hasn't actually changed.
  useEffect(() => {
    if (lastCalculatedRef.current === selections) return;
    lastCalculatedRef.current = selections;

    setIsCalculating(true);
    clearTimeout(recalculationTimeout.current);

    recalculationTimeout.current = setTimeout(() => {
      setEstimate(calculateEstimate(selections));
      setIsCalculating(false);
    }, RECALCULATION_DELAY);

    return () => clearTimeout(recalculationTimeout.current);
  }, [selections]);

  const handleContactSubmit = () => {
    if (!EMAIL_PATTERN.test(email)) {
      return;
    }

    clearTimeout(contactTimeout.current);
    setContactStatus("checking");
    contactTimeout.current = setTimeout(() => {
      setContactStatus("done");
    }, CONTACT_CHECK_DELAY);
  };

  const updateSelection = <K extends keyof EstimateSelections>(key: K) => (value: EstimateSelections[K]) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Section id="estimate" className={styles.section}>
      <Container>
        <Stack ref={reveal} className={styles.content} gap="xl">
          <Stack className={styles.heading} gap="md">
            <Text as="h2" variant="sectionTitle" className={styles.title}>
              ODHAD PROJEKTU
            </Text>

            <Text as="p" variant="sectionSubtitle">
              Získajte orientačný odhad rozpočtu podľa vašich potrieb.
            </Text>
          </Stack>

          <Stack className={styles.cardGroup} gap="sm">
            <Squircle radius="lg" className={styles.card}>
              <Box className={styles.header}>
                <Text as="h2" variant="cardTitle" className={styles.headerTitle}>
                  Plánovač projektu
                </Text>

                <button
                  type="button"
                  className={styles.contactButton}
                  onClick={handleContactSubmit}
                  disabled={contactStatus === "checking" || contactStatus === "done"}
                >
                  {contactStatus === "checking" && "Kontrolujem email"}
                  {contactStatus === "done" && (
                    <>
                      Hotovo
                      <Check size={16} weight="bold" aria-hidden="true" />
                    </>
                  )}
                  {contactStatus === "idle" && "Odoslať kontakt"}
                </button>
              </Box>

              <Box className={styles.bodyWrapper}>
                <Squircle radius="sm" className={styles.body}>
                  <Stack gap="md">
                    <Text as="p" variant="body" className={styles.sentence}>
                      Zdravím, vediem{" "}
                      <EstimateSelect
                        options={entityOptions.map((option) => option.label)}
                        value={selections.entity}
                        onChange={updateSelection("entity")}
                      />{" "}
                      a potrebujem pomôcť s{" "}
                      <EstimateSelect
                        multiple
                        options={serviceOptions.map((option) => option.label)}
                        values={selections.service}
                        onChange={updateSelection("service")}
                      />
                      .
                    </Text>

                    <Text as="p" variant="body" className={styles.sentence}>
                      Projekt je{" "}
                      <EstimateSelect
                        options={scopeOptions.map((option) => option.label)}
                        value={selections.scope}
                        onChange={updateSelection("scope")}
                      />
                      . Rozpočet mám približne{" "}
                      <EstimateSelect
                        options={budgetOptions.map((option) => option.label)}
                        value={selections.budget}
                        onChange={updateSelection("budget")}
                      />
                      .
                    </Text>

                    <Text as="p" variant="body" className={styles.sentence}>
                      Ideálne by bolo projekt dokončiť{" "}
                      <EstimateSelect
                        options={timelineOptions.map((option) => option.label)}
                        value={selections.timeline}
                        onChange={updateSelection("timeline")}
                      />
                      .
                    </Text>

                    <Text as="p" variant="body" className={styles.sentence}>
                      Bol by som rád ak by ste ma kontaktovali na email{" "}
                      <EstimateEmailInput value={email} onChange={setEmail} />
                      . Ďakujem.
                    </Text>
                  </Stack>
                </Squircle>
              </Box>
            </Squircle>

            <Squircle radius="lg" className={styles.footer}>
              <Text as="p" variant="body" className={styles.footerLabel}>
                Odhad ceny
                <br />
                a času
              </Text>

              <Stack className={styles.footerValue} gap="xs">
                <AnimatePresence mode="wait">
                  {isCalculating ? (
                    <motion.div
                      key="skeleton"
                      className={styles.skeleton}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className={`${styles.skeletonBar} ${styles.skeletonPrice}`} />
                      <span className={`${styles.skeletonBar} ${styles.skeletonDuration}`} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="value"
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <Text as="p" variant="body" className={styles.price}>
                        {formatPrice(estimate.priceMin, estimate.priceMax)}
                      </Text>

                      <Text as="p" variant="caption" className={styles.duration}>
                        {formatDuration(estimate.weeksMin, estimate.weeksMax)}
                      </Text>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Stack>
            </Squircle>
          </Stack>


          <Text as="p" variant="caption" className={styles.disclaimer}>
            Uvedené ceny sú orientačné a môžu sa líšiť v závislosti od
            rozsahu, náročnosti a konkrétnych požiadaviek projektu. Presnú
            cenovú ponuku pripravím po krátkej konzultácii.
          </Text>
        </Stack>
      </Container>
    </Section>
  );
}
