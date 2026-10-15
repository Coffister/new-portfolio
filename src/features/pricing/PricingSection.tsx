import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion, useAnimate, useReducedMotion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";

import { Button } from "@/ui/components";
import { Box, Container, Section, Squircle, Stack, Text } from "@/ui/primitives";
import { spacing } from "@/ui/foundation/spacing";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useCursor } from "@/providers/CursorProvider";
import { sendContactMessage } from "@/lib/contact";
import { getLenis } from "@/lib/scroll";

import { AddOnsStep, ContactStep, SentStep, stepTitles } from "./PricingFlow";
import type { ContactValues, SendStatus } from "./PricingFlow";
import { addOns, defaultTabId, formatPrice, pricingTabs, startingTotal } from "./pricing";
import type { AddOnId, PricingPlan, PricingTab } from "./pricing";

import styles from "./PricingSection.module.css";

type Step = "addons" | "contact" | "sent";

interface BehindPose {
  side: number;
  distance: number;
  /** mobile or reduced motion: no fanned stack, just fade out */
  flat: boolean;
}

const morphTransition = { type: "spring" as const, bounce: 0.3, duration: 0.6 };
// Card travel between grid and focus: eased, barely any overshoot.
const focusTransition = { type: "spring" as const, bounce: 0.12, duration: 0.65 };
// Old and new content overlap (popLayout) and crossfade through a blur, so a
// change reads as one shape morphing rather than out-then-in.
const morph = {
  hidden: { opacity: 0, scale: 0.96, filter: "blur(8px)", x: 0, y: 0, rotate: 0 },
  visible: { opacity: 1, scale: 1, filter: "blur(0px)", x: 0, y: 0, rotate: 0 },
  // Unselected plans slide in behind the chosen card, then fade out
  // completely; CSS then sets visibility: hidden (.behindItem). Flat
  // mode (mobile / reduced motion) skips the spatial tuck and only fades.
  behind: ({ side, distance, flat }: BehindPose) => ({
    opacity: 0,
    scale: flat ? 1 : 1 - 0.06 * distance,
    filter: "blur(0px)",
    x: flat ? 0 : side * spacing.sm * distance,
    y: flat ? 0 : spacing.sm * distance,
    rotate: flat ? 0 : side * 2,
    transition: {
      ...focusTransition,
      opacity: { duration: 0.25, delay: flat ? 0 : 0.3 },
    },
  }),
};

const FOCUS_LOCK_MS = 650;

const emptyContact: ContactValues = { name: "", email: "", company: "" };

function buildMessage(tab: PricingTab, plan: PricingPlan, selected: AddOnId[], contact: ContactValues) {
  const total = startingTotal(plan, selected);
  const addOnList = selected.map((id) => `${addOns[id].name} (${formatPrice(addOns[id].priceFrom)})`).join(", ");

  return [
    `Meno: ${contact.name.trim()}`,
    contact.company.trim() && `Značka / firma: ${contact.company.trim()}`,
    `Služba: ${tab.label}`,
    `Balík: ${plan.title} (${plan.id}), ${formatPrice(plan.priceFrom)}`,
    `Doplnky: ${addOnList || "bez doplnkov"}`,
    `Orientačná cena: ${total === null ? "individuálna cenová ponuka" : formatPrice(total)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export default function PricingSection() {
  const reveal = useScrollReveal<HTMLDivElement>({ target: "children", stagger: 0.32 });
  const { setVariant } = useCursor();
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const prefersReducedMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);

  const [activeTabId, setActiveTabId] = useState(defaultTabId);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [step, setStep] = useState<Step>("contact");
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnId[]>([]);
  const [contact, setContact] = useState<ContactValues>(emptyContact);
  const [sendStatus, setSendStatus] = useState<SendStatus>("idle");
  const [isMoving, setIsMoving] = useState(false);
  const lockTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(lockTimeout.current), []);

  const activeTab = pricingTabs.find((tab) => tab.id === activeTabId) ?? pricingTabs[0];
  const isFocused = selectedIndex !== null;
  const hasAddOns = activeTab.addOns.length > 0;

  // Blocks repeat clicks while cards are travelling.
  const lockWhileMoving = () => {
    setIsMoving(true);
    clearTimeout(lockTimeout.current);
    lockTimeout.current = setTimeout(() => setIsMoving(false), FOCUS_LOCK_MS);
  };

  const selectPlan = (index: number) => {
    if (isMoving) return;
    lockWhileMoving();

    setSelectedIndex(index);
    setStep(hasAddOns ? "addons" : "contact");
    setSendStatus("idle");
    // Keep picks that still apply to this category, drop the rest.
    setSelectedAddOns((current) => current.filter((id) => activeTab.addOns.includes(id)));

    const stage = stageRef.current;
    if (stage && stage.getBoundingClientRect().top < 0) {
      getLenis()?.scrollTo(stage, { offset: -spacing["3xl"] * 2 });
    }
  };

  const backToPricing = () => {
    lockWhileMoving();
    setSelectedIndex(null);
  };

  const selectTab = (tabId: string) => {
    if (tabId === activeTabId && !isFocused) return;
    setActiveTabId(tabId);
    if (isFocused) backToPricing();
  };

  const toggleAddOn = (id: AddOnId) =>
    setSelectedAddOns((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  const submit = async (plan: PricingPlan) => {
    setSendStatus("sending");
    try {
      await sendContactMessage({
        subject: `Dopyt z cenníka: ${plan.title}`,
        message: buildMessage(activeTab, plan, selectedAddOns, contact),
        replyTo: contact.email.trim(),
      });
      setSendStatus("idle");
      setStep("sent");
    } catch {
      setSendStatus("error");
    }
  };

  const finish = () => {
    setSelectedAddOns([]);
    setContact(emptyContact);
    backToPricing();
  };

  const renderFlow = (plan: PricingPlan) => {
    if (step === "addons") {
      return (
        <AddOnsStep
          tab={activeTab}
          plan={plan}
          selected={selectedAddOns}
          onToggle={toggleAddOn}
          onBack={backToPricing}
          onNext={() => setStep("contact")}
        />
      );
    }

    if (step === "sent") {
      return <SentStep email={contact.email.trim()} onDone={finish} />;
    }

    return (
      <ContactStep
        plan={plan}
        selected={selectedAddOns}
        values={contact}
        status={sendStatus}
        onChange={setContact}
        onBack={hasAddOns ? () => setStep("addons") : backToPricing}
        onSubmit={() => submit(plan)}
      />
    );
  };

  const stepCount = hasAddOns ? 2 : 1;
  // The chosen plan is restated in the step's summary, so the header only
  // tracks progress (and stays empty for the single-step web flow).
  const stepLabel = step !== "sent" && stepCount === 2 ? `Krok ${step === "addons" ? 1 : 2} z 2` : "";

  return (
    <Section id="pricing" className={styles.section}>
      <MotionConfig reducedMotion="user">
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
                    onClick={() => selectTab(tab.id)}
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

            <div ref={stageRef} className={styles.stage}>
              {/* Cards are keyed by slot, so a tab switch morphs them in place.
                  `layout` FLIPs them between the grid and the focused stack. */}
              <Box
                className={[
                  styles.cards,
                  activeTab.plans.length === 4 && !isFocused ? styles.cardsQuad : "",
                  isFocused ? styles.cardsFocused : "",
                ].join(" ")}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {activeTab.plans.map((plan, index) => {
                    const isSelected = selectedIndex === index;
                    const isBehind = isFocused && !isSelected;

                    return (
                      <motion.div
                        key={index}
                        layout
                        className={[
                          styles.cardItem,
                          plan.featured ? styles.featured : "",
                          isSelected ? styles.selectedItem : "",
                          isBehind ? styles.behindItem : "",
                        ].join(" ")}
                        variants={morph}
                        custom={{
                          side: Math.sign(index - (selectedIndex ?? index)),
                          distance: Math.abs(index - (selectedIndex ?? index)),
                          flat: isMobile || !!prefersReducedMotion,
                        }}
                        initial="hidden"
                        animate={isBehind ? "behind" : "visible"}
                        exit="hidden"
                        transition={isMoving ? focusTransition : morphTransition}
                        inert={isBehind}
                      >
                        <PricingCard
                          plan={plan}
                          morphKey={activeTab.id}
                          delay={index * 0.05}
                          disabled={isMoving}
                          onStart={() => selectPlan(index)}
                          flow={
                            isSelected
                              ? {
                                  key: step,
                                  label: stepLabel,
                                  title: stepTitles[step],
                                  content: renderFlow(plan),
                                }
                              : undefined
                          }
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </Box>
            </div>
          </Stack>
        </Container>
      </MotionConfig>
    </Section>
  );
}

interface PricingCardProps {
  plan: PricingPlan;
  /** changes when the tab switches; triggers the squish + content morph */
  morphKey: string;
  delay: number;
  disabled: boolean;
  onStart: () => void;
  /** when set, the card is the focused enquiry form */
  flow?: { key: string; label: string; title: string; content: ReactNode };
}

function PricingCard({ plan, morphKey, delay, disabled, onStart, flow }: PricingCardProps) {
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
        <Morph morphKey={`${morphKey}-${flow ? `flow-${flow.key}` : "plan"}`}>
          {flow ? (
            <Stack className={styles.cardHeader} gap="xs">
              {flow.label && (
                <Text as="span" variant="caption" className={styles.cardEyebrow}>
                  {flow.label}
                </Text>
              )}
              <Text as="h3" variant="cardTitle" className={`${styles.cardTitle} ${styles.flowTitle}`}>
                {flow.title}
              </Text>
            </Stack>
          ) : (
            <Stack className={styles.cardHeader} gap="xs">
              <Text as="h3" variant="cardTitle" className={styles.cardTitle}>
                {plan.title}
              </Text>
              <Text as="p" variant="body" className={styles.cardDescription}>
                {plan.description}
              </Text>
            </Stack>
          )}
        </Morph>

        <Squircle radius="xl" className={styles.cardBody}>
          <Morph fill morphKey={`${morphKey}-${flow ? flow.key : "plan"}`}>
            {flow ? (
              flow.content
            ) : (
              <>
                <Stack className={styles.cardBodyContent} gap="md">
                  <Text as="p" variant="price" className={styles.price}>
                    {formatPrice(plan.priceFrom)}
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

                <Button
                  fullWidth
                  className={styles.cta}
                  disabled={disabled}
                  onClick={onStart}
                  icon={plan.cta ? <ArrowRight size={spacing.md} aria-hidden="true" /> : undefined}
                  iconPosition="right"
                >
                  {plan.cta ?? "Začať budovať projekt"}
                </Button>
              </>
            )}
          </Morph>
        </Squircle>
      </Squircle>
    </div>
  );
}

function Morph({ morphKey, fill, children }: { morphKey: string; fill?: boolean; children: ReactNode }) {
  return (
    <div className={`${styles.morph} ${fill ? styles.morphFill : ""}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={morphKey}
          layout
          className={styles.morphContent}
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
