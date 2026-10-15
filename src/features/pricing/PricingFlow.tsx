import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check } from "@phosphor-icons/react";

import { Button } from "@/ui/components";
import { Stack, Text } from "@/ui/primitives";
import { spacing } from "@/ui/foundation/spacing";
import { usePrivacyModal } from "@/providers/PrivacyModalProvider";

import { addOns, formatPrice, startingTotal } from "./pricing";
import type { AddOnId, PricingPlan, PricingTab } from "./pricing";

import styles from "./PricingFlow.module.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactValues {
  name: string;
  email: string;
  company: string;
}

export type SendStatus = "idle" | "sending" | "error";

function totalLabel(plan: PricingPlan, selected: AddOnId[]) {
  const total = startingTotal(plan, selected);
  return total === null ? "Individuálna cenová ponuka" : formatPrice(total);
}

function BackLink({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button type="button" className={styles.backLink} onClick={onClick}>
      <ArrowLeft size={spacing.sm} aria-hidden="true" />
      {children}
    </button>
  );
}

interface AddOnsStepProps {
  tab: PricingTab;
  plan: PricingPlan;
  selected: AddOnId[];
  onToggle: (id: AddOnId) => void;
  onBack: () => void;
  onNext: () => void;
}

export function AddOnsStep({ tab, plan, selected, onToggle, onBack, onNext }: AddOnsStepProps) {
  return (
    <Stack className={styles.step} gap="md">
      <Stack gap="xs">
        <Text as="h4" variant="sectionSubtitle" className={styles.stepTitle}>
          Chcete k tomu niečo navyše?
        </Text>
        <Text as="p" variant="caption" className={styles.muted}>
          Nepovinné. Pokračovať môžete aj bez doplnkov.
        </Text>
      </Stack>

      <ul className={styles.addOns}>
        {tab.addOns.map((id) => {
          const addOn = addOns[id];
          const isChecked = selected.includes(id);

          return (
            <li key={id}>
              <label className={`${styles.addOn} ${isChecked ? styles.addOnChecked : ""}`}>
                <input
                  type="checkbox"
                  className={styles.srOnly}
                  checked={isChecked}
                  onChange={() => onToggle(id)}
                />
                <span className={styles.checkbox} aria-hidden="true">
                  {isChecked && <Check size={spacing.sm} weight="bold" />}
                </span>
                <span className={styles.addOnText}>
                  <Text as="span" variant="body" className={styles.addOnName}>
                    {addOn.name}
                  </Text>
                  <Text as="span" variant="caption" className={styles.muted}>
                    {addOn.description}
                  </Text>
                </span>
                <Text as="span" variant="caption" className={styles.addOnPrice}>
                  + {formatPrice(addOn.priceFrom)}
                </Text>
              </label>
            </li>
          );
        })}
      </ul>

      <div className={styles.totalRow}>
        <Text as="span" variant="caption" className={styles.muted}>
          Orientačne spolu
        </Text>
        <Text as="span" variant="body" className={styles.total}>
          {totalLabel(plan, selected)}
        </Text>
      </div>

      <div className={styles.actions}>
        <BackLink onClick={onBack}>Zmeniť balík</BackLink>
        <Button icon={<ArrowRight size={spacing.md} aria-hidden="true" />} iconPosition="right" onClick={onNext}>
          Pokračovať
        </Button>
      </div>
    </Stack>
  );
}

interface ContactStepProps {
  tab: PricingTab;
  plan: PricingPlan;
  selected: AddOnId[];
  values: ContactValues;
  status: SendStatus;
  onChange: (values: ContactValues) => void;
  onBack: () => void;
  backLabel: string;
  onSubmit: () => void;
}

export function ContactStep({
  tab,
  plan,
  selected,
  values,
  status,
  onChange,
  onBack,
  backLabel,
  onSubmit,
}: ContactStepProps) {
  const { open: openPrivacyModal } = usePrivacyModal();
  const [showErrors, setShowErrors] = useState(false);

  const nameError = values.name.trim() ? "" : "Zadajte meno.";
  const emailError = EMAIL_PATTERN.test(values.email.trim()) ? "" : "Zadajte platný e-mail.";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    if (nameError || emailError) {
      setShowErrors(true);
      return;
    }

    onSubmit();
  };

  const field = (key: keyof ContactValues) => ({
    value: values[key],
    onChange: (event: ChangeEvent<HTMLInputElement>) => onChange({ ...values, [key]: event.target.value }),
  });

  return (
    <form className={styles.step} onSubmit={handleSubmit} noValidate>
      <Stack gap="md">
        <Stack gap="xs">
          <Text as="h4" variant="sectionSubtitle" className={styles.stepTitle}>
            Kam vám môžem poslať odpoveď?
          </Text>
          <Text as="p" variant="caption" className={styles.muted}>
            Ide o nezáväzný dopyt. Ozvem sa vám s ďalším postupom.
          </Text>
        </Stack>

        <Stack gap="sm">
          <label className={styles.field}>
            <Text as="span" variant="caption" className={styles.label}>
              Meno *
            </Text>
            <input
              {...field("name")}
              className={`${styles.input} ${showErrors && nameError ? styles.inputError : ""}`}
              autoComplete="name"
              aria-invalid={showErrors && !!nameError}
            />
            {showErrors && nameError && <span className={styles.error}>{nameError}</span>}
          </label>

          <label className={styles.field}>
            <Text as="span" variant="caption" className={styles.label}>
              E-mail *
            </Text>
            <input
              {...field("email")}
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              className={`${styles.input} ${showErrors && emailError ? styles.inputError : ""}`}
              aria-invalid={showErrors && !!emailError}
            />
            {showErrors && emailError && <span className={styles.error}>{emailError}</span>}
          </label>

          <label className={styles.field}>
            <Text as="span" variant="caption" className={styles.label}>
              Značka alebo firma (nepovinné)
            </Text>
            <input {...field("company")} className={styles.input} autoComplete="organization" />
          </label>
        </Stack>

        <dl className={styles.summary}>
          <div className={styles.summaryRow}>
            <dt>Balík</dt>
            <dd>
              {plan.title} · {tab.label}
            </dd>
          </div>
          {tab.addOns.length > 0 && (
            <div className={styles.summaryRow}>
              <dt>Doplnky</dt>
              <dd>{selected.length ? selected.map((id) => addOns[id].name).join(", ") : "Bez doplnkov"}</dd>
            </div>
          )}
          <div className={styles.summaryRow}>
            <dt>Orientačná cena</dt>
            <dd className={styles.total}>{totalLabel(plan, selected)}</dd>
          </div>
        </dl>

        <Text as="p" variant="caption" className={styles.muted}>
          Ceny sú východiskové, presnú ponuku pripravím po krátkej konzultácii. Odoslaním súhlasíte so
          spracovaním uvedených údajov za účelom vybavenia dopytu. Viac v{" "}
          <button type="button" className={styles.privacyLink} onClick={openPrivacyModal}>
            zásadách ochrany osobných údajov
          </button>
          .
        </Text>

        {status === "error" && (
          <Text as="p" variant="caption" className={styles.error}>
            Dopyt sa nepodarilo odoslať. Skúste to prosím znova.
          </Text>
        )}

        <div className={styles.actions}>
          <BackLink onClick={onBack}>{backLabel}</BackLink>
          <Button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Odosielam…" : "Odoslať nezáväzný dopyt"}
          </Button>
        </div>
      </Stack>
    </form>
  );
}

export function SentStep({ email, onDone }: { email: string; onDone: () => void }) {
  return (
    <Stack className={`${styles.step} ${styles.sent}`} gap="md">
      <span className={styles.sentIcon} aria-hidden="true">
        <Check size={spacing.lg} weight="bold" />
      </span>
      <Text as="h4" variant="sectionSubtitle" className={styles.stepTitle}>
        Dopyt je odoslaný
      </Text>
      <Text as="p" variant="body" className={styles.muted}>
        Odpoveď vám pošlem na {email}.
      </Text>
      <Button onClick={onDone}>Späť na cenník</Button>
    </Stack>
  );
}
