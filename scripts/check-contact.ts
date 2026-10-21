// Self-check for api/contact.ts with a stubbed Resend:
//   node --experimental-strip-types scripts/check-contact.ts
import assert from "node:assert/strict";
import { POST } from "../api/contact.ts";

const sent: any[] = [];
globalThis.fetch = (async (_url: string, init: RequestInit) => {
  sent.push(JSON.parse(init.body as string));
  return new Response("{}", { status: 200 });
}) as typeof fetch;

const post = (body: unknown) =>
  POST(new Request("http://x/api/contact", { method: "POST", body: JSON.stringify(body) }));

delete process.env.RESEND_API_KEY;
assert.equal((await post({})).status, 500, "missing key");

process.env.RESEND_API_KEY = "test";
assert.equal((await post({ subject: "Hi", message: "x", replyTo: "nope" })).status, 400, "bad email");
assert.equal((await post({ subject: "Hi", message: "x".repeat(5001), replyTo: "a@b.sk" })).status, 400, "too long");
assert.equal(sent.length, 0, "nothing sent for invalid input");

const ok = await post({ subject: "Dopyt\r\nBcc: x@y.z", message: "Ahoj", replyTo: "jan@firma.sk" });
assert.equal(ok.status, 200);
assert.equal(sent[0].reply_to, "jan@firma.sk");
assert.equal(sent[0].subject, "Dopyt Bcc: x@y.z", "no header injection");

console.log("contact: ok");
