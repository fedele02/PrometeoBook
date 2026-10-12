import type { BookingStatus } from "@/lib/types";

export const STATUS: Record<BookingStatus, { label: string; cls: string }> = {
  pending: { label: "Da confermare", cls: "bg-ember/20 text-ember" },
  confirmed: { label: "Confermata", cls: "bg-ok/15 text-ok" },
  declined: { label: "Rifiutata", cls: "bg-white/10 text-cream/60" },
  cancelled: { label: "Annullata", cls: "bg-white/10 text-cream/60" },
};
