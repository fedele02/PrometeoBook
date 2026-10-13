import type { Instrumentation } from "next";

/**
 * Every error Next.js catches on the server (page render, API route, admin
 * action, proxy) goes to the error log, Gestione → Log errori (src/lib/errors.ts).
 * Only safe details are kept: never cookies or request bodies.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { describe, saveError } = await import("./lib/errors");
  const d = describe(err);
  const ua = request.headers["user-agent"];
  await saveError(context.routeType, {
    message: d.message,
    stack: d.stack,
    path: request.path,
    context: {
      method: request.method,
      route: context.routePath,
      ...(d.digest && { digest: d.digest }),
      ...("renderSource" in context && context.renderSource && { renderSource: context.renderSource }),
      ...(ua && { userAgent: String(ua).slice(0, 300) }),
    },
  });
};
