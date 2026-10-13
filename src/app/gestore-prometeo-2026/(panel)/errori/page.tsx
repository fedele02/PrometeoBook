import Link from "next/link";
import { requireDeveloper } from "@/lib/auth";
import { repo } from "@/lib/data";
import { TZ } from "@/lib/time";
import type { ErrorLog, ErrorSource } from "@/lib/types";
import { Card, PageTitle } from "@/components/admin/ui";
import { ErrorLogTools } from "@/components/admin/ErrorLogTools";

export const metadata = { title: "Log errori" };

const LIMIT = 300;

const SOURCE: Record<ErrorSource, { label: string; hint: string; cls: string }> = {
  render: { label: "Pagina", hint: "errore mentre il server preparava una pagina", cls: "bg-ember/20 text-ember" },
  route: { label: "API", hint: "errore in un indirizzo /api (cron, webhook…)", cls: "bg-ember/20 text-ember" },
  action: { label: "Azione", hint: "errore in un salvataggio o in un pulsante", cls: "bg-ember/20 text-ember" },
  proxy: { label: "Proxy", hint: "errore nel controllo della sessione di Gestione", cls: "bg-ember/20 text-ember" },
  browser: { label: "Browser", hint: "errore sul telefono o computer di chi usava il sito", cls: "bg-gold/15 text-gold-light" },
  handled: { label: "Gestito", hint: "l'app se n'è accorta e ha continuato (notifica, WhatsApp, email…)", cls: "bg-white/[0.08] text-cream/80" },
};

const when = new Intl.DateTimeFormat("it-IT", { timeZone: TZ, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" });

export default async function ErrorLogPage({ searchParams }: PageProps<"/gestore-prometeo-2026/errori">) {
  await requireDeveloper();
  const sp = await searchParams;
  const tipo = typeof sp.tipo === "string" && sp.tipo in SOURCE ? (sp.tipo as ErrorSource) : null;

  let logs: ErrorLog[] = [];
  let loadError = "";
  try {
    logs = await repo().listErrorLogs(LIMIT);
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e);
  }
  const counts = logs.reduce<Partial<Record<ErrorSource, number>>>((acc, l) => ({ ...acc, [l.source]: (acc[l.source] ?? 0) + 1 }), {});
  const list = tipo ? logs.filter((l) => l.source === tipo) : logs;
  const chip = (on: boolean) =>
    `inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${on ? "bg-gold/15 text-gold-light" : "bg-white/[0.05] text-cream/70 hover:text-cream"}`;

  return (
    <>
      <PageTitle title="Log errori" subtitle="Ogni errore del sito e di Gestione, dal più recente. Si cancellano da soli dopo 30 giorni.">
        <ErrorLogTools hasLogs={logs.length > 0} />
      </PageTitle>

      {loadError ? (
        <Card>
          <p className="font-semibold text-ember">Il log non si può leggere</p>
          <p className="mt-1 text-cream/70">{loadError}</p>
          <p className="mt-3 text-sm text-cream/60">
            Se dice che la tabella non esiste: su Supabase → SQL Editor esegui <code className="text-cream">supabase/migrations/2026-10-15_error-logs.sql</code>.
          </p>
        </Card>
      ) : (
        <>
          <nav aria-label="Filtra per tipo" className="flex flex-wrap gap-2">
            <Link href="/gestore-prometeo-2026/errori" className={chip(!tipo)}>
              Tutti <span className="text-cream/50">{logs.length}</span>
            </Link>
            {(Object.keys(SOURCE) as ErrorSource[])
              .filter((k) => counts[k])
              .map((k) => (
                <Link key={k} href={`/gestore-prometeo-2026/errori?tipo=${k}`} className={chip(tipo === k)} title={SOURCE[k].hint}>
                  {SOURCE[k].label} <span className="text-cream/50">{counts[k]}</span>
                </Link>
              ))}
          </nav>

          {list.length === 0 ? (
            <Card className="mt-4">
              <p className="text-cream/70">Nessun errore registrato.</p>
              <p className="mt-1 text-sm text-cream/50">Con “Errore di prova” puoi controllare che il log funzioni.</p>
            </Card>
          ) : (
            <ul className="mt-4 space-y-3">
              {list.map((l) => (
                <li key={l.id}>
                  <Entry log={l} />
                </li>
              ))}
            </ul>
          )}
          {logs.length === LIMIT && <p className="mt-4 text-sm text-cream/50">Mostrati gli ultimi {LIMIT} errori.</p>}
        </>
      )}
    </>
  );
}

function Entry({ log }: { log: ErrorLog }) {
  const s = SOURCE[log.source] ?? SOURCE.handled;
  const details = Object.entries(log.context ?? {}).filter(([, v]) => v !== undefined && v !== null && v !== "");
  return (
    <details className="group rounded-lg border border-white/[0.07] bg-ink-2 open:border-gold/30">
      <summary className="flex cursor-pointer list-none flex-col gap-1.5 p-4 md:p-5 [&::-webkit-details-marker]:hidden">
        <span className="flex flex-wrap items-center gap-2 text-sm">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`} title={s.hint}>
            {s.label}
          </span>
          <time dateTime={log.created_at} className="text-cream/60">
            {when.format(new Date(log.created_at))}
          </time>
          {log.path && <span className="min-w-0 truncate font-mono text-xs text-cream/50">{log.path}</span>}
        </span>
        <span className="break-words font-semibold leading-snug [overflow-wrap:anywhere]">{log.message}</span>
      </summary>
      <div className="space-y-3 border-t border-white/[0.06] px-4 pb-4 pt-3 text-sm md:px-5">
        <p className="text-cream/60">{s.hint}</p>
        {details.length > 0 && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            {details.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-cream/50">{k}</dt>
                <dd className="min-w-0 break-words font-mono text-xs leading-5 text-cream/80 [overflow-wrap:anywhere]">{typeof v === "string" ? v : JSON.stringify(v)}</dd>
              </div>
            ))}
          </dl>
        )}
        {log.stack && (
          <pre className="max-h-80 overflow-auto rounded-xl bg-black/30 p-3 font-mono text-[0.7rem] leading-5 text-cream/75">{log.stack}</pre>
        )}
      </div>
    </details>
  );
}
