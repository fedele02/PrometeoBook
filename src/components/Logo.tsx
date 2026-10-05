import { EMBLEM, WORDMARK } from "./logo-paths";

/** The hand-and-flame emblem (vector trace of the official logo). */
export function Emblem({ className = "", title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox={`0 0 ${EMBLEM.w} ${EMBLEM.h}`}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="currentColor"
    >
      <path fillRule="evenodd" d={EMBLEM.d} />
    </svg>
  );
}

/** "PROMETEO" in the original lettering. */
export function Wordmark({ className = "", title = "Prometeo" }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox={`0 0 ${WORDMARK.w} ${WORDMARK.h}`}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      fill="currentColor"
    >
      <path fillRule="evenodd" d={WORDMARK.d} />
    </svg>
  );
}

/**
 * Section mark: the logo's hand-and-flame with a hairline that fades out,
 * like the gold lettering and rules on the dining room wall.
 */
export function Ornament({ className = "", align = "left" }: { className?: string; align?: "left" | "center" }) {
  const rule = "h-px w-14 from-gold/80 to-transparent md:w-20";
  return (
    <span className={`flex items-center gap-4 text-gold ${align === "center" ? "justify-center" : ""} ${className}`} aria-hidden>
      {align === "center" && <span className={`bg-gradient-to-l ${rule}`} />}
      <Emblem className="h-6 w-auto" />
      <span className={`bg-gradient-to-r ${rule}`} />
    </span>
  );
}
