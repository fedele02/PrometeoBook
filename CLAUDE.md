@AGENTS.md

## Regola del progetto: ogni modifica si propaga

Quando cambi qualcosa, nella **stessa** modifica aggiorna anche tutto ciò che ne dipende. Un lavoro non è finito finché questi punti non sono allineati:

- **Grafo (graphify)**: dopo modifiche al codice esegui `graphify update .` (solo AST, nessun costo). Se cambiano documenti (README, design system, CLAUDE.md) esegui `/graphify . --update`. L'hook post-commit ricostruisce il grafo del codice da solo, ma non i documenti.
- **README.md**: istruzioni di setup e deploy, la tabella “Da dove vengono i contenuti” e la lista “Da completare con il cliente”.
- **Design system** (`design-system/prometeo-fine-dining/MASTER.md`): se cambi colori, font, componenti, spaziature o animazioni. I token vivono in `src/app/globals.css`: tienili coerenti.
- **Modello dati**: un campo nuovo va in tutti i punti della catena: `src/lib/types.ts` → `src/lib/schemas.ts` → `src/lib/seed.ts` → form dell'admin (`SettingsForm.tsx` / `MenuEditor.tsx`). Le impostazioni stanno in un `jsonb`, quindi non serve una migrazione; colonne nuove di `categories`, `dishes` o `bookings` vanno invece aggiunte a `supabase/schema.sql`.
- **Variabili d'ambiente**: ogni variabile nuova va in `.env.example` e nella sezione Vercel del README.
- **Contenuti**: mai inventare testi, prezzi, allergeni o recensioni. Ogni contenuto ha una fonte, da annotare nel README; i testi scritti da noi vanno segnati come “da approvare”.
- **Prima di consegnare**: `npm run typecheck`, `npm run lint` e `npm run build` puliti, poi verifica su cellulare (320–430 px) prima che su desktop.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
