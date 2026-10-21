// Vercel Function in /api; `vite dev` doesn't serve it, `vercel dev` does.
const CONTACT_URL = "/api/contact";

export interface ContactPayload {
  subject: string;
  message: string;
  replyTo: string;
  /** honeypot: empty for people, filled by bots */
  website?: string;
}

export async function sendContactMessage(payload: ContactPayload): Promise<void> {
  const response = await fetch(CONTACT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("contact_send_failed");
  }
}
