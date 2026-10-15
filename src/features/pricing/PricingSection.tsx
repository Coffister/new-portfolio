import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";

import { Button } from "@/ui/components";
import { Box, Container, Section, Squircle, Stack, Text } from "@/ui/primitives";
import { spacing } from "@/ui/foundation/spacing";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCursor } from "@/providers/CursorProvider";

import EstimatePlanner from "@/features/estimate";
import { defaultTabId, pricingTabs } from "./pricing";
import type { PricingPlan } from "./pricing";

import styles from "./PricingSection.module.css";

// Old and new content overlap (popLayout) and crossfade through a blur, so a
// change reads as one shape morphing rather than out-then-in.
const morph = {
  hidden: { opacity: 0, scale: 0.96, filter: "blur(8px)" },
  visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
};

const morphTransition = { type: "spring" as const, bounce: 0.3, duration: 0.6 };

export default function PricingSection() {
  const reveal = useScrollReveal<HTMLDivElement>({ target: "children", stagger: 0.32 });
  const { setVariant } = useCursor();

  const [activeTabId, setActiveTabId] = useState(defaultTabId);
  const [estimateService, setEstimateService] = useState<number | null>(null);

  const activeTab = pricingTabs.find((tab) => tab.id === activeTabId) ?? pricingTabs[0];

  return (
    <Section id="pricing" className={styles.section}>
      <Container>
        <Stack ref={reveal} className={styles.content} gap="xl">
          <Text as="h2" variant="sectionTitle" className={styles.heading}>
            ŽIADNE CENOVÉ KÚZLA
          </Text>

          <Text as="p" variant="sectionSubtitle" className={styles.subtitle}>
            Žiadne skryté položky ani prekvapenia na faktúre. Pozrite si, čo
            jednotlivé riešenia zahŕňajú a koľko približne stoja
          </Text>

          <Box className={styles.tabs} role="tablist" aria-label="Kategórie služieb">
            {pricingTabs.map((tab) => {
              const isActive = tab.id === activeTab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={styles.tab}
                  onClick={() => {
                    setActiveTabId(tab.id);
                    setEstimateService(null);
                  }}
                  onMouseEnter={() => setVariant("pointer")}
                  onMouseLeave={() => setVariant("default")}
                >
                  {isActive && (
                    <motion.span
                      layoutId="pricing-tab-indicator"
                      className={styles.tabIndicator}
                      transition={{ type: "spring", bounce: 0.35, duration: 0.5 }}
                    />
                  )}
                  <Text as="span" variant="button" className={styles.tabLabel}>
                    {tab.label}
                  </Text>
                  <Text as="span" variant="button" className={styles.tabLabelShort}>
                    {tab.shortLabel}
                  </Text>
                </button>
              );
            })}
          </Box>

          <Box className={styles.stage}>
            <AnimatePresence mode="popLayout" initial={false}>
              {estimateService === null ? (
                <motion.div
                  key="cards"
                  className={styles.plans}
                  variants={morph}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={morphTransition}
                >
                  <Box className={`${styles.cards} ${activeTab.plans.length === 4 ? styles.cardsQuad : ""}`}>
                    {/* Cards are keyed by slot, so a tab switch morphs them in place;
                        `layout` glides them when the grid goes 3 <-> 2x2. */}
                    <AnimatePresence mode="popLayout" initial={false}>
                      {activeTab.plans.map((plan, index) => (
                        <motion.div
                          key={index}
                          layout="position"
                          className={`${styles.cardItem} ${plan.featured ? styles.featured : ""}`}
                          variants={morph}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          transition={morphTransition}
                        >
                          <PricingCard
                            plan={plan}
                            morphKey={activeTab.id}
                            delay={index * 0.05}
                            onStart={() => setEstimateService(activeTab.service)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </Box>

                  <AnimatePresence mode="popLayout" initial={false}>
                    {activeTab.extras && (
                      <motion.div
                        key="extras"
                        layout="position"
                        className={styles.extrasItem}
                        variants={morph}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={morphTransition}
                      >
                        <Squircle radius="2xl" className={styles.extras}>
                          <Text as="h3" variant="cardTitle" className={`${styles.cardTitle} ${styles.extrasTitle}`}>
                            Doplnkové služby
                          </Text>

                          <Squircle radius="xl" className={styles.extrasBody}>
                            <ul className={styles.extrasList}>
                              {activeTab.extras.map((extra) => (
                                <li key={extra.name} className={styles.extrasRow}>
                                  <Text as="span" variant="body" className={styles.featureLabel}>
                                    {extra.name}
                                  </Text>
                                  <Text as="span" variant="body" className={styles.extrasPrice}>
                                    {extra.price}
                                  </Text>
                                </li>
                              ))}
                            </ul>
                          </Squircle>
                        </Squircle>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="estimate"
                  className={styles.estimate}
                  variants={morph}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={morphTransition}
                >
                  <Button
                    icon={<ArrowLeft size={spacing.md} aria-hidden="true" />}
                    onClick={() => setEstimateService(null)}
                  >
                    Späť na cenník
                  </Button>

                  <EstimatePlanner service={estimateService} />
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Stack>
      </Container>
    </Section>
  );
}

interface PricingCardProps {
  plan: PricingPlan;
  /** changes when the tab switches; triggers the squish + content morph */
  morphKey: string;
  delay: number;
  onStart: () => void;
}

function PricingCard({ plan, morphKey, delay, onStart }: PricingCardProps) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const isFirstRender = useRef(true);

  // Card stays mounted across tabs; a soft squash-and-settle sells the morph.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    animate(
      scope.current,
      { scaleX: [1, 1.03, 0.99, 1], scaleY: [1, 0.95, 1.01, 1] },
      { duration: 0.6, ease: "easeInOut", delay },
    );
  }, [morphKey, animate, scope, delay]);

  return (
    <div ref={scope} className={styles.cardMotion}>
      <Squircle radius="2xl" className={styles.card}>
        <Morph morphKey={morphKey}>
          <Stack className={styles.cardHeader} gap="xs">
            <Text as="h3" variant="cardTitle" className={styles.cardTitle}>
              {plan.title}
            </Text>
            <Text as="p" variant="body" className={styles.cardDescription}>
              {plan.description}
            </Text>
          </Stack>
        </Morph>

        <Squircle radius="xl" className={styles.cardBody}>
          <Morph morphKey={morphKey}>
            <Stack className={styles.cardBodyContent} gap="md">
              <Text as="p" variant="price" className={styles.price}>
                {plan.price}
              </Text>

              <ul className={styles.features}>
                {plan.features.map(({ icon: Icon, label }, index) => (
                  <li key={index} className={styles.feature}>
                    <Icon size={spacing.md} aria-hidden="true" />
                    <Text as="span" variant="body" className={styles.featureLabel}>
                      {label}
                    </Text>
                  </li>
                ))}
              </ul>
            </Stack>
          </Morph>

          <Button
            fullWidth
            className={styles.cta}
            onClick={onStart}
            icon={plan.cta ? <ArrowRight size={spacing.md} aria-hidden="true" /> : undefined}
            iconPosition="right"
          >
            {plan.cta ?? "Začať budovať projekt"}
          </Button>
        </Squircle>
      </Squircle>
    </div>
  );
}

function Morph({ morphKey, children }: { morphKey: string; children: ReactNode }) {
  return (
    <div className={styles.morph}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={morphKey}
          variants={morph}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={morphTransition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
