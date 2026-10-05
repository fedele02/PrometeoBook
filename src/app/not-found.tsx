import Link from "next/link";
import { Emblem } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-ink px-6 text-center">
      <div>
        <Emblem className="mx-auto h-16 w-auto text-gold" />
        <h1 className="caps mt-8 text-3xl text-cream">Pagina non trovata</h1>
        <p className="mt-3 text-cream/65">La pagina che cerchi non esiste o è stata spostata.</p>
        <Link href="/" className="btn btn-gold mt-8">
          Torna alla home
        </Link>
      </div>
    </main>
  );
}
