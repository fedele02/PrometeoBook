/**
 * Errors in the visitor's browser (site and Gestione) are sent to /api/log-error
 * and end up in Gestione → Log errori. At most a few per page, each message once,
 * and never anything that comes from browser extensions.
 */

const MAX_PER_PAGE = 10;
const sent = new Set<string>();

// noise that says nothing about our code
const IGNORE = [/^Script error\.?$/i, /ResizeObserver loop/i, /extension:\/\//i, /^AbortError/i, /The operation was aborted/i];

function report(kind: "error" | "promise", message: string, stack = "", file = "") {
  try {
    if (!message || sent.size >= MAX_PER_PAGE || sent.has(message)) return;
    if (IGNORE.some((re) => re.test(message) || re.test(file) || re.test(stack))) return;
    sent.add(message);
    const body = JSON.stringify({
      kind,
      message: message.slice(0, 2000),
      stack: stack.slice(0, 6000),
      file: file.slice(0, 300),
      path: location.pathname + location.search,
    });
    // keepalive: the report still leaves if the page is being closed
    fetch("/api/log-error", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
  } catch {
    /* reporting must never cause another error */
  }
}

const text = (v: unknown) => (v instanceof Error ? v.message || v.name : typeof v === "string" ? v : (() => { try { return JSON.stringify(v); } catch { return String(v); } })());

window.addEventListener("error", (e) => {
  // a broken <img> or <script> fires "error" without a message: skip it
  if (!e.message && !e.error) return;
  report("error", e.error ? text(e.error) : e.message, e.error instanceof Error ? e.error.stack ?? "" : "", e.filename ?? "");
});

window.addEventListener("unhandledrejection", (e) => {
  report("promise", text(e.reason), e.reason instanceof Error ? e.reason.stack ?? "" : "");
});
