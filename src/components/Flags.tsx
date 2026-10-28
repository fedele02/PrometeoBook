import type { PhoneCountry } from "@/lib/phone";

/*
 * Flags for the phone field, drawn for 20 px: coats of arms and stars are left out
 * at that size. SVG and not emoji, because Windows shows emoji flags as two letters.
 */

const v = (a: string, b: string, c: string) => (
  <>
    <rect width="10" height="20" fill={a} />
    <rect x="10" width="10" height="20" fill={b} />
    <rect x="20" width="10" height="20" fill={c} />
  </>
);
const h = (a: string, b: string, c: string) => (
  <>
    <rect width="30" height="7" fill={a} />
    <rect y="6.67" width="30" height="6.67" fill={b} />
    <rect y="13.33" width="30" height="6.67" fill={c} />
  </>
);
const nordic = (bg: string, cross: string, inner?: string) => (
  <>
    <rect width="30" height="20" fill={bg} />
    <rect x="8" width="5" height="20" fill={cross} />
    <rect y="7.5" width="30" height="5" fill={cross} />
    {inner && (
      <>
        <rect x="9.25" width="2.5" height="20" fill={inner} />
        <rect y="8.75" width="30" height="2.5" fill={inner} />
      </>
    )}
  </>
);

const FLAGS: Record<Exclude<PhoneCountry, "OTHER">, React.ReactNode> = {
  IT: v("#009246", "#fff", "#ce2b37"),
  FR: v("#002654", "#fff", "#ce1126"),
  BE: v("#000", "#fdda24", "#ef3340"),
  IE: v("#169b62", "#fff", "#ff883e"),
  RO: v("#002b7f", "#fcd116", "#ce1126"),
  DE: h("#000", "#dd0000", "#ffce00"),
  AT: h("#c8102e", "#fff", "#c8102e"),
  NL: h("#ae1c28", "#fff", "#21468b"),
  HU: h("#ce2939", "#fff", "#477050"),
  ES: (
    <>
      <rect width="30" height="20" fill="#aa151b" />
      <rect y="5" width="30" height="10" fill="#f1bf00" />
    </>
  ),
  PL: (
    <>
      <rect width="30" height="10" fill="#fff" />
      <rect y="10" width="30" height="10" fill="#dc143c" />
    </>
  ),
  CZ: (
    <>
      <rect width="30" height="10" fill="#fff" />
      <rect y="10" width="30" height="10" fill="#d7141a" />
      <path d="M0 0 15 10 0 20Z" fill="#11457e" />
    </>
  ),
  PT: (
    <>
      <rect width="30" height="20" fill="#da291c" />
      <rect width="12" height="20" fill="#046a38" />
      <circle cx="12" cy="10" r="3.5" fill="#ffe900" />
    </>
  ),
  CH: (
    <>
      <rect width="30" height="20" fill="#da291c" />
      <rect x="13" y="4" width="4" height="12" fill="#fff" />
      <rect x="9" y="8" width="12" height="4" fill="#fff" />
    </>
  ),
  SE: nordic("#006aa7", "#fecc00"),
  DK: nordic("#c8102e", "#fff"),
  NO: nordic("#ba0c2f", "#fff", "#00205b"),
  GR: (
    <>
      <rect width="30" height="20" fill="#0d5eaf" />
      {[1, 3, 5, 7].map((i) => (
        <rect key={i} y={(i * 20) / 9} width="30" height={20 / 9} fill="#fff" />
      ))}
      <rect width="11.1" height="11.1" fill="#0d5eaf" />
      <rect x="4.44" width="2.22" height="11.1" fill="#fff" />
      <rect y="4.44" width="11.1" height="2.22" fill="#fff" />
    </>
  ),
  GB: (
    <>
      <rect width="30" height="20" fill="#012169" />
      <path d="M0 0 30 20M30 0 0 20" stroke="#fff" strokeWidth="4" />
      <path d="M0 0 30 20M30 0 0 20" stroke="#c8102e" strokeWidth="1.5" />
      <path d="M15 0v20M0 10h30" stroke="#fff" strokeWidth="6" />
      <path d="M15 0v20M0 10h30" stroke="#c8102e" strokeWidth="3.5" />
    </>
  ),
  US: (
    <>
      <rect width="30" height="20" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((i) => (
        <rect key={i} y={(i * 20) / 13} width="30" height={20 / 13} fill="#b22234" />
      ))}
      <rect width="13" height={(7 * 20) / 13} fill="#3c3b6e" />
    </>
  ),
  BR: (
    <>
      <rect width="30" height="20" fill="#009c3b" />
      <path d="M15 2.5 27 10 15 17.5 3 10Z" fill="#ffdf00" />
      <circle cx="15" cy="10" r="4.2" fill="#002776" />
    </>
  ),
  JP: (
    <>
      <rect width="30" height="20" fill="#fff" />
      <circle cx="15" cy="10" r="6" fill="#bc002d" />
    </>
  ),
};

/** 3:2 flag with a hairline edge, so white flags stay visible on white. */
export function Flag({ country, className = "h-[14px] w-[21px]" }: { country: PhoneCountry; className?: string }) {
  if (country === "OTHER")
    return (
      <svg viewBox="0 0 30 20" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="15" cy="10" r="8.3" />
        <path d="M6.7 10h16.6M15 1.7c-2.6 2.4-3.9 5.2-3.9 8.3s1.3 5.9 3.9 8.3c2.6-2.4 3.9-5.2 3.9-8.3S17.6 4.1 15 1.7Z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 30 20" className={`${className} shrink-0 overflow-hidden rounded-[2px]`} aria-hidden="true">
      {FLAGS[country]}
      <rect x="0.25" y="0.25" width="29.5" height="19.5" fill="none" stroke="rgb(0 0 0 / 0.18)" strokeWidth="0.5" rx="1" />
    </svg>
  );
}
