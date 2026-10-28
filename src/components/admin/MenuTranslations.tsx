"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { applyTranslationsAction } from "@/app/gestore-prometeo-2026/actions";
import { MENU_PATH } from "@/lib/i18n";
import { buildExport, exportFileName, LANGS, LIMITS, readImport, rowTooLong, trStatus, type ImportRow, type TrStatus } from "@/lib/menu-i18n";
import { romeNow } from "@/lib/time";
import type { Category, Dish, DishText, MenuLang } from "@/lib/types";
import { IconArrow, IconCheck, IconDownload, IconEdit, IconEye, IconRefresh } from "../Icons";
import { Card, Modal, smallInput, useToast } from "./ui";

const LANG: MenuLang = "en";
/** The only thing the staff writes to the AI: everything else is inside the file. */
const PROMPT = "Segui le istruzioni contenute nel file e restituiscimi il file tradotto.";

export function MenuTranslations({
  categories,
  dishes,
  onEditDish,
  onEditCategory,
}: {
  categories: Category[];
  dishes: Dish[];
  onEditDish: (d: Dish) => void;
  onEditCategory: (c: Category) => void;
}) {
  const items = [...categories, ...dishes];
  const missing = items.filter((x) => trStatus(x, LANG) === "missing").length;
  const outdated = items.filter((x) => trStatus(x, LANG) === "outdated").length;
  const done = items.length - missing - outdated;
  const [open, setOpen] = useState<"export" | "import" | "review" | null>(null);

  return (
    <Card className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
        <div className="min-w-0 flex-1 basis-64">
          <h2 className="font-display text-lg tracking-[0.06em]">Traduzione {LANGS[LANG].label}</h2>
          <p className="mt-1 text-sm text-cream/60">
            {done} di {items.length} testi tradotti
            {missing > 0 && <span className="text-ember"> · {missing} da tradurre</span>}
            {outdated > 0 && <span className="text-gold-light"> · {outdated} da rivedere</span>}
          </p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <div className="h-full bg-gold" style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} />
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
          <button onClick={() => setOpen("review")} className="btn btn-line col-span-2 min-h-11 px-3 text-xs sm:px-4">
            <IconEye className="h-4 w-4" /> Controlla
          </button>
          <button onClick={() => setOpen("export")} className="btn btn-line min-h-11 px-3 text-xs sm:px-4">
            <IconDownload className="h-4 w-4" /> Esporta
          </button>
          <button onClick={() => setOpen("import")} className="btn btn-gold min-h-11 px-3 text-xs sm:px-4">
            <IconRefresh className="h-4 w-4" /> Importa
          </button>
        </div>
      </div>
      <a
        href={MENU_PATH[LANG].site}
        target="_blank"
        rel="noopener"
        className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-cream/70 underline-offset-4 hover:text-cream hover:underline"
      >
        Apri il menu in {LANGS[LANG].label} sul sito <IconArrow className="h-4 w-4" />
      </a>

      <ExportModal open={open === "export"} onClose={() => setOpen(null)} categories={categories} dishes={dishes} pending={missing + outdated} />
      {open === "import" && <ImportModal onClose={() => setOpen(null)} categories={categories} dishes={dishes} />}
      {open === "review" && (
        <ReviewModal
          categories={categories}
          dishes={dishes}
          onClose={() => setOpen(null)}
          onEditDish={(d) => {
            setOpen(null);
            onEditDish(d);
          }}
          onEditCategory={(c) => {
            setOpen(null);
            onEditCategory(c);
          }}
        />
      )}
    </Card>
  );
}

/* ---------- review ------------------------------------------------------ */

const STATUS_LABEL: Record<TrStatus, string> = { ok: "Tradotto", missing: "Da tradurre", outdated: "Da rivedere" };
type ReviewFilter = "all" | Exclude<TrStatus, "ok">;

/** The whole menu, Italian next to the English, with a shortcut to the editor of each item. */
function ReviewModal({
  categories,
  dishes,
  onClose,
  onEditDish,
  onEditCategory,
}: {
  categories: Category[];
  dishes: Dish[];
  onClose: () => void;
  onEditDish: (d: Dish) => void;
  onEditCategory: (c: Category) => void;
}) {
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const show = (x: Category | Dish) => filter === "all" || trStatus(x, LANG) === filter;
  const count = (f: ReviewFilter) => [...categories, ...dishes].filter((x) => f === "all" || trStatus(x, LANG) === f).length;
  const groups = categories
    .map((c) => ({ c, list: dishes.filter((d) => d.category_id === c.id && show(d)) }))
    .filter((g) => show(g.c) || g.list.length);

  return (
    <Modal open onClose={onClose} title="Controlla la traduzione">
      <div className="grid gap-6">
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5" role="group" aria-label="Mostra">
          {(["all", "missing", "outdated"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                filter === f ? "border-gold bg-gold/20 text-gold-light" : "border-white/10 text-cream/60"
              }`}
            >
              {f === "all" ? "Tutto" : STATUS_LABEL[f]} <span className="font-normal opacity-60">{count(f)}</span>
            </button>
          ))}
        </div>

        {groups.length === 0 && <p className="py-8 text-center text-sm text-cream/55">Niente in questa lista.</p>}

        {groups.map(({ c, list }) => (
          <section key={c.id} className="grid gap-2">
            <ReviewItem
              heading
              it={{ name: c.name, description: c.description }}
              en={c.tr[LANG]}
              status={trStatus(c, LANG)}
              onEdit={() => onEditCategory(c)}
              dim={!show(c)}
            />
            {list.map((d) => (
              <ReviewItem
                key={d.id}
                it={{ name: d.name, description: d.description, price_note: d.price_note }}
                en={d.tr[LANG]}
                status={trStatus(d, LANG)}
                onEdit={() => onEditDish(d)}
                hidden={!d.visible}
              />
            ))}
          </section>
        ))}
      </div>
    </Modal>
  );
}

function ReviewItem({
  it,
  en,
  status,
  onEdit,
  heading,
  dim,
  hidden,
}: {
  it: Partial<DishText>;
  en?: Partial<DishText>;
  status: TrStatus;
  onEdit: () => void;
  heading?: boolean;
  dim?: boolean;
  hidden?: boolean;
}) {
  const fields = (["name", "description", "price_note"] as const).filter((k) => it[k] || en?.[k]);
  return (
    <article
      className={`rounded-md p-4 ${heading ? "border-b border-gold/25" : "border border-white/[0.07] bg-white/[0.02]"} ${dim ? "opacity-55" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
            status === "ok" ? "text-cream/40" : status === "missing" ? "text-ember" : "text-gold-light"
          }`}
        >
          {heading ? "Categoria · " : ""}
          {STATUS_LABEL[status]}
          {hidden ? " · nascosto sul sito" : ""}
        </span>
        <button onClick={onEdit} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 text-xs font-semibold text-cream/65 hover:text-cream">
          <IconEdit className="h-4 w-4" /> Modifica
        </button>
      </div>
      <div className="mt-2 grid gap-3 sm:grid-cols-2 sm:gap-5">
        <div lang="it">
          {fields.map((k) => (
            <p key={k} className={k === "name" ? `text-cream/60 ${heading ? "font-display tracking-[0.06em]" : "font-semibold"}` : "mt-1 text-sm text-cream/45"}>
              {it[k] || "—"}
            </p>
          ))}
        </div>
        <div lang="en" className="border-l-2 border-gold/40 pl-3 sm:border-l sm:pl-5">
          {en?.name ? (
            fields.map((k) => (
              <p key={k} className={k === "name" ? `text-cream ${heading ? "font-display tracking-[0.06em]" : "font-semibold"}` : "mt-1 text-sm text-cream/75"}>
                {en[k] || <span className="text-ember/80">manca</span>}
              </p>
            ))
          ) : (
            <p className="text-sm italic text-cream/40">Non ancora tradotto: sul sito si vede l&apos;italiano.</p>
          )}
        </div>
      </div>
    </article>
  );
}

/* ---------- export ------------------------------------------------------ */

function ExportModal({
  open,
  onClose,
  categories,
  dishes,
  pending,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  dishes: Dish[];
  pending: number;
}) {
  const toast = useToast();
  const all = categories.length + dishes.length;
  const [choice, setOnlyPending] = useState(true);
  const onlyPending = choice && pending > 0 && pending < all;

  const download = () => {
    const date = romeNow().date;
    const file = buildExport(categories, dishes, LANG, date, onlyPending);
    const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: exportFileName(LANG, date) });
    a.click();
    URL.revokeObjectURL(url);
    toast("File scaricato");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT);
      toast("Frase copiata");
    } catch {
      toast("Copia non riuscita: selezionala a mano", "error");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Esporta per la traduzione"
      footer={
        <button onClick={download} className="btn btn-gold w-full">
          <IconDownload className="h-4 w-4" /> Scarica il file
        </button>
      }
    >
      <div className="grid gap-6">
        {pending > 0 && pending < all ? (
          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-semibold text-cream/85">Cosa tradurre</legend>
            <Option checked={onlyPending} onChange={() => setOnlyPending(true)} title="Solo i testi nuovi o modificati" sub={`${pending} testi`} />
            <Option checked={!onlyPending} onChange={() => setOnlyPending(false)} title="Tutto il menu" sub={`${all} testi, anche quelli già tradotti: l'AI li ricontrolla`} />
          </fieldset>
        ) : (
          <p className="text-sm text-cream/65">
            {pending === 0 ? `È tutto tradotto. Il file contiene tutto il menu (${all} testi) da far ricontrollare all'AI.` : `Il file contiene tutto il menu: ${all} testi da tradurre.`}
          </p>
        )}

        <ol className="grid gap-4 text-sm">
          <Step n={1}>Scarica il file. Dentro ci sono già le istruzioni per l&apos;AI: cosa tradurre, come, e cosa non toccare.</Step>
          <Step n={2}>
            Aprilo con Claude o ChatGPT (allega il file) e scrivi solo:
            <span className="mt-2 flex items-stretch gap-2">
              <q className="flex-1 rounded-md bg-white/[0.05] px-3 py-2.5 text-cream/90 [quotes:none]">{PROMPT}</q>
              <button type="button" onClick={copy} className="btn btn-line min-h-0 shrink-0 px-3 text-xs">
                Copia
              </button>
            </span>
          </Step>
          <Step n={3}>Scarica il file che ti restituisce e caricalo con Importa. Prima di salvare vedi ogni traduzione e confermi quelle con un dubbio.</Step>
        </ol>
      </div>
    </Modal>
  );
}

function Option({ checked, onChange, title, sub }: { checked: boolean; onChange: () => void; title: string; sub: string }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-md border p-3.5 transition ${
        checked ? "border-gold/60 bg-gold/10" : "border-white/10"
      }`}
    >
      <input type="radio" checked={checked} onChange={onChange} className="mt-1 accent-[var(--color-gold)]" />
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm text-cream/55">{sub}</span>
      </span>
    </label>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-gold/50 font-display text-sm text-gold">{n}</span>
      <span className="min-w-0 flex-1 pt-0.5 text-cream/75">{children}</span>
    </li>
  );
}

/* ---------- import ------------------------------------------------------ */

type Row = ImportRow & { checked: boolean; editing: boolean };

function ImportModal({ onClose, categories, dishes }: { onClose: () => void; categories: Category[]; dishes: Dish[] }) {
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [paste, setPaste] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [skipped, setSkipped] = useState<{ where: string; why: string }[]>([]);
  const [busy, start] = useTransition();

  const read = (raw: string) => {
    const res = readImport(raw, categories, dishes);
    if (!res.ok) return setError(res.error);
    setError("");
    // rows with a doubt wait for the staff; the others are ready
    setRows(res.rows.map((r) => ({ ...r, checked: r.warnings.length === 0, editing: false })));
    setSkipped(res.skipped);
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    if (f.size > 2_000_000) return setError("Il file è troppo grande per essere il file del menu.");
    read(await f.text());
  };

  const update = (i: number, patch: Partial<Row>) => setRows((rs) => rs!.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const setField = (i: number, k: keyof DishText, v: string) => setRows((rs) => rs!.map((r, j) => (j === i ? { ...r, text: { ...r.text, [k]: v } } : r)));

  const chosen = rows?.filter((r) => r.checked && !rowTooLong(r)) ?? [];
  const waiting = rows?.filter((r) => r.warnings.length && !r.checked).length ?? 0;

  const save = () =>
    start(async () => {
      const res = await applyTranslationsAction(
        LANG,
        chosen.map((r) => (r.kind === "category" ? { kind: r.kind, id: r.id, name: r.text.name, description: r.text.description, src: r.src } : { kind: r.kind, id: r.id, ...r.text, src: r.src })),
      );
      if (!res.ok) return toast(res.error, "error");
      toast(`${chosen.length} traduzioni salvate`);
      router.refresh();
      onClose();
    });

  const order = rows ? rows.map((r, i) => ({ r, i })).sort((a, b) => Number(!a.r.warnings.length) - Number(!b.r.warnings.length)) : [];
  const toConfirm = order.filter(({ r }) => r.warnings.length);
  const ready = order.filter(({ r }) => !r.warnings.length);

  return (
    <Modal
      open
      onClose={onClose}
      title="Importa traduzione"
      footer={
        rows && (
          <div className="grid gap-2">
            {waiting > 0 && (
              <p className="text-center text-sm text-gold-light">
                {waiting === 1 ? "1 traduzione da confermare non verrà salvata" : `${waiting} traduzioni da confermare non verranno salvate`}
              </p>
            )}
            <button onClick={save} disabled={busy || chosen.length === 0} className="btn btn-gold w-full disabled:opacity-50">
              {busy ? "Salvataggio…" : chosen.length === 1 ? "Salva 1 traduzione" : `Salva ${chosen.length} traduzioni`}
            </button>
          </div>
        )
      }
    >
      {!rows ? (
        <div className="grid gap-4">
          <p className="text-sm text-cream/65">Carica il file che ti ha restituito Claude o ChatGPT. Niente viene salvato finché non confermi.</p>
          <input ref={fileRef} type="file" accept=".json,application/json,.txt,text/plain" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <button onClick={() => fileRef.current?.click()} className="btn btn-gold w-full">
            Scegli il file
          </button>
          {!paste ? (
            <button onClick={() => setPaste(true)} className="text-sm text-cream/60 underline underline-offset-4">
              L&apos;AI ti ha risposto con un testo invece che con un file?
            </button>
          ) : (
            <div className="grid gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                placeholder="Incolla qui tutta la risposta dell'AI"
                className={`${smallInput} py-3 font-mono !text-sm`}
              />
              <button onClick={() => read(text)} disabled={!text.trim()} className="btn btn-line w-full disabled:opacity-50">
                Controlla il testo
              </button>
            </div>
          )}
          {error && <p className="rounded-md bg-ember/15 px-4 py-3 text-sm">{error}</p>}
        </div>
      ) : (
        <div className="grid gap-6">
          <p className="text-sm text-cream/65">
            {rows.length === 0 ? "Nel file non c'è nessuna traduzione nuova da salvare." : (
              <>
                <strong className="text-cream">{ready.length}</strong> pronte
                {toConfirm.length > 0 && (
                  <>
                    {" · "}
                    <strong className="text-gold-light">{toConfirm.length}</strong> da confermare
                  </>
                )}
                {skipped.length > 0 && ` · ${skipped.length} ignorate`}. Controlla e salva.
              </>
            )}
          </p>

          {toConfirm.length > 0 && (
            <Section title="Da confermare" sub="L'AI ha avuto un dubbio o il controllo ha trovato qualcosa. Correggi se serve e conferma.">
              {toConfirm.map(({ r, i }) => (
                <RowCard key={r.id} row={r} open onCheck={(v) => update(i, { checked: v })} onField={(k, v) => setField(i, k, v)} confirmLabel="Confermo questa traduzione" />
              ))}
            </Section>
          )}
          {ready.length > 0 && (
            <Section title="Pronte" sub="Nessun dubbio. Togli la spunta per non salvarne una, tocca Modifica per correggerla.">
              {ready.map(({ r, i }) => (
                <RowCard
                  key={r.id}
                  row={r}
                  open={r.editing}
                  onEdit={() => update(i, { editing: !r.editing })}
                  onCheck={(v) => update(i, { checked: v })}
                  onField={(k, v) => setField(i, k, v)}
                  confirmLabel="Salva"
                />
              ))}
            </Section>
          )}
          {skipped.length > 0 && (
            <Section title="Ignorate" sub="Non vengono toccate.">
              <ul className="grid gap-1 text-sm text-cream/55">
                {skipped.map((s, k) => (
                  <li key={k}>
                    {s.where} <span className="text-cream/35">· {s.why}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          <button onClick={() => setRows(null)} className="justify-self-start text-sm text-cream/55 underline underline-offset-4">
            Carica un altro file
          </button>
        </div>
      )}
    </Modal>
  );
}

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{title}</h3>
      <p className="mb-3 mt-1 text-sm text-cream/50">{sub}</p>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

const FIELD_LABEL: Record<keyof DishText, string> = { name: "Nome", description: "Descrizione", price_note: "Nota prezzo" };

function RowCard({
  row,
  open,
  onEdit,
  onCheck,
  onField,
  confirmLabel,
}: {
  row: Row;
  open: boolean;
  onEdit?: () => void;
  onCheck: (v: boolean) => void;
  onField: (k: keyof DishText, v: string) => void;
  confirmLabel: string;
}) {
  const limits: Partial<Record<keyof DishText, number>> = row.kind === "category" ? LIMITS.category : LIMITS.dish;
  const fields = (Object.keys(limits) as (keyof DishText)[]).filter((k) => row.it[k] || row.text[k]);
  const long = rowTooLong(row);
  const doubt = row.warnings.length > 0;

  return (
    <article className={`rounded-md border p-4 ${doubt ? "border-gold/35 bg-gold/[0.04]" : "border-white/[0.07] bg-white/[0.02]"}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 text-xs font-semibold uppercase tracking-[0.12em] text-cream/45">
          {row.kind === "category" ? "Categoria · " : ""}
          {row.where}
        </p>
        {onEdit && (
          <button onClick={onEdit} className="shrink-0 text-xs font-semibold text-cream/60 underline underline-offset-4">
            {open ? "Chiudi" : "Modifica"}
          </button>
        )}
      </div>

      {doubt && (
        <ul className="mt-3 grid gap-1.5 text-sm">
          {row.warnings.map((w) => (
            <li key={w} className="border-l-2 border-gold pl-3 text-gold-light">
              {w}
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-3 grid gap-3">
        {fields.map((k) => (
          <div key={k} className="grid gap-1.5 sm:grid-cols-2 sm:gap-4">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cream/35">{FIELD_LABEL[k]} · IT</dt>
              <dd className="mt-0.5 text-sm text-cream/60">{row.it[k] || "—"}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold/80">{FIELD_LABEL[k]} · EN</dt>
              <dd className="mt-0.5">
                {open ? (
                  <>
                    {k === "description" ? (
                      <textarea
                        value={row.text[k]}
                        onChange={(e) => onField(k, e.target.value)}
                        rows={3}
                        className={`${smallInput} !min-h-10 py-2 !text-sm ${row.text[k].length > (limits[k] ?? 0) ? "!border-ember" : ""}`}
                      />
                    ) : (
                      <input
                        value={row.text[k]}
                        onChange={(e) => onField(k, e.target.value)}
                        className={`${smallInput} !min-h-10 !text-sm ${row.text[k].length > (limits[k] ?? 0) ? "!border-ember" : ""}`}
                      />
                    )}
                    {row.text[k].length > (limits[k] ?? 0) && (
                      <span className="text-xs text-ember">
                        {row.text[k].length}/{limits[k]} caratteri
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-cream">{row.text[k] || "—"}</span>
                )}
              </dd>
            </div>
          </div>
        ))}
      </dl>

      <label className={`mt-4 flex items-center gap-3 text-sm font-semibold ${long ? "opacity-50" : "cursor-pointer"}`}>
        <span
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-[3px] border transition ${
            row.checked && !long ? "border-gold bg-gold text-ink" : "border-white/30"
          }`}
        >
          {row.checked && !long && <IconCheck className="h-4 w-4" strokeWidth={2.4} />}
        </span>
        <input type="checkbox" className="sr-only" checked={row.checked && !long} disabled={long} onChange={(e) => onCheck(e.target.checked)} />
        {long ? "Accorcia il testo per poterla salvare" : confirmLabel}
      </label>
    </article>
  );
}
