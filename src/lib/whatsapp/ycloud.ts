/**
 * Minimal YCloud API client (https://docs.ycloud.com, API v2).
 * No runtime imports: also used by scripts/whatsapp.ts.
 */

/** YCLOUD_API_BASE only for tests against a local fake server; production always uses YCloud. */
export const YCLOUD_API = process.env.YCLOUD_API_BASE || "https://api.ycloud.com/v2";

export type YcloudResult<T> = { ok: true; data: T } | { ok: false; status: number; code: string; message: string };

export async function ycloud<T>(apiKey: string, path: string, init: { method?: string; body?: unknown; timeoutMs?: number } = {}): Promise<YcloudResult<T>> {
  try {
    const res = await fetch(`${YCLOUD_API}${path}`, {
      method: init.method ?? (init.body ? "POST" : "GET"),
      headers: { "X-API-Key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: init.body ? JSON.stringify(init.body) : undefined,
      signal: AbortSignal.timeout(init.timeoutMs ?? 10_000),
    });
    const text = await res.text();
    const json = text ? JSON.parse(text) : {};
    if (res.ok) return { ok: true, data: json as T };
    const err = json?.error ?? {};
    const meta = err.whatsappApiError?.message ?? err.whatsappApiError?.error_user_msg;
    return { ok: false, status: res.status, code: String(err.code ?? res.status), message: [err.message, meta].filter(Boolean).join(" · ") || res.statusText };
  } catch (e) {
    const timeout = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
    return { ok: false, status: 0, code: timeout ? "TIMEOUT" : "NETWORK", message: e instanceof Error ? e.message : String(e) };
  }
}

/** Phone number in E.164 (+39…). Numbers without a country code are Italian. Null if it can't be one. */
export function toE164(phone: string): string | null {
  const plus = phone.trim().startsWith("+");
  let d = phone.replace(/\D/g, "");
  if (!plus) {
    if (d.startsWith("00")) d = d.slice(2);
    else if (!(d.startsWith("39") && d.length >= 11)) d = `39${d}`;
  }
  return /^[1-9]\d{7,14}$/.test(d) ? `+${d}` : null;
}

export type YcloudMessage = { id: string; wamid?: string; status: string; errorCode?: string; errorMessage?: string; externalId?: string };
