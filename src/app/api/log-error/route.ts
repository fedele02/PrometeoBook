import { saveError } from "@/lib/errors";

/**
 * Errors from the visitors' browsers (src/instrumentation-client.ts) → error log.
 * Public on purpose, so it is kept small: limited size, a few reports per
 * minute per address, plain text only.
 */

const MAX_BODY = 16_000;
const PER_MINUTE = 20;
const hits = new Map<string, { at: number; n: number }>();

function tooMany(ip: string) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.at > 60_000) {
    hits.set(ip, { at: now, n: 1 });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  return ++h.n > PER_MINUTE;
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(ip)) return new Response(null, { status: 429 });

  const raw = await req.text();
  if (raw.length > MAX_BODY) return new Response(null, { status: 413 });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response(null, { status: 400 });
  }
  const message = str(body.message, 2000);
  if (!message) return new Response(null, { status: 400 });

  await saveError("browser", {
    message,
    stack: str(body.stack, 6000),
    path: str(body.path, 500),
    context: {
      kind: str(body.kind, 20),
      ...(str(body.file, 300) && { file: str(body.file, 300) }),
      userAgent: str(req.headers.get("user-agent"), 300),
    },
  });
  return new Response(null, { status: 204 });
}
