const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact`;

export interface ContactPayload {
  subject: string;
  message: string;
  replyTo: string;
}

export async function sendContactMessage(payload: ContactPayload): Promise<void> {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("contact_send_failed");
  }
}
