"use client";

import Link from "next/link";
import { LANG_COOKIE, MENU_TEXT, type Lang } from "@/lib/i18n";

const LABEL: Record<Lang, { short: string; long: string }> = {
  it: { short: "IT", long: "Italiano" },
  en: { short: "EN", long: "English" },
};

function remember(l: Lang) {
  document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
}

/** "IT · EN": remembers the choice, so the QR page stops guessing from the phone's language. */
export function LangSwitch({ lang, hrefs, className = "" }: { lang: Lang; hrefs: Record<Lang, string>; className?: string }) {
  return (
    <nav aria-label={MENU_TEXT[lang].language} className={`flex items-center justify-center gap-1 ${className}`}>
      {(Object.keys(LABEL) as Lang[]).map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          {i > 0 && <span className="text-cream/30" aria-hidden="true">·</span>}
          <Link
            href={hrefs[l]}
            hrefLang={l}
            lang={l}
            onClick={() => remember(l)}
            aria-current={l === lang ? "true" : undefined}
            aria-label={LABEL[l].long}
            className={`label relative px-2.5 py-3 text-[0.72rem] transition-colors ${l === lang ? "text-gold" : "text-cream/55 hover:text-cream"}`}
          >
            {LABEL[l].short}
            <span className={`absolute inset-x-2.5 bottom-2 h-px bg-gold transition-opacity ${l === lang ? "opacity-100" : "opacity-0"}`} />
          </Link>
        </span>
      ))}
    </nav>
  );
}
