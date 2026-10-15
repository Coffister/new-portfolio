import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft } from "@phosphor-icons/react";

import { Button } from "@/ui/components";
import { Box, Container, Section, Squircle, Stack, Text } from "@/ui/primitives";
import { spacing } from "@/ui/foundation/spacing";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useCursor } from "@/providers/CursorProvider";

import EstimatePlanner from "@/features/estimate";
import { defaultTabId, pricingTabs } from "./pricing";
import type { PricingPlan } from "./pricing";

import styles from "./PricingSection.module.css";

const squish = {
  hidden: { opacity: 0, y: spacing.md, scaleX: 1.06, scaleY: 0.88 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    transition: { type: "spring" as const, bounce: 0.5, duration: 0.7, delay: index * 0.06 },
  }),
  exit: { opacity: 0, scaleX: 0.94, scaleY: 1.04, transition: { duration: 0.15 } },
};

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
                </button>
              );
            })}
          </Box>

          <AnimatePresence mode="wait" initial={false}>
            {estimateService === null ? (
              <Box key={activeTab.id} className={styles.cards}>
                {activeTab.plans.map((plan, index) => (
                  <motion.div
                    key={plan.title}
                    className={`${styles.cardItem} ${plan.featured ? styles.featured : ""}`}
                    variants={squish}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <PricingCard plan={plan} onStart={() => setEstimateService(activeTab.service)} />
                  </motion.div>
                ))}
              </Box>
            ) : (
              <motion.div
                key="estimate"
                className={styles.estimate}
                variants={squish}
                custom={0}
                initial="hidden"
                animate="visible"
                exit="exit"
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
        </Stack>
      </Container>
    </Section>
  );
}

function PricingCard({ plan, onStart }: { plan: PricingPlan; onStart: () => void }) {
  return (
    <Squircle radius="lg" className={styles.card}>
      <Stack className={styles.cardHeader} gap="xs">
        <Text as="h3" variant="cardTitle" className={styles.cardTitle}>
          {plan.title}
        </Text>
        <Text as="p" variant="body" className={styles.cardDescription}>
          {plan.description}
        </Text>
      </Stack>

      <Squircle radius="md" className={styles.cardBody}>
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

        <Button fullWidth className={styles.cta} onClick={onStart}>
          Začať budovať projekt
        </Button>
      </Squircle>
    </Squircle>
  );
}
