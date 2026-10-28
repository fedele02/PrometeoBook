# Graph Report - PrometeoBook  (2026-10-28)

## Corpus Check
- 128 files · ~80,555 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .example 1, .log 1)

## Summary
- 957 nodes · 3010 edges · 40 communities (24 shown, 16 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 81 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `63ef3b18`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- index.ts
- (site)/page.tsx
- Icons.tsx
- gestore-prometeo-2026/actions.ts
- messages.ts
- README - Prometeo Fine Dining sito web
- BookingWizard.tsx
- package.json
- next
- auth.ts
- compilerOptions
- Prometeo Gestione Staff Web App
- 2026-10-13_app-gestione.sql
- public.whatsapp_messages
- postcss.config.mjs
- vercel.json
- Messaggi WhatsApp da far approvare a Meta
- BookingsBoard.tsx
- PromotionsManager.tsx
- pwa.ts
- instrumentation-client.ts
- 2026-10-15_error-logs.sql
- PhoneInput.tsx
- dependencies
- devDependencies
- scripts
- 2026-10-25_promozioni-compleanni.sql
- eslint.config.mjs
- types.ts

## God Nodes (most connected - your core abstractions)
1. `next` - 50 edges
2. `BookingWizard()` - 40 edges
3. `formatDateLong()` - 39 edges
4. `base()` - 37 edges
5. `logError()` - 37 edges
6. `README - Prometeo Fine Dining sito web` - 37 edges
7. `react` - 30 edges
8. `romeNow()` - 27 edges
9. `addDays()` - 26 edges
10. `telHref()` - 25 edges

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

## Communities (40 total, 16 thin omitted)

### Community 0 - "index.ts"
Cohesion: 0.06
Nodes (60): GET(), GET(), hits, POST(), tooMany(), POST(), metadata, SettingsPage() (+52 more)

### Community 1 - "(site)/page.tsx"
Cohesion: 0.06
Nodes (45): qrcode, react, AdminMenuPage(), metadata, cinzel, cormorant, hanken, metadata (+37 more)

### Community 2 - "Icons.tsx"
Cohesion: 0.07
Nodes (67): logoutAction(), registerDeviceAction(), removeDeviceAction(), testPushAction(), updateDevicePrefsAction(), PanelLayout(), AdminNav(), Count() (+59 more)

### Community 3 - "gestore-prometeo-2026/actions.ts"
Cohesion: 0.08
Nodes (43): zod, ActionResult, clearErrorLogsAction(), cookieOpts, declineSchema, deleteCategoryAction(), deleteDishAction(), deviceSchema (+35 more)

### Community 4 - "messages.ts"
Cohesion: 0.07
Nodes (52): bad(), check(), [command = "check", arg], commands, createTemplates(), createWebhook(), deleteTemplate(), die() (+44 more)

### Community 5 - "README - Prometeo Fine Dining sito web"
Cohesion: 0.06
Nodes (54): AGENTS.md, Data model chain (types.ts -> schemas.ts -> seed.ts -> admin forms), Graphify Update Workflow, graphify knowledge graph workflow, Pre-Delivery Checks (typecheck, lint, build, mobile 320-430px), Design System MASTER - Prometeo Fine Dining, App icon (logo + GESTIONE, Penpot export), Color Tokens (ink, ink-2, ink-3, cream, gold, gold-deep, paper, ember) (+46 more)

### Community 6 - "BookingWizard.tsx"
Cohesion: 0.05
Nodes (84): Availability, birthdayBookingSchema, BookingInput, BookingResult, bookingSchema, changeMyBooking(), changeSchema, fullMessage() (+76 more)

### Community 7 - "package.json"
Cohesion: 0.14
Nodes (13): name, private, version, react-dom, tailwindcss, @tailwindcss/postcss, @types/node, @types/qrcode (+5 more)

### Community 8 - "next"
Cohesion: 0.08
Nodes (39): nextConfig, next, BirthdayLinkPage(), metadata, metadata, ShortLinkPage(), submitBirthdayBooking(), BookingPage() (+31 more)

### Community 9 - "auth.ts"
Cohesion: 0.17
Nodes (22): server-only, @supabase/ssr, @supabase/supabase-js, loginAction(), LoginPage(), metadata, LoginForm(), Admin (+14 more)

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

### Community 20 - "Messaggi WhatsApp da far approvare a Meta"
Cohesion: 0.22
Nodes (8): 1. Richiesta ricevuta, 2. Prenotazione confermata, 3. Richiesta non accettata, 4. Prenotazione annullata, 5. Auguri di compleanno, Che cosa finisce al posto delle variabili, Come farli convalidare, Messaggi WhatsApp da far approvare a Meta

### Community 21 - "BookingsBoard.tsx"
Cohesion: 0.08
Nodes (66): acceptBookingAction(), answer(), AnswerResult, cancelBookingAction(), declineBookingAction(), deleteBookingAction(), BookingsPage(), metadata (+58 more)

### Community 23 - "PromotionsManager.tsx"
Cohesion: 0.09
Nodes (65): motion, createBookingAction(), uploadImageAction(), created, CustomersPage(), daysBetween(), Detail(), metadata (+57 more)

### Community 24 - "pwa.ts"
Cohesion: 0.09
Nodes (22): icons(), OUT, png(), splashes(), png(), sizes, tiles, tx0 (+14 more)

### Community 27 - "PhoneInput.tsx"
Cohesion: 0.19
Nodes (13): Flag(), FLAGS, PhoneInput(), byDial, byIso, COUNTRIES, CountryIso, DEFAULT_COUNTRY (+5 more)

### Community 28 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, motion, next, qrcode, react, react-dom, server-only, @supabase/ssr (+3 more)

### Community 29 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/qrcode, @types/react (+3 more)

### Community 30 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, assets:app, assets:favicon, assets:map, build, dev, lint, seed:supabase (+3 more)

### Community 32 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 34 - "types.ts"
Cohesion: 0.08
Nodes (31): db, force, steps, STATUS, DishSheet(), DishRow(), matches(), MenuView() (+23 more)

## Knowledge Gaps
- **213 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+208 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 266 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `index.ts`, `(site)/page.tsx`, `Icons.tsx`, `gestore-prometeo-2026/actions.ts`, `types.ts`, `BookingWizard.tsx`, `package.json`, `auth.ts`, `BookingsBoard.tsx`, `PromotionsManager.tsx`, `pwa.ts`?**
  _High betweenness centrality (0.199) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `BookingWizard()` (e.g. with `IconCalendar()` and `IconClock()`) actually correct?**
  _`BookingWizard()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslintConfig`, `nextConfig`, `name` to the rest of the system?**
  _213 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.058747160012982795 - nodes in this community are weakly interconnected._
- **Why does `src/app/globals.css (@theme tokens)` connect `README - Prometeo Fine Dining sito web` to `(site)/page.tsx`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **Should `(site)/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0639386189258312 - nodes in this community are weakly interconnected._
- **Should `Icons.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07191780821917808 - nodes in this community are weakly interconnected._