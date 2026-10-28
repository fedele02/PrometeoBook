"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteCategoryAction,
  deleteDishAction,
  reorderCategoriesAction,
  reorderDishesAction,
  saveCategoryAction,
  saveDishAction,
  type ActionResult,
} from "@/app/gestore-prometeo-2026/actions";
import { ALLERGENS, DISH_TAGS } from "@/lib/catalog";
import { euro } from "@/lib/site";
import { categoryText, dishText, fingerprint, trStatus, type TrStatus } from "@/lib/menu-i18n";
import type { Category, Dish } from "@/lib/types";
import { IconChevron, IconEdit, IconEye, IconImage, IconPlus, IconTrash } from "../Icons";
import { ImagePicker } from "./ImagePicker";
import { Card, FieldLabel, Modal, PageTitle, Toggle, iconBtn, smallInput, useToast } from "./ui";

type DishDraft = Omit<Dish, "id"> & { id?: string };
type CatDraft = Omit<Category, "id"> & { id?: string };

const move = <T,>(list: T[], i: number, d: -1 | 1) => {
  const out = [...list];
  [out[i], out[i + d]] = [out[i + d], out[i]];
  return out;
};

export function MenuEditor({ categories, dishes, children }: { categories: Category[]; dishes: Dish[]; children?: React.ReactNode }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, start] = useTransition();
  const [dish, setDish] = useState<DishDraft | null>(null);
  const [cat, setCat] = useState<CatDraft | null>(null);
  const [openCats, setOpenCats] = useState<Set<string>>(() => new Set(categories.slice(0, 1).map((c) => c.id)));

  const run = (fn: () => Promise<ActionResult>, msg: string, after?: () => void) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast(msg);
        after?.();
        router.refresh();
      } else toast(res.error, "error");
    });

  const toggleOpen = (id: string) =>
    setOpenCats((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const newDish = (category_id: string): DishDraft => ({
    category_id,
    name: "",
    description: "",
    price: null,
    price_note: "",
    image_url: "",
    tags: [],
    allergens: [],
    visible: true,
    available: true,
    position: dishes.filter((d) => d.category_id === category_id).length,
    tr: {},
  });

  return (
    <>
      <PageTitle title="Menu" subtitle="Le modifiche sono subito visibili sul sito.">
        <button
          onClick={() => setCat({ name: "", description: "", position: categories.length, visible: true, tr: {} })}
          className="btn btn-line min-h-10 px-4 text-sm"
        >
          <IconPlus className="h-4 w-4" /> Categoria
        </button>
      </PageTitle>
      {children}

      <div className="space-y-4">
        {categories.map((c, ci) => {
          const list = dishes.filter((d) => d.category_id === c.id);
          const open = openCats.has(c.id);
          return (
            <Card key={c.id} className="!p-0">
              <div className="flex items-center gap-2 p-4 md:p-5">
                <button onClick={() => toggleOpen(c.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={open}>
                  <IconChevron dir={open ? "down" : "right"} className="h-5 w-5 shrink-0 text-gold transition" />
                  <span className="min-w-0">
                    <span className={`block truncate font-display text-lg tracking-[0.06em] ${c.visible ? "" : "text-cream/40 line-through"}`}>{c.name}</span>
                    <span className="text-sm text-cream/50">
                      {list.length} piatti{c.visible ? "" : " · nascosta"}
                      <TrBadge status={trStatus(c, "en")} />
                    </span>
                  </span>
                </button>
                <button
                  disabled={busy || ci === 0}
                  onClick={() => run(() => reorderCategoriesAction(move(categories, ci, -1).map((x) => x.id)), "Ordine aggiornato")}
                  className={iconBtn}
                  aria-label="Sposta su"
                >
                  <IconChevron dir="up" className="h-4 w-4" />
                </button>
                <button
                  disabled={busy || ci === categories.length - 1}
                  onClick={() => run(() => reorderCategoriesAction(move(categories, ci, 1).map((x) => x.id)), "Ordine aggiornato")}
                  className={iconBtn}
                  aria-label="Sposta giù"
                >
                  <IconChevron dir="down" className="h-4 w-4" />
                </button>
                <button onClick={() => setCat(c)} className={iconBtn} aria-label="Modifica categoria">
                  <IconEdit className="h-4 w-4" />
                </button>
              </div>

              {open && (
                <div className="border-t border-white/5 p-3 md:p-4">
                  <ul className="space-y-2">
                    {list.map((d, di) => (
                      <li key={d.id} className="flex items-center gap-3 rounded-md bg-white/[0.03] p-2 pr-3">
                        <button onClick={() => setDish(d)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                          <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-ink text-cream/30">
                            {d.image_url ? <Image src={d.image_url} alt="" fill sizes="56px" className="object-cover" /> : <IconImage className="h-6 w-6" />}
                          </span>
                          <span className="min-w-0">
                            <span className={`block truncate font-semibold ${d.visible ? "" : "text-cream/40 line-through"}`}>{d.name}</span>
                            <span className="text-sm text-cream/50">
                              {d.price !== null ? `€ ${euro(d.price)}` : "senza prezzo"}
                              {!d.available && <span className="text-ember"> · esaurito</span>}
                              <TrBadge status={trStatus(d, "en")} />
                            </span>
                          </span>
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => run(() => saveDishAction({ ...d, visible: !d.visible }), d.visible ? "Piatto nascosto" : "Piatto visibile")}
                          className={iconBtn}
                          aria-label={d.visible ? "Nascondi" : "Mostra"}
                          title={d.visible ? "Visibile sul sito" : "Nascosto"}
                        >
                          <IconEye off={!d.visible} className="h-4 w-4" />
                        </button>
                        <div className="flex flex-col gap-1 sm:flex-row">
                          <button
                            disabled={busy || di === 0}
                            onClick={() => run(() => reorderDishesAction(move(list, di, -1).map((x) => x.id)), "Ordine aggiornato")}
                            className={iconBtn}
                            aria-label="Sposta su"
                          >
                            <IconChevron dir="up" className="h-4 w-4" />
                          </button>
                          <button
                            disabled={busy || di === list.length - 1}
                            onClick={() => run(() => reorderDishesAction(move(list, di, 1).map((x) => x.id)), "Ordine aggiornato")}
                            className={iconBtn}
                            aria-label="Sposta giù"
                          >
                            <IconChevron dir="down" className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => setDish(newDish(c.id))} className="btn btn-line mt-3 w-full text-sm">
                    <IconPlus className="h-4 w-4" /> Aggiungi piatto in {c.name}
                  </button>
                </div>
              )}
            </Card>
          );
        })}
        {categories.length === 0 && (
          <Card className="text-center text-cream/60">Nessuna categoria. Crea la prima, ad esempio “Antipasti”.</Card>
        )}
      </div>

      {dish && (
        <DishModal
          key={dish.id ?? "new"}
          draft={dish}
          categories={categories}
          siblings={dishes}
          busy={busy}
          onClose={() => setDish(null)}
          onSave={(d) => run(() => saveDishAction(d), "Piatto salvato", () => setDish(null))}
          onDelete={(id) => run(() => deleteDishAction(id), "Piatto eliminato", () => setDish(null))}
        />
      )}
      {cat && (
        <CategoryModal
          key={cat.id ?? "new"}
          draft={cat}
          count={cat.id ? dishes.filter((d) => d.category_id === cat.id).length : 0}
          busy={busy}
          onClose={() => setCat(null)}
          onSave={(c) => run(() => saveCategoryAction(c), "Categoria salvata", () => setCat(null))}
          onDelete={(id) => run(() => deleteCategoryAction(id), "Categoria eliminata", () => setCat(null))}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */

function DishModal({
  draft,
  categories,
  siblings,
  busy,
  onClose,
  onSave,
  onDelete,
}: {
  draft: DishDraft;
  categories: Category[];
  siblings: Dish[];
  busy: boolean;
  onClose: () => void;
  onSave: (d: DishDraft) => void;
  onDelete: (id: string) => void;
}) {
  const [d, setD] = useState(draft);
  const [price, setPrice] = useState(draft.price === null ? "" : String(draft.price).replace(".", ","));
  const [error, setError] = useState("");
  const [en, setEn] = useState({ name: "", description: "", price_note: "", ...draft.tr.en });
  const [enTouched, setEnTouched] = useState(false);
  const set = <K extends keyof DishDraft>(k: K, v: DishDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const setEnField = (k: "name" | "description" | "price_note", v: string) => {
    setEn((x) => ({ ...x, [k]: v }));
    setEnTouched(true);
  };
  const toggleIn = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const save = () => {
    if (!d.name.trim()) return setError("Scrivi il nome del piatto.");
    const p = price.trim() === "" ? null : Number(price.replace(",", "."));
    if (p !== null && (Number.isNaN(p) || p < 0)) return setError("Prezzo non valido. Esempio: 14 oppure 12,50");
    // moving to another category: append at the end
    const position = d.category_id !== draft.category_id ? siblings.filter((x) => x.category_id === d.category_id).length : d.position;
    onSave({ ...d, price: p, position, tr: withEnglish(d.tr, dishText(d), en, enTouched) });
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={draft.id ? "Modifica piatto" : "Nuovo piatto"}
      footer={
        <div className="flex gap-3">
          {draft.id && (
            <button
              disabled={busy}
              onClick={() => confirm(`Eliminare “${draft.name}”?`) && onDelete(draft.id!)}
              className="btn min-h-12 px-4 text-cream/60 hover:text-ember"
              aria-label="Elimina piatto"
            >
              <IconTrash className="h-5 w-5" />
            </button>
          )}
          <button onClick={save} disabled={busy} className="btn btn-gold flex-1">
            {busy ? "Salvataggio…" : "Salva"}
          </button>
        </div>
      }
    >
      <div className="grid gap-5">
        <ImagePicker value={d.image_url} onChange={(url) => set("image_url", url)} />
        <FieldLabel label="Nome del piatto">
          <input value={d.name} onChange={(e) => set("name", e.target.value)} className={smallInput} placeholder="es. Orecchiette alle cime di rapa" />
        </FieldLabel>
        <FieldLabel label="Descrizione" hint="Ingredienti e cosa lo rende speciale. Breve e invitante.">
          <textarea value={d.description} onChange={(e) => set("description", e.target.value)} rows={3} className={`${smallInput} py-3`} />
        </FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          <FieldLabel label="Prezzo (€)" hint="Vuoto = non mostrato">
            <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="14" className={smallInput} />
          </FieldLabel>
          <FieldLabel label="Nota prezzo" hint="es. a persona">
            <input value={d.price_note} onChange={(e) => set("price_note", e.target.value)} className={smallInput} />
          </FieldLabel>
        </div>
        <EnglishFields status={draft.id ? trStatus({ ...draft, id: draft.id }, "en") : "missing"} touched={enTouched} onConfirm={() => setEnTouched(true)}>
          <FieldLabel label="Nome in inglese">
            <input value={en.name} onChange={(e) => setEnField("name", e.target.value)} className={smallInput} />
          </FieldLabel>
          <FieldLabel label="Descrizione in inglese">
            <textarea value={en.description} onChange={(e) => setEnField("description", e.target.value)} rows={3} className={`${smallInput} py-3`} />
          </FieldLabel>
          <FieldLabel label="Nota prezzo in inglese">
            <input value={en.price_note} onChange={(e) => setEnField("price_note", e.target.value)} className={smallInput} placeholder="es. per person" />
          </FieldLabel>
        </EnglishFields>
        <FieldLabel label="Categoria">
          <select value={d.category_id} onChange={(e) => set("category_id", e.target.value)} className={smallInput}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FieldLabel>

        <div>
          <p className="text-sm font-semibold text-cream/85">Caratteristiche</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DISH_TAGS.map((t) => (
              <button
                type="button"
                key={t.id}
                aria-pressed={d.tags.includes(t.id)}
                onClick={() => set("tags", toggleIn(d.tags, t.id))}
                className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                  d.tags.includes(t.id) ? "border-gold bg-gold/20 text-gold-light" : "border-white/10 text-cream/60"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-cream/45">“Firma dello chef” mette il piatto (se ha la foto) in evidenza nella home.</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-cream/85">Allergeni</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ALLERGENS.map((a) => (
              <button
                type="button"
                key={a.id}
                aria-pressed={d.allergens.includes(a.id)}
                onClick={() => set("allergens", toggleIn(d.allergens, a.id).sort((x, y) => x - y))}
                className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                  d.allergens.includes(a.id) ? "border-ember/60 bg-ember/15 text-cream" : "border-white/10 text-cream/55"
                }`}
              >
                {a.short}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-md bg-white/[0.03] p-4">
          <Toggle checked={d.visible} onChange={(v) => set("visible", v)} label="Visibile sul sito" hint="Spegni per nasconderlo senza eliminarlo" />
          <Toggle checked={d.available} onChange={(v) => set("available", v)} label="Disponibile oggi" hint="Spegni per mostrarlo come “esaurito”" />
        </div>
        {error && <p className="rounded-xl bg-ember/15 px-4 py-3 text-sm">{error}</p>}
      </div>
    </Modal>
  );
}

function CategoryModal({
  draft,
  count,
  busy,
  onClose,
  onSave,
  onDelete,
}: {
  draft: CatDraft;
  count: number;
  busy: boolean;
  onClose: () => void;
  onSave: (c: CatDraft) => void;
  onDelete: (id: string) => void;
}) {
  const [c, setC] = useState(draft);
  const [en, setEn] = useState({ name: "", description: "", ...draft.tr.en });
  const [enTouched, setEnTouched] = useState(false);
  const setEnField = (k: "name" | "description", v: string) => {
    setEn((x) => ({ ...x, [k]: v }));
    setEnTouched(true);
  };
  return (
    <Modal
      open
      onClose={onClose}
      title={draft.id ? "Modifica categoria" : "Nuova categoria"}
      footer={
        <div className="flex gap-3">
          {draft.id && (
            <button
              disabled={busy}
              onClick={() =>
                confirm(count ? `Eliminare “${draft.name}” e i suoi ${count} piatti?` : `Eliminare “${draft.name}”?`) && onDelete(draft.id!)
              }
              className="btn min-h-12 px-4 text-cream/60 hover:text-ember"
              aria-label="Elimina categoria"
            >
              <IconTrash className="h-5 w-5" />
            </button>
          )}
          <button onClick={() => onSave({ ...c, tr: withEnglish(c.tr, categoryText(c), en, enTouched) })} disabled={busy || !c.name.trim()} className="btn btn-gold flex-1 disabled:opacity-50">
            Salva
          </button>
        </div>
      }
    >
      <div className="grid gap-5">
        <FieldLabel label="Nome">
          <input value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} className={smallInput} placeholder="es. Antipasti" autoFocus />
        </FieldLabel>
        <FieldLabel label="Sottotitolo (facoltativo)">
          <input value={c.description} onChange={(e) => setC({ ...c, description: e.target.value })} className={smallInput} />
        </FieldLabel>
        <EnglishFields status={draft.id ? trStatus({ ...draft, id: draft.id }, "en") : "missing"} touched={enTouched} onConfirm={() => setEnTouched(true)}>
          <FieldLabel label="Nome in inglese">
            <input value={en.name} onChange={(e) => setEnField("name", e.target.value)} className={smallInput} placeholder="es. Starters" />
          </FieldLabel>
          <FieldLabel label="Sottotitolo in inglese">
            <input value={en.description} onChange={(e) => setEnField("description", e.target.value)} className={smallInput} />
          </FieldLabel>
        </EnglishFields>
        <Toggle checked={c.visible} onChange={(v) => setC({ ...c, visible: v })} label="Visibile sul sito" />
      </div>
    </Modal>
  );
}

/* ---------- English ---------------------------------------------------- */

/**
 * The English saved with the item. Written or confirmed here: it matches the Italian
 * being saved. Untouched: it keeps the Italian it was made from, so a change to the
 * Italian shows up as "da rivedere".
 */
function withEnglish<R extends Category["tr"] | Dish["tr"]>(tr: R, italian: Parameters<typeof fingerprint>[0], en: { name: string; src?: string }, touched: boolean): R {
  const { src: old, ...text } = en;
  if (!text.name.trim()) {
    const rest = { ...tr };
    delete rest.en;
    return rest;
  }
  const trimmed = Object.fromEntries(Object.entries(text).map(([k, v]) => [k, String(v).trim()]));
  return { ...tr, en: { ...trimmed, src: touched || !old ? fingerprint(italian) : old } } as R;
}

function TrBadge({ status }: { status: TrStatus }) {
  if (status === "ok") return null;
  const label = status === "missing" ? "Inglese da tradurre" : "Inglese da rivedere";
  return (
    <span
      title={label}
      aria-label={label}
      className={`ml-2 inline-block rounded-[3px] border px-1.5 align-[1px] text-[10px] font-semibold leading-4 tracking-[0.08em] ${
        status === "missing" ? "border-white/15 text-cream/45 line-through" : "border-gold/50 text-gold-light"
      }`}
    >
      EN{status === "outdated" ? " ↻" : ""}
    </span>
  );
}

function EnglishFields({ status, touched, onConfirm, children }: { status: TrStatus; touched: boolean; onConfirm: () => void; children: React.ReactNode }) {
  const [open, setOpen] = useState(status === "outdated");
  return (
    <div className="rounded-md border border-white/[0.07]">
      <button type="button" onClick={() => setOpen(!open)} className="flex min-h-12 w-full items-center gap-3 px-4 text-left" aria-expanded={open}>
        <IconChevron dir={open ? "down" : "right"} className="h-4 w-4 shrink-0 text-gold" />
        <span className="flex-1 text-sm font-semibold text-cream/85">Inglese</span>
        <span className={`text-xs ${status === "outdated" && !touched ? "text-gold-light" : "text-cream/45"}`}>
          {touched ? "modificato" : status === "ok" ? "tradotto" : status === "missing" ? "da tradurre" : "da rivedere"}
        </span>
      </button>
      {open && (
        <div className="grid gap-4 border-t border-white/[0.07] p-4">
          {status === "outdated" && !touched && (
            <p className="border-l-2 border-gold pl-3 text-sm text-cream/70">
              L&apos;italiano è cambiato dopo la traduzione. Correggi l&apos;inglese, oppure{" "}
              <button type="button" onClick={onConfirm} className="font-semibold text-gold-light underline underline-offset-4">
                conferma che va bene così
              </button>
              .
            </p>
          )}
          {children}
          <p className="text-xs text-cream/45">Di solito si traduce tutto insieme con Esporta e Importa, in cima alla pagina. Qui correggi un testo alla volta.</p>
        </div>
      )}
    </div>
  );
}
