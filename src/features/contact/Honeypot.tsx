import type { CSSProperties } from "react";

// Spam trap instead of a captcha: people never see or reach this field, form
// bots fill every input they find. api/contact.ts drops enquiries that have it.
const HONEYPOT_NAME = "website";

// Off-screen rather than display:none, which some bots skip.
const hidden: CSSProperties = {
  position: "absolute",
  left: "-10000px",
  width: 1,
  height: 1,
  overflow: "hidden",
};

export default function Honeypot() {
  return (
    <div style={hidden} aria-hidden="true">
      <label>
        Nechajte prázdne
        <input type="text" name={HONEYPOT_NAME} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

export function honeypotValue(form: HTMLFormElement): string {
  const field = form.elements.namedItem(HONEYPOT_NAME);
  return field instanceof HTMLInputElement ? field.value : "";
}
