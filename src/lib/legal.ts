/**
 * Retention periods stated in the privacy notice (/privacy).
 * The automatic deletion (purge_old_data in supabase/schema.sql, run nightly by pg_cron) uses these same numbers: the notice may only
 * promise what the system really does. Proposed values, to be approved by the owner.
 */
export const RETENTION = {
  /** bookings and the guest history built from them (Gestione → Clienti) */
  bookingsMonths: 24,
  /** special requests (they may hold allergies): erased after the visit */
  notesDaysAfterVisit: 30,
  /** log of the automatic WhatsApp messages (status: sent, delivered, read) */
  whatsappMonths: 6,
  /** anti-spam log of the booking form (keyed hash of the IP address) */
  attemptsDays: 1,
} as const;

/** Date shown under the privacy notice: update it whenever the notice changes. */
export const PRIVACY_UPDATED = "15 ottobre 2026";

/** What the public site keeps on the guest's own device (localStorage), listed in the cookie section. */
export const DEVICE_KEYS = ["prometeo:guest", "prometeo:bookings"] as const;
