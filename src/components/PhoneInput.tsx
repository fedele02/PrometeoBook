"use client";

import { useState } from "react";
import { COUNTRIES, DEFAULT_COUNTRY, dialCode, joinPhone, splitPhone, type PhoneCountry } from "@/lib/phone";
import { Flag } from "./Flags";
import { IconChevron } from "./Icons";

/**
 * Phone number with its country code: flag and "+39" on the left (a native select,
 * so phones open their own picker), the number on the right. Value: "+39 333 123 4567".
 * Typing or pasting "+44…" picks the country by itself.
 */
export function PhoneInput({
  value,
  onChange,
  tone = "paper",
  readOnly,
  className = "",
  ...input
}: {
  value: string;
  onChange: (value: string) => void;
  tone?: "paper" | "dark";
  readOnly?: boolean;
  className?: string;
} & Pick<React.InputHTMLAttributes<HTMLInputElement>, "enterKeyHint" | "autoFocus" | "id" | "aria-describedby">) {
  const [state, setState] = useState(() => ({ ...splitPhone(value), sent: value }));
  // the parent changed the number (form reset, saved guest): follow it
  if (value !== state.sent) setState({ ...splitPhone(value), sent: value });
  const { country, national } = state;

  const emit = (c: PhoneCountry, n: string) => {
    const next = joinPhone(c, n);
    setState({ country: c, national: n, sent: next });
    onChange(next);
  };

  const typeNumber = (n: string) => {
    // "+44 7911…" or "0044…" written in full: move the code to the country picker
    if (country !== "OTHER" && /^\s*(\+|00)/.test(n)) {
      const s = splitPhone(n);
      return emit(s.country, s.national);
    }
    emit(country, n);
  };

  const pickCountry = (c: PhoneCountry) => emit(c, c !== "OTHER" && national.trim().startsWith("+") ? "" : national);

  const dark = tone === "dark";
  const code = dialCode(country);

  return (
    <div
      className={`input flex items-stretch !px-0 ${dark ? "focus-within:border-gold" : "input-paper focus-within:border-ink"} ${
        readOnly ? "opacity-70" : ""
      } ${className}`}
    >
      <span
        className={`relative flex shrink-0 items-center gap-1.5 border-r pl-3 pr-2 sm:gap-2 sm:pl-3.5 sm:pr-2.5 ${dark ? "border-white/15" : "border-ink/15"}`}
      >
        <Flag country={country} className={country === "OTHER" ? "h-5 w-5 opacity-60" : undefined} />
        <span className="tabular-nums">{code ? `+${code}` : "+"}</span>
        {!readOnly && <IconChevron dir="down" className="h-4 w-4 opacity-45" />}
        <select
          value={country}
          onChange={(e) => pickCountry(e.target.value as PhoneCountry)}
          disabled={readOnly}
          aria-label="Prefisso del paese"
          className="absolute inset-0 w-full cursor-pointer appearance-none opacity-0 disabled:cursor-default"
        >
          {COUNTRIES.map((c) => (
            <option key={c.iso} value={c.iso}>
              {c.name} (+{c.dial})
            </option>
          ))}
          <option value="OTHER">Altro paese · Other country</option>
        </select>
      </span>
      <input
        {...input}
        value={national}
        onChange={(e) => typeNumber(e.target.value)}
        readOnly={readOnly}
        type="tel"
        inputMode="tel"
        autoComplete={country === "OTHER" ? "tel" : "tel-national"}
        placeholder={country === "OTHER" ? "+ prefisso e numero" : country === DEFAULT_COUNTRY ? "es. 333 123 4567" : "Numero · Number"}
        aria-label="Numero di telefono"
        className="min-w-0 flex-1 bg-transparent px-3 outline-none sm:px-3.5 placeholder:text-current placeholder:opacity-40"
      />
    </div>
  );
}
