import { handleWebhookEvent, isWebhookConfigured, verifySignature } from "@/lib/whatsapp";

/**
 * YCloud webhook: delivery status of the WhatsApp messages sent to guests
 * (sent → delivered → read, or failed). Registered with `npm run whatsapp -- webhook`.
 * Every request must carry a valid YCloud-Signature, otherwise it is refused.
 */
export async function POST(req: Request) {
  if (!isWebhookConfigured()) return Response.json({ error: "webhook not configured" }, { status: 503 });

  // the signature covers the exact bytes received: read the raw text, parse after
  const raw = await req.text();
  if (!verifySignature(req.headers.get("ycloud-signature"), raw)) return Response.json({ error: "invalid signature" }, { status: 401 });

  let event: unknown;
  try {
    event = JSON.parse(raw);
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  try {
    await handleWebhookEvent(event as Parameters<typeof handleWebhookEvent>[0]);
  } catch (e) {
    // a non-2xx answer makes YCloud retry later
    console.error("whatsapp webhook failed", e);
    return Response.json({ error: "temporary failure" }, { status: 500 });
  }
  return Response.json({ ok: true });
}

/** Lets you open the URL in a browser to check it is online. */
export function GET() {
  return new Response("Prometeo · webhook WhatsApp attivo", { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
