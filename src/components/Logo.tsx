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

/** Small flame, the ornament at the ends of the rules on their printed material. */
export function Flame({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M12 23c-5 0-8-3.4-8-7.6 0-3 1.7-5.2 3.4-6.6-.2 1.9.4 3.3 1.6 4.1-.3-4.3 2.2-8 5.6-11.9.3 3.7 2.6 5.6 4.3 8 .5-1.1.6-2.3.3-3.6 2.6 2.4 4.8 5.6 4.8 9.6C24 19.6 17 23 12 23Zm0-2.2c2.4 0 4.2-1.6 4.2-3.8 0-1.8-1-3.1-2.2-4.2.1.8 0 1.6-.4 2.2-.9-1.4-2.3-2.4-2.6-4.4-1.9 2.2-3.2 4.2-3.2 6.4 0 2.2 1.8 3.8 4.2 3.8Z" />
    </svg>
  );
}

/** Hairline with a flame at each end — the divider used on their menus. */
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-3 text-gold ${className}`} aria-hidden>
      <Flame className="h-3.5 w-3.5 -scale-x-100" />
      <span className="h-px flex-1 bg-current opacity-70" />
      <Flame className="h-3.5 w-3.5" />
    </span>
  );
}
