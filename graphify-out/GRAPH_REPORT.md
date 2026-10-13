# Graph Report - PrometeoBook  (2026-10-13)

## Corpus Check
- 108 files · ~53,916 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 787 nodes · 2311 edges · 25 communities (16 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 76 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3b440d1b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- time.ts
- next
- Icons.tsx
- MenuEditor.tsx
- whatsapp.ts
- README - Prometeo Fine Dining sito web
- BookingWizard.tsx
- package.json
- gestore-prometeo-2026/actions.ts
- auth.ts
- compilerOptions
- Prometeo Gestione Staff Web App
- 2026-10-13_app-gestione.sql
- public.whatsapp_messages
- postcss.config.mjs
- vercel.json
- BookingsBoard.tsx
- [code]/page.tsx
- instrumentation-client.ts
- 2026-10-15_error-logs.sql

## God Nodes (most connected - your core abstractions)
1. `next` - 46 edges
2. `README - Prometeo Fine Dining sito web` - 37 edges
3. `base()` - 35 edges
4. `formatDateLong()` - 28 edges
5. `react` - 27 edges
6. `BookingWizard()` - 25 edges
7. `logError()` - 25 edges
8. `telHref()` - 23 edges
9. `serviceLabel()` - 23 edges
10. `MenuEditor()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `Design pre-delivery checklist` --semantically_similar_to--> `Pre-Delivery Checks (typecheck, lint, build, mobile 320-430px)`  [INFERRED] [semantically similar]
  design-system/prometeo-fine-dining/MASTER.md → CLAUDE.md
- `Design pre-delivery checklist` --semantically_similar_to--> `No invented content rule`  [INFERRED] [semantically similar]
  design-system/prometeo-fine-dining/MASTER.md → CLAUDE.md
- `test()` --calls--> `toE164()`  [EXTRACTED]
  scripts/whatsapp.ts → src/lib/whatsapp/ycloud.ts
- `Prometeo Fine Dining Website` --references--> `Motion Rules (fade+slide-up, stagger, reducedMotion user)`  [EXTRACTED]
  README.md → design-system/prometeo-fine-dining/MASTER.md
- `App icon (logo + GESTIONE, Penpot export)` --conceptually_related_to--> `Prometeo Gestione staff app (installable PWA)`  [INFERRED]
  design-system/prometeo-fine-dining/MASTER.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Brand design tokens (color, type, spacing, motion)** — design_system_prometeo_fine_dining_master_color_tokens, design_system_prometeo_fine_dining_master_typography, design_system_prometeo_fine_dining_master_spacing, design_system_prometeo_fine_dining_master_motion_rules, design_system_prometeo_fine_dining_master_components [EXTRACTED 1.00]
- **App icon composition: logo mark + wordmark + palette** — design_app_icon_icon_1024_hand_flame_logo, design_app_icon_icon_1024_gestione_wordmark, design_app_icon_icon_1024_gold_on_black_palette [EXTRACTED 1.00]
- **Gestione brand lockup composition** — design_app_icon_lockup_1024_hand_flame_mark, design_app_icon_lockup_1024_gestione_wordmark, design_app_icon_lockup_1024_gold_brand_color [EXTRACTED 1.00]
- **Prometeo Gestione staff app UI** — design_system_prometeo_fine_dining_master_staff_app_design, design_system_prometeo_fine_dining_master_request_card, design_system_prometeo_fine_dining_master_timeline_in_sala, design_system_prometeo_fine_dining_master_whatsapp_status_ui, design_system_prometeo_fine_dining_master_app_icon [EXTRACTED 1.00]
- **Booking request lifecycle (request, staff decision, WhatsApp reply, customer edit)** — readme_booking_flow, readme_booking_states, readme_accept_reject_flow, readme_whatsapp_ycloud, readme_customer_booking_page, readme_create_booking_function [INFERRED 0.85]

## Communities (25 total, 9 thin omitted)

### Community 0 - "time.ts"
Cohesion: 0.09
Nodes (52): BookingsPage(), metadata, metadata, RequestsPage(), BookingsBoard(), Capacity(), DayChip, Row (+44 more)

### Community 1 - "next"
Cohesion: 0.06
Nodes (55): nextConfig, motion, next, cinzel, cormorant, hanken, metadata, viewport (+47 more)

### Community 2 - "Icons.tsx"
Cohesion: 0.06
Nodes (71): icons(), OUT, png(), splashes(), logoutAction(), removeDeviceAction(), AdminRootLayout(), metadata (+63 more)

### Community 3 - "MenuEditor.tsx"
Cohesion: 0.09
Nodes (54): qrcode, react, ActionResult, clearErrorLogsAction(), deleteCategoryAction(), deleteDishAction(), publish(), reorderCategoriesAction() (+46 more)

### Community 4 - "whatsapp.ts"
Cohesion: 0.11
Nodes (33): bad(), check(), [command = "check", arg], commands, createTemplates(), createWebhook(), die(), digits() (+25 more)

### Community 5 - "README - Prometeo Fine Dining sito web"
Cohesion: 0.06
Nodes (54): AGENTS.md, Data model chain (types.ts -> schemas.ts -> seed.ts -> admin forms), Graphify Update Workflow, graphify knowledge graph workflow, Pre-Delivery Checks (typecheck, lint, build, mobile 320-430px), Design System MASTER - Prometeo Fine Dining, App icon (logo + GESTIONE, Penpot export), Color Tokens (ink, ink-2, ink-3, cream, gold, gold-deep, paper, ember) (+46 more)

### Community 6 - "BookingWizard.tsx"
Cohesion: 0.08
Nodes (55): Availability, BookingInput, BookingResult, bookingSchema, cancelMyBooking(), changeMyBooking(), changeSchema, checkSlot() (+47 more)

### Community 7 - "package.json"
Cohesion: 0.04
Nodes (46): eslintConfig, dependencies, motion, next, qrcode, react, react-dom, server-only (+38 more)

### Community 8 - "gestore-prometeo-2026/actions.ts"
Cohesion: 0.06
Nodes (62): web-push, zod, GET(), hits, POST(), tooMany(), acceptBookingAction(), answer() (+54 more)

### Community 9 - "auth.ts"
Cohesion: 0.11
Nodes (30): server-only, @supabase/ssr, @supabase/supabase-js, db, force, steps, loginAction(), LoginPage() (+22 more)

### Community 10 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 12 - "Prometeo Gestione Staff Web App"
Cohesion: 0.16
Nodes (16): Prometeo Gestione App Icon (1024px), GESTIONE Serif Wordmark, Gold on Black Brand Palette, Hand and Flame Logo Mark, Prometeo Fine Dining Brand, Prometeo Gestione Staff Web App, GESTIONE Wordmark, Gold on Near-Black Palette (+8 more)

### Community 14 - "public.whatsapp_messages"
Cohesion: 0.60
Nodes (3): public.whatsapp_messages, whatsapp_messages_booking_idx, whatsapp_messages_provider_idx

### Community 16 - "vercel.json"
Cohesion: 0.50
Nodes (3): crons, regions, $schema

### Community 20 - "BookingsBoard.tsx"
Cohesion: 0.06
Nodes (63): POST(), AnswerResult, cancelBookingAction(), deleteBookingAction(), metadata, SettingsPage(), dayHref(), DayStrip() (+55 more)

### Community 21 - "[code]/page.tsx"
Cohesion: 0.23
Nodes (10): blocked(), metadata, miss(), misses, ShortLinkPage(), isShortCode(), normalizeShortCode(), SHORT_CODE_ALPHABET (+2 more)

## Knowledge Gaps
- **179 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+174 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 218 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `Icons.tsx`, `MenuEditor.tsx`, `BookingWizard.tsx`, `package.json`, `gestore-prometeo-2026/actions.ts`, `auth.ts`, `BookingsBoard.tsx`, `[code]/page.tsx`?**
  _High betweenness centrality (0.241) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _179 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `time.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09265536723163842 - nodes in this community are weakly interconnected._
- **Why does `src/app/globals.css (@theme tokens)` connect `README - Prometeo Fine Dining sito web` to `next`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.05693664795509222 - nodes in this community are weakly interconnected._
- **Should `Icons.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05877167205406994 - nodes in this community are weakly interconnected._
- **Should `MenuEditor.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08531746031746032 - nodes in this community are weakly interconnected._