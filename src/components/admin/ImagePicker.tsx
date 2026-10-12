"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { uploadImageAction } from "@/app/gestore-prometeo-2026/actions";
import { IconImage, IconTrash } from "../Icons";

const MAX_SIDE = 1600;

/** Resize in the browser: a 12 MP phone photo becomes ~250 KB before upload. */
async function shrink(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * k);
  canvas.height = Math.round(bmp.height * k);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const toBlob = (type: string, q: number) => new Promise<Blob | null>((r) => canvas.toBlob(r, type, q));
  const webp = await toBlob("image/webp", 0.82);
  // older Safari can't encode WebP and silently returns PNG
  if (webp && webp.type === "image/webp") return webp;
  return (await toBlob("image/jpeg", 0.85))!;
}

export function ImagePicker({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const blob = await shrink(file);
      const fd = new FormData();
      fd.append("file", new File([blob], `foto.${blob.type === "image/webp" ? "webp" : "jpg"}`, { type: blob.type }));
      const res = await uploadImageAction(fd);
      if (res.ok) onChange(res.url);
      else setError(res.error);
    } catch {
      setError("Impossibile leggere questa immagine. Prova con una foto JPG.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-dashed border-white/15 bg-ink">
        {value ? (
          <Image src={value} alt="Foto del piatto" fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" />
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-cream/60">
            <IconImage className="h-10 w-10" />
            <span className="font-semibold">Aggiungi una foto</span>
            <span className="text-sm text-cream/40">Puoi scattarla direttamente dal telefono</span>
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-ink/70 backdrop-blur-sm">
            <span className="h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          </div>
        )}
      </div>
      {value && (
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => input.current?.click()} className="btn btn-line min-h-10 flex-1 text-sm">
            Cambia foto
          </button>
          <button type="button" onClick={() => onChange("")} className="btn min-h-10 px-4 text-sm text-cream/60 hover:text-ember">
            <IconTrash className="h-4 w-4" /> Rimuovi
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-ember">{error}</p>}
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}
