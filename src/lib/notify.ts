import "server-only";
import type { Booking } from "./types";
import { formatDateLong } from "./time";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/**
 * Optional e-mail to the restaurant for every new online booking.
 * Enabled only when RESEND_API_KEY and BOOKING_NOTIFY_EMAIL are set.
 * Never throws: a failed e-mail must not lose the booking.
 */
export async function notifyNewBooking(b: Booking) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_NOTIFY_EMAIL;
  if (!key || !to) return;

  const when = `${formatDateLong(b.date)} alle ${b.time}`;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.BOOKING_FROM_EMAIL ?? "Prometeo <onboarding@resend.dev>",
        to: to.split(",").map((x) => x.trim()),
        subject: `Nuova prenotazione · ${b.people} pers. · ${when}`,
        html: `<div style="font-family:system-ui,sans-serif;font-size:16px;line-height:1.5">
          <h2 style="margin:0 0 8px">Nuova prenotazione</h2>
          <p style="margin:0"><b>${esc(b.name)}</b> · ${b.people} persone</p>
          <p style="margin:0">${esc(when)}</p>
          <p style="margin:0">Tel. <a href="tel:${esc(b.phone)}">${esc(b.phone)}</a></p>
          ${b.notes ? `<p style="margin:8px 0 0">Note: ${esc(b.notes)}</p>` : ""}
          <p style="margin:12px 0 0;color:#666">Stato: ${b.status === "confirmed" ? "confermata" : "da confermare"}</p>
        </div>`,
      }),
    });
  } catch (e) {
    console.error("booking notification failed", e);
  }
}
