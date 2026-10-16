# Graph Report - PrometeoBook  (2026-10-16)

## Corpus Check
- 110 files · ~54,830 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 795 nodes · 2336 edges · 35 communities (24 shown, 11 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 76 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b6dd466e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- logError
- next
- Icons.tsx
- MenuEditor.tsx
- index.ts
- README - Prometeo Fine Dining sito web
- BookingWizard.tsx
- package.json
- [code]/page.tsx
- auth.ts
- compilerOptions
- Prometeo Gestione Staff Web App
- 2026-10-13_app-gestione.sql
- public.whatsapp_messages
- postcss.config.mjs
- vercel.json
- src_lib_data_index
- BookingsBoard.tsx
- events.ts
- errori/page.tsx
- instrumentation-client.ts
- 2026-10-15_error-logs.sql
- types.ts
- dependencies
- devDependencies
- seed.ts
- scripts
- eslint.config.mjs

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
10. `RequestCard()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `Design pre-delivery checklist` --semantically_similar_to--> `Pre-Delivery Checks (typecheck, lint, build, mobile 320-430px)`  [INFERRED] [semantically similar]
  design-system/prometeo-fine-dining/MASTER.md → CLAUDE.md
- `Design pre-delivery checklist` --semantically_similar_to--> `No invented content rule`  [INFERRED] [semantically similar]
  design-system/prometeo-fine-dining/MASTER.md → CLAUDE.md
- `Prometeo Fine Dining Website` --references--> `Motion Rules (fade+slide-up, stagger, reducedMotion user)`  [EXTRACTED]
  README.md → design-system/prometeo-fine-dining/MASTER.md
- `App icon (logo + GESTIONE, Penpot export)` --conceptually_related_to--> `Prometeo Gestione staff app (installable PWA)`  [INFERRED]
  design-system/prometeo-fine-dining/MASTER.md → README.md
- `Request card (Accetta / Rifiuta / call, in-place refusal)` --implements--> `Accetta / Rifiuta request flow`  [INFERRED]
  design-system/prometeo-fine-dining/MASTER.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Brand design tokens (color, type, spacing, motion)** — design_system_prometeo_fine_dining_master_color_tokens, design_system_prometeo_fine_dining_master_typography, design_system_prometeo_fine_dining_master_spacing, design_system_prometeo_fine_dining_master_motion_rules, design_system_prometeo_fine_dining_master_components [EXTRACTED 1.00]
- **App icon composition: logo mark + wordmark + palette** — design_app_icon_icon_1024_hand_flame_logo, design_app_icon_icon_1024_gestione_wordmark, design_app_icon_icon_1024_gold_on_black_palette [EXTRACTED 1.00]
- **Gestione brand lockup composition** — design_app_icon_lockup_1024_hand_flame_mark, design_app_icon_lockup_1024_gestione_wordmark, design_app_icon_lockup_1024_gold_brand_color [EXTRACTED 1.00]
- **Prometeo Gestione staff app UI** — design_system_prometeo_fine_dining_master_staff_app_design, design_system_prometeo_fine_dining_master_request_card, design_system_prometeo_fine_dining_master_timeline_in_sala, design_system_prometeo_fine_dining_master_whatsapp_status_ui, design_system_prometeo_fine_dining_master_app_icon [EXTRACTED 1.00]
- **Booking request lifecycle (request, staff decision, WhatsApp reply, customer edit)** — readme_booking_flow, readme_booking_states, readme_accept_reject_flow, readme_whatsapp_ycloud, readme_customer_booking_page, readme_create_booking_function [INFERRED 0.85]

## Communities (35 total, 11 thin omitted)

### Community 0 - "logError"
Cohesion: 0.22
Nodes (9): GET(), hits, POST(), tooMany(), onRequestError(), cut(), describe(), logError() (+1 more)

### Community 1 - "next"
Cohesion: 0.06
Nodes (52): nextConfig, next, cinzel, cormorant, hanken, metadata, viewport, NotFound() (+44 more)

### Community 2 - "Icons.tsx"
Cohesion: 0.06
Nodes (75): icons(), OUT, png(), splashes(), logoutAction(), removeDeviceAction(), AdminRootLayout(), metadata (+67 more)

### Community 3 - "MenuEditor.tsx"
Cohesion: 0.07
Nodes (68): qrcode, react, zod, ActionResult, clearErrorLogsAction(), cookieOpts, createBookingAction(), deleteBookingAction() (+60 more)

### Community 4 - "index.ts"
Cohesion: 0.05
Nodes (67): bad(), check(), [command = "check", arg], commands, createTemplates(), createWebhook(), die(), digits() (+59 more)

### Community 5 - "README - Prometeo Fine Dining sito web"
Cohesion: 0.06
Nodes (54): AGENTS.md, Data model chain (types.ts -> schemas.ts -> seed.ts -> admin forms), Graphify Update Workflow, graphify knowledge graph workflow, Pre-Delivery Checks (typecheck, lint, build, mobile 320-430px), Design System MASTER - Prometeo Fine Dining, App icon (logo + GESTIONE, Penpot export), Color Tokens (ink, ink-2, ink-3, cream, gold, gold-deep, paper, ember) (+46 more)

### Community 6 - "BookingWizard.tsx"
Cohesion: 0.08
Nodes (48): Availability, BookingInput, BookingResult, bookingSchema, cancelMyBooking(), changeMyBooking(), changeSchema, fullMessage() (+40 more)

### Community 7 - "package.json"
Cohesion: 0.13
Nodes (14): name, private, version, motion, react-dom, tailwindcss, @tailwindcss/postcss, @types/node (+6 more)

### Community 8 - "[code]/page.tsx"
Cohesion: 0.18
Nodes (13): blocked(), metadata, miss(), misses, ShortLinkPage(), GuestBookingPage(), metadata, GuestBookingSection() (+5 more)

### Community 9 - "auth.ts"
Cohesion: 0.18
Nodes (21): server-only, @supabase/ssr, loginAction(), LoginPage(), metadata, LoginForm(), Admin, getAdmin (+13 more)

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

### Community 20 - "src_lib_data_index"
Cohesion: 0.27
Nodes (9): metadata, NotificationsPage(), configure(), DEFAULT_PREFS, DEVICE_COOKIE, isPushEnabled(), pushToDevices(), VAPID_PUBLIC_KEY (+1 more)

### Community 21 - "BookingsBoard.tsx"
Cohesion: 0.07
Nodes (87): acceptBookingAction(), answer(), AnswerResult, cancelBookingAction(), declineBookingAction(), created, CustomersPage(), Detail() (+79 more)

### Community 23 - "events.ts"
Cohesion: 0.29
Nodes (10): announce(), BookingEvent, clip(), currentDevice(), describe(), guests(), shortDate(), esc() (+2 more)

### Community 24 - "errori/page.tsx"
Cohesion: 0.25
Nodes (7): Entry(), metadata, SOURCE, when, TZ, ErrorLog, ErrorSource

### Community 28 - "types.ts"
Cohesion: 0.15
Nodes (13): Booking, BookingChange, BookingSettings, Closure, DayHours, GuestChange, MenuData, NewBooking (+5 more)

### Community 32 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, motion, next, qrcode, react, react-dom, server-only, @supabase/ssr (+3 more)

### Community 33 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/qrcode, @types/react (+3 more)

### Community 34 - "seed.ts"
Cohesion: 0.24
Nodes (8): @supabase/supabase-js, db, force, steps, lunchDinner, seedCategories, seedDishes, seedSettings

### Community 35 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, assets:app, build, dev, lint, seed:supabase, start, typecheck (+1 more)

### Community 37 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

## Knowledge Gaps
- **14 isolated node(s):** `react-dom`, `@tailwindcss/postcss`, `@types/node`, `@types/qrcode`, `@types/react` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 222 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `logError`, `Icons.tsx`, `MenuEditor.tsx`, `BookingWizard.tsx`, `package.json`, `[code]/page.tsx`, `auth.ts`, `src_lib_data_index`, `BookingsBoard.tsx`, `events.ts`, `errori/page.tsx`?**
  _High betweenness centrality (0.238) - this node is a cross-community bridge._
- **What connects `react-dom`, `@tailwindcss/postcss`, `@types/node` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.05962059620596206 - nodes in this community are weakly interconnected._
- **Why does `src/app/globals.css (@theme tokens)` connect `README - Prometeo Fine Dining sito web` to `next`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **Should `Icons.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05693664795509222 - nodes in this community are weakly interconnected._
- **Should `MenuEditor.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0670886075949367 - nodes in this community are weakly interconnected._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05477477477477478 - nodes in this community are weakly interconnected._