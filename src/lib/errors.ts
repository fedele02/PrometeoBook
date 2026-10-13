import "server-only";
import { randomUUID } from "node:crypto";
import { repo } from "./data";
import type { ErrorLog, ErrorSource } from "./types";

/*
 * Error log shown in Gestione → Log errori. Three ways in:
 * - src/instrumentation.ts   every error Next.js catches on the server (pages, API, admin actions, proxy)
 * - /api/log-error           errors in the visitors' browsers (src/instrumentation-client.ts)
 * - logError() below         errors the app catches and handles itself (a push or a WhatsApp that didn't go out…)
 *
 * Never stores cookies, passwords or request bodies: only the message, the stack,
 * the path and a few safe details. Logging never throws.
 */

const cut = (s: unknown, max: number) => String(s ?? "").slice(0, max);

export function describe(err: unknown): { message: string; stack: string; digest?: string } {
  if (err instanceof Error) {
    const digest = "digest" in err && err.digest ? String(err.digest) : undefined;
    return { message: err.message || err.name, stack: err.stack ?? "", digest };
  }
  if (typeof err === "object" && err !== null) {
    try {
      return { message: JSON.stringify(err), stack: "" };
    } catch {
      /* fall through */
    }
  }
  return { message: String(err), stack: "" };
}

export async function saveError(source: ErrorSource, input: { message: string; stack?: string; path?: string; context?: Record<string, unknown> }) {
  const entry: ErrorLog = {
    id: randomUUID(),
    created_at: new Date().toISOString(),
    source,
    message: cut(input.message, 2000) || "(nessun messaggio)",
    stack: cut(input.stack, 8000),
    path: cut(input.path, 500),
    context: input.context ?? {},
  };
  try {
    await repo().saveErrorLog(entry);
  } catch (e) {
    // the log itself must never break anything (database down, table not created yet…)
    console.error("error log: could not save", e);
  }
}

/**
 * An error the app caught and handled: still written to Vercel's logs, and now
 * also to the error log. `what` says what the app was doing, in plain words.
 */
export async function logError(what: string, err?: unknown, context: Record<string, unknown> = {}) {
  const d = err === undefined ? { message: what, stack: "" } : describe(err);
  console.error(what, err ?? "");
  await saveError("handled", {
    message: err === undefined ? what : `${what}: ${d.message}`,
    stack: d.stack,
    context: { ...context, ...(d.digest && { digest: d.digest }) },
  });
}
