import { percentLabel } from "@/lib/promotions";
import type { AppliedPromotion } from "@/lib/types";
import { IconGift, IconTag } from "../Icons";

/** Short chip in a booking row: "−20%". */
export function PromoChip({ p }: { p: AppliedPromotion }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ok/15 px-2.5 py-0.5 text-xs font-semibold text-ok" title={p.name}>
      <IconTag className="h-3.5 w-3.5" /> {percentLabel(p.percent)}
    </span>
  );
}

/** The discount the guest was promised when booking: name and conditions, for the staff. */
export function PromoLine({ p }: { p: AppliedPromotion }) {
  return (
    <p className="mt-2 flex items-start gap-2 rounded-lg bg-ok/10 px-3 py-2 text-[0.95rem] text-cream/90">
      <IconTag className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
      <span className="min-w-0 break-words">
        <b className="text-ok">Sconto {percentLabel(p.percent)}</b> · {p.name}
        {p.conditions && <span className="text-cream/65"> · {p.conditions}</span>}
      </span>
    </p>
  );
}

/** Short chip in a booking row: booked with the birthday link. */
export function BirthdayChip() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold-light">
      <IconGift className="h-3.5 w-3.5" /> Compleanno
    </span>
  );
}

/** Booked with the birthday link: the offer promised, and what to check first. */
export function BirthdayLine({ offer }: { offer: string }) {
  return (
    <p className="mt-2 flex items-start gap-2 rounded-lg bg-gold/10 px-3 py-2 text-[0.95rem] text-cream/90">
      <IconGift className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" />
      <span className="min-w-0 break-words">
        <b className="text-gold-light">Compleanno</b> · {offer}
        <span className="text-cream/65"> · prima verificare un documento con la data di nascita</span>
      </span>
    </p>
  );
}
