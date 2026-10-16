import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Check } from "@phosphor-icons/react";

import { Button } from "@/ui/components";
import { Stack, Text } from "@/ui/primitives";
import { spacing } from "@/ui/foundation/spacing";
import { usePrivacyModal } from "@/providers/PrivacyModalProvider";

import partyImage from "@/assets/success/party.webp";

import { addOns, addOnsFor, formatPrice, startingTotal } from "./pricing";
import type { AddOnId, PricingPlan, PricingTab } from "./pricing";

import styles from "./PricingFlow.module.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactValues {
  name: string;
  email: string;
  company: string;
}

export type SendStatus = "idle" | "sending" | "error";

export const stepTitles = {
  addons: "Chcete k balíku aj niečo navyše?",
  contact: "Kam vám môžem poslať odpoveď?",
  sent: "Dopyt odoslaný.",
};

function totalLabel(plan: PricingPlan, selected: AddOnId[]) {
  const total = startingTotal(plan, selected);
  return total === null ? "Cena bude stanovená individuálne" : `Orientačne ${formatPrice(total)}`;
}

/* The one place the chosen plan is restated: plan + add-ons, starting total. */
function Summary({ plan, selected }: { plan: PricingPlan; selected: AddOnId[] }) {
  return (
    <div className={styles.summary}>
      <Text as="p" variant="caption" className={styles.summaryText}>
        {plan.title}
        {selected.length > 0 && ` + ${selected.map((id) => addOns[id].name).join(", ")}`}
      </Text>
      <Text as="p" variant="caption" className={styles.total}>
        {totalLabel(plan, selected)}
      </Text>
    </div>
  );
}

function BackButton({ onClick, children = "Späť" }: { onClick: () => void; children?: string }) {
  return (
    <button type="button" className={styles.backButton} onClick={onClick}>
      <Text as="span" variant="button" className={styles.backLabel}>
        {children}
      </Text>
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
  const options = addOnsFor(tab, plan);
  const isPriced = options.some((id) => addOns[id].priceFrom !== null);

  return (
    <Stack className={styles.step} gap="sm">
      <Text as="p" variant="caption" className={styles.lead}>
        {isPriced ? "Doplnkové služby nie sú povinné" : "Vyberte, čo by mal web vedieť. Výber nie je povinný."}
      </Text>

      <ul className={`${styles.addOns} ${options.length > 5 ? styles.addOnsCompact : ""}`}>
        {options.map((id) => {
          const addOn = addOns[id];
          const isChecked = selected.includes(id);

          return (
            <li key={id}>
              <label className={styles.addOn}>
                <input
                  type="checkbox"
                  className={styles.srOnly}
                  checked={isChecked}
                  onChange={() => onToggle(id)}
                />
                <span className={styles.checkbox} aria-hidden="true">
                  {isChecked && <Check size={spacing.sm} weight="bold" />}
                </span>
                <Text as="span" variant="caption" className={styles.addOnName}>
                  {addOn.name}
                </Text>
                {addOn.priceFrom !== null && (
                  <Text as="span" variant="caption" className={styles.addOnPrice}>
                    {formatPrice(addOn.priceFrom)}
                  </Text>
                )}
              </label>
            </li>
          );
        })}
      </ul>

      {isPriced && (
        <Text as="p" variant="caption" className={styles.noteText}>
          Ceny sú označené „od“, výsledný súčet je orientačný.
        </Text>
      )}

      <Summary plan={plan} selected={selected} />

      <div className={styles.actions}>
        <BackButton onClick={onBack} />
        <Button onClick={onNext}>
          <span className={styles.labelLong}>Pokračovať na kontakt</span>
          <span className={styles.labelShort}>Pokračovať</span>
        </Button>
      </div>
    </Stack>
  );
}

interface ContactStepProps {
  plan: PricingPlan;
  selected: AddOnId[];
  values: ContactValues;
  status: SendStatus;
  onChange: (values: ContactValues) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function ContactStep({ plan, selected, values, status, onChange, onBack, onSubmit }: ContactStepProps) {
  const { open: openPrivacyModal } = usePrivacyModal();
  const [showErrors, setShowErrors] = useState(false);
  const [consent, setConsent] = useState(false);

  const nameError = values.name.trim() ? "" : "Zadajte meno.";
  const emailError = EMAIL_PATTERN.test(values.email.trim()) ? "" : "Zadajte platný e-mail.";
  const consentError = consent ? "" : "Potvrďte, prosím, oboznámenie so zásadami.";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    if (nameError || emailError || consentError) {
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
      <label className={styles.field}>
        <Text as="span" variant="caption" className={styles.label}>
          Meno*
        </Text>
        <input
          {...field("name")}
          placeholder="Meno"
          autoComplete="name"
          className={`${styles.input} ${showErrors && nameError ? styles.inputError : ""}`}
          aria-invalid={showErrors && !!nameError}
        />
        {showErrors && nameError && <span className={styles.error}>{nameError}</span>}
      </label>

      <label className={styles.field}>
        <Text as="span" variant="caption" className={styles.label}>
          E-mail*
        </Text>
        <input
          {...field("email")}
          type="email"
          inputMode="email"
          placeholder="vas@email.sk"
          autoComplete="email"
          spellCheck={false}
          className={`${styles.input} ${showErrors && emailError ? styles.inputError : ""}`}
          aria-invalid={showErrors && !!emailError}
        />
        {showErrors && emailError && <span className={styles.error}>{emailError}</span>}
      </label>

      <label className={styles.field}>
        <Text as="span" variant="caption" className={styles.label}>
          Meno značky alebo firmy (nepovinné)
        </Text>
        <input {...field("company")} placeholder="Značka" autoComplete="organization" className={styles.input} />
      </label>

      <Summary plan={plan} selected={selected} />

      <label className={styles.consent}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          aria-invalid={showErrors && !!consentError}
        />
        <Text as="span" variant="caption" className={styles.consentText}>
          Oboznámil/a som sa so{" "}
          <button type="button" className={styles.privacyLink} onClick={openPrivacyModal}>
            zásadami ochrany osobných údajov
          </button>
          .
        </Text>
      </label>
      {showErrors && consentError && <span className={styles.error}>{consentError}</span>}

      {status === "error" && (
        <Text as="p" variant="caption" className={styles.error}>
          Dopyt sa nepodarilo odoslať. Skúste to prosím znova.
        </Text>
      )}

      <div className={styles.actions}>
        <BackButton onClick={onBack} />
        <Button type="submit" disabled={status === "sending"}>
          {status === "sending" ? (
            "Odosielam…"
          ) : (
            <>
              <span className={styles.labelLong}>Odoslať nezáväzný dopyt</span>
              <span className={styles.labelShort}>Odoslať dopyt</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export function SentStep() {
  return (
    <Stack className={`${styles.step} ${styles.sent}`} gap="sm">
      {/* Fixed 64px like the old check circle (JS tokens don't shrink on mobile). */}
      <img
        className={styles.sentImage}
        src={partyImage}
        alt=""
        width={spacing["3xl"]}
        height={spacing["3xl"]}
      />
      <Text as="h4" variant="sectionSubtitle" className={styles.sentTitle}>
        Ďalší krok je na mne.
      </Text>
      <Text as="p" variant="body" className={styles.sentText}>
        Do 24 hodín sa Vám ozvem e-mailom s ďalším postupom.
      </Text>
    </Stack>
  );
}
