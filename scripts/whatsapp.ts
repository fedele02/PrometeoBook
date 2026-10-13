/**
 * YCloud setup for the automatic WhatsApp messages to guests.
 *
 *   npm run whatsapp -- check              key, number, templates and webhook at a glance
 *   npm run whatsapp -- templates          submit the 4 templates to Meta (once; approval usually < 24 h)
 *   npm run whatsapp -- webhook            register <site>/api/whatsapp/webhook and print its secret
 *   npm run whatsapp -- test +39333…       send "richiesta ricevuta" to a number (a real, paid message)
 *
 * Reads .env.local: YCLOUD_API_KEY, YCLOUD_WHATSAPP_FROM, NEXT_PUBLIC_SITE_URL.
 * Run `templates` and `webhook` only once NEXT_PUBLIC_SITE_URL is the final domain:
 * the button links in the templates are fixed when Meta approves them.
 */
import { createRequest, sendComponents, TEMPLATES, WA_LANGUAGE } from "../src/lib/whatsapp/templates.ts";
import { toE164, ycloud } from "../src/lib/whatsapp/ycloud.ts";

const KEY = process.env.YCLOUD_API_KEY ?? "";
const FROM = toE164(process.env.YCLOUD_WHATSAPP_FROM ?? "");
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
const [command = "check", arg] = process.argv.slice(2);

const ok = (s: string) => console.log(`  ✓ ${s}`);
const bad = (s: string) => console.log(`  ✗ ${s}`);
const die = (s: string): never => {
  console.error(`\n✗ ${s}\n`);
  process.exit(1);
};

if (!KEY) die("Manca YCLOUD_API_KEY in .env.local (YCloud → Developers → API Keys).");
if (!FROM) die("Manca o non è valido YCLOUD_WHATSAPP_FROM in .env.local (il numero del ristorante, es. +39333…).");

type Page<T> = { items?: T[] };
type PhoneNumber = { phoneNumber: string; displayPhoneNumber?: string; wabaId: string; verifiedName?: string; qualityRating?: string; messagingLimit?: string };
type Template = { name: string; language: string; status: string; category: string; reason?: string };
type Endpoint = { id: string; url: string; status: string; enabledEvents: string[] };

const digits = (s: string) => s.replace(/\D/g, "");

async function phone(): Promise<PhoneNumber> {
  const res = await ycloud<Page<PhoneNumber>>(KEY, "/whatsapp/phoneNumbers?limit=100");
  if (!res.ok) die(`YCloud ha rifiutato la richiesta (${res.code}): ${res.message}`);
  const list = res.ok ? res.data.items ?? [] : [];
  const found = list.find((p) => digits(p.phoneNumber) === digits(FROM!));
  if (!found) die(`Il numero ${FROM} non è collegato a questo account YCloud. Numeri trovati: ${list.map((p) => p.phoneNumber).join(", ") || "nessuno"}.`);
  return found!;
}

async function templates(wabaId: string): Promise<Template[]> {
  const res = await ycloud<Page<Template>>(KEY, `/whatsapp/templates?limit=100&filter.wabaId=${encodeURIComponent(wabaId)}`);
  if (!res.ok) die(`Impossibile leggere i modelli (${res.code}): ${res.message}`);
  return res.ok ? res.data.items ?? [] : [];
}

const webhookUrl = () => `${SITE}/api/whatsapp/webhook`;

function requireFinalSite() {
  if (!SITE || /localhost|127\.0\.0\.1/.test(SITE)) die("NEXT_PUBLIC_SITE_URL deve essere l'indirizzo pubblico definitivo (https://…), non localhost.");
  if (!SITE.startsWith("https://")) die("NEXT_PUBLIC_SITE_URL deve iniziare con https://");
  if (SITE.endsWith(".vercel.app") && !process.argv.includes("--yes"))
    die(`Stai usando ${SITE}: i link nei modelli resteranno legati a questo indirizzo. Usa il dominio definitivo, oppure aggiungi --yes se è voluto.`);
}

async function check() {
  console.log("\nYCloud · WhatsApp\n");
  const p = await phone();
  ok(`Numero ${p.displayPhoneNumber ?? p.phoneNumber}${p.verifiedName ? ` (${p.verifiedName})` : ""} · WABA ${p.wabaId}`);
  if (p.qualityRating) ok(`Qualità ${p.qualityRating}${p.messagingLimit ? ` · limite ${p.messagingLimit}` : ""}`);

  console.log("\nModelli");
  const existing = await templates(p.wabaId);
  for (const def of Object.values(TEMPLATES)) {
    const t = existing.find((x) => x.name === def.name && x.language === WA_LANGUAGE);
    if (!t) bad(`${def.name}: non ancora inviato a Meta → npm run whatsapp -- templates`);
    else if (t.status === "APPROVED") ok(`${def.name}: approvato`);
    else bad(`${def.name}: ${t.status}${t.reason ? ` (${t.reason})` : ""}`);
  }

  console.log("\nWebhook");
  const eps = await ycloud<Page<Endpoint>>(KEY, "/webhookEndpoints?limit=100");
  const ep = eps.ok ? (eps.data.items ?? []).find((e) => e.url === webhookUrl()) : undefined;
  if (!SITE) bad("NEXT_PUBLIC_SITE_URL non impostato");
  else if (ep) ok(`${ep.url} · ${ep.status} · ${ep.enabledEvents.join(", ")}`);
  else bad(`${webhookUrl()} non registrato → npm run whatsapp -- webhook`);
  if (!process.env.YCLOUD_WEBHOOK_SECRET) bad("YCLOUD_WEBHOOK_SECRET non impostato (serve anche su Vercel)");
  else ok("YCLOUD_WEBHOOK_SECRET impostato");
  console.log("");
}

async function createTemplates() {
  requireFinalSite();
  const p = await phone();
  const existing = await templates(p.wabaId);
  console.log(`\nInvio dei modelli a Meta per ${p.displayPhoneNumber ?? p.phoneNumber} (link su ${SITE})\n`);
  for (const def of Object.values(TEMPLATES)) {
    if (existing.some((x) => x.name === def.name && x.language === WA_LANGUAGE)) {
      ok(`${def.name}: già presente`);
      continue;
    }
    const res = await ycloud<Template>(KEY, "/whatsapp/templates", { body: createRequest(def, SITE, p.wabaId) });
    if (res.ok) ok(`${def.name}: inviato (${res.data.status})`);
    else bad(`${def.name}: ${res.code} ${res.message}`);
  }
  console.log("\nMeta li revisiona in genere entro 24 ore: controlla con  npm run whatsapp -- check\n");
}

async function createWebhook() {
  requireFinalSite();
  const eps = await ycloud<Page<Endpoint>>(KEY, "/webhookEndpoints?limit=100");
  const existing = eps.ok ? (eps.data.items ?? []).find((e) => e.url === webhookUrl()) : undefined;
  if (existing) {
    ok(`Webhook già registrato: ${existing.url} (${existing.status}). Il secret è nel pannello YCloud → Developers → Webhooks.`);
    return;
  }
  const res = await ycloud<Endpoint & { secret?: string }>(KEY, "/webhookEndpoints", {
    body: { url: webhookUrl(), enabledEvents: ["whatsapp.message.updated"], description: "Prometeo · stato dei messaggi ai clienti" },
  });
  if (!res.ok) die(`Registrazione non riuscita (${res.code}): ${res.message}`);
  if (res.ok) {
    ok(`Registrato: ${res.data.url}`);
    console.log(`\nCopia questo valore in YCLOUD_WEBHOOK_SECRET (in .env.local e su Vercel), poi fai Redeploy:\n\n  ${res.data.secret ?? "(vedi pannello YCloud → Developers → Webhooks)"}\n`);
  }
}

async function test(to: string | undefined) {
  const dest = toE164(to ?? "");
  if (!dest) die("Indica il numero a cui mandare la prova: npm run whatsapp -- test +39333…");
  const def = TEMPLATES.requested;
  const res = await ycloud<{ id: string; status: string; errorMessage?: string }>(KEY, "/whatsapp/messages/sendDirectly", {
    body: {
      from: FROM,
      to: dest,
      type: "template",
      externalId: `test-${Date.now()}`,
      template: { name: def.name, language: { code: WA_LANGUAGE, policy: "deterministic" }, components: sendComponents(def, def.example, "K7M2QX9T") },
    },
  });
  if (!res.ok) die(`Invio non riuscito (${res.code}): ${res.message}`);
  if (res.ok) ok(`Inviato a ${dest} · stato ${res.data.status}${res.data.errorMessage ? ` · ${res.data.errorMessage}` : ""}`);
}

const commands: Record<string, () => Promise<void>> = { check, templates: createTemplates, webhook: createWebhook, test: () => test(arg) };
if (!commands[command]) die(`Comando sconosciuto "${command}". Usa: check | templates | webhook | test +39…`);
await commands[command]();
