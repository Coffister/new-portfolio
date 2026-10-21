// Vercel Function: forwards an enquiry from the site to the inbox via Resend.
// Env: RESEND_API_KEY (required), CONTACT_TO (default hello@coffister.art),
// CONTACT_FROM (a sender on a Resend-verified domain).

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_SUBJECT = 200;
const MAX_MESSAGE = 5000;

const json = (status: number, body: object) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return json(500, { error: "not_configured" });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const { subject, message, replyTo } = (payload ?? {}) as Record<string, unknown>;
  if (
    typeof subject !== "string" || !subject.trim() || subject.length > MAX_SUBJECT ||
    typeof message !== "string" || !message.trim() || message.length > MAX_MESSAGE ||
    typeof replyTo !== "string" || !EMAIL_PATTERN.test(replyTo)
  ) {
    return json(400, { error: "invalid_payload" });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? "Coffister web <web@coffister.art>",
      to: process.env.CONTACT_TO ?? "hello@coffister.art",
      reply_to: replyTo,
      // newlines in a subject would break the mail header
      subject: subject.replace(/[\r\n]+/g, " ").trim(),
      text: `${message}\n\n—\nOdpoveď ide na: ${replyTo}`,
    }),
  });

  if (!response.ok) {
    console.error("resend_failed", response.status, await response.text());
    return json(502, { error: "send_failed" });
  }

  return json(200, { ok: true });
}
