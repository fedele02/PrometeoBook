/** Builds and downloads an .ics file so guests can save the booking in their calendar. */
export function downloadIcs(opts: { date: string; time: string; people: number; title: string; location: string; durationMin?: number }) {
  const [y, m, d] = opts.date.split("-");
  const [hh, mm] = opts.time.split(":").map(Number);
  const end = hh * 60 + mm + (opts.durationMin ?? 120);
  const t = (min: number) => `${String(Math.floor(min / 60) % 24).padStart(2, "0")}${String(min % 60).padStart(2, "0")}00`;
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Prometeo Fine Dining//Prenotazioni//IT",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@prometeo`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Europe/Rome:${y}${m}${d}T${t(hh * 60 + mm)}`,
    `DTEND;TZID=Europe/Rome:${y}${m}${d}T${t(Math.min(end, 23 * 60 + 59))}`,
    `SUMMARY:${opts.title}`,
    `DESCRIPTION:Tavolo per ${opts.people}`,
    `LOCATION:${opts.location.replace(/,/g, "\\,")}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT3H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${opts.title}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: "prenotazione-prometeo.ics" });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
