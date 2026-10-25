# Graph Report - PrometeoBook  (2026-10-25)

## Corpus Check
- 111 files · ~55,885 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 803 nodes · 2343 edges · 28 communities (17 shown, 11 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 76 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c3ce2528`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types.ts
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
- Messaggi WhatsApp da far approvare a Meta
- BookingsBoard.tsx
- instrumentation-client.ts
- 2026-10-15_error-logs.sql
- MenuView.tsx

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

## Communities (28 total, 11 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.06
Nodes (47): qrcode, server-only, GET(), hits, POST(), tooMany(), AdminMenuPage(), metadata (+39 more)

### Community 1 - "next"
Cohesion: 0.06
Nodes (61): nextConfig, motion, next, cinzel, cormorant, hanken, metadata, viewport (+53 more)

### Community 2 - "Icons.tsx"
Cohesion: 0.07
Nodes (49): icons(), OUT, png(), splashes(), registerDeviceAction(), removeDeviceAction(), updateDevicePrefsAction(), AdminRootLayout() (+41 more)

### Community 3 - "MenuEditor.tsx"
Cohesion: 0.05
Nodes (86): zod, ActionResult, answer(), AnswerResult, cancelBookingAction(), clearErrorLogsAction(), cookieOpts, createBookingAction() (+78 more)

### Community 4 - "index.ts"
Cohesion: 0.05
Nodes (69): bad(), check(), [command = "check", arg], commands, createTemplates(), createWebhook(), die(), digits() (+61 more)

### Community 5 - "README - Prometeo Fine Dining sito web"
Cohesion: 0.06
Nodes (54): AGENTS.md, Data model chain (types.ts -> schemas.ts -> seed.ts -> admin forms), Graphify Update Workflow, graphify knowledge graph workflow, Pre-Delivery Checks (typecheck, lint, build, mobile 320-430px), Design System MASTER - Prometeo Fine Dining, App icon (logo + GESTIONE, Penpot export), Color Tokens (ink, ink-2, ink-3, cream, gold, gold-deep, paper, ember) (+46 more)

### Community 6 - "BookingWizard.tsx"
Cohesion: 0.10
Nodes (58): react, acceptBookingAction(), declineBookingAction(), Detail(), Availability, cancelMyBooking(), changeMyBooking(), fullMessage() (+50 more)

### Community 7 - "package.json"
Cohesion: 0.04
Nodes (47): eslintConfig, dependencies, motion, next, qrcode, react, react-dom, server-only (+39 more)

### Community 8 - "[code]/page.tsx"
Cohesion: 0.17
Nodes (13): blocked(), metadata, miss(), misses, ShortLinkPage(), GuestBookingPage(), metadata, GuestBookingSection() (+5 more)

### Community 9 - "auth.ts"
Cohesion: 0.16
Nodes (22): @supabase/ssr, @supabase/supabase-js, loginAction(), logoutAction(), LoginPage(), metadata, LoginForm(), Admin (+14 more)

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
Cohesion: 0.25
Nodes (7): 1. Richiesta ricevuta, 2. Prenotazione confermata, 3. Richiesta non accettata, 4. Prenotazione annullata, Che cosa finisce al posto delle variabili, Come farli convalidare, Messaggi WhatsApp da far approvare a Meta

### Community 21 - "BookingsBoard.tsx"
Cohesion: 0.07
Nodes (68): BookingsPage(), metadata, metadata, RequestsPage(), BookingInput, BookingResult, bookingSchema, changeSchema (+60 more)

### Community 34 - "MenuView.tsx"
Cohesion: 0.16
Nodes (15): db, force, steps, DishSheet(), DishRow(), ALLERGENS, DISH_TAGS, tagLabel() (+7 more)

## Knowledge Gaps
- **14 isolated node(s):** `react-dom`, `@tailwindcss/postcss`, `@types/node`, `@types/qrcode`, `@types/react` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 229 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `types.ts`, `Icons.tsx`, `MenuEditor.tsx`, `MenuView.tsx`, `BookingWizard.tsx`, `package.json`, `[code]/page.tsx`, `auth.ts`, `BookingsBoard.tsx`?**
  _High betweenness centrality (0.233) - this node is a cross-community bridge._
- **What connects `react-dom`, `@tailwindcss/postcss`, `@types/node` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06001984126984127 - nodes in this community are weakly interconnected._
- **Why does `src/app/globals.css (@theme tokens)` connect `README - Prometeo Fine Dining sito web` to `next`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.055364314400458976 - nodes in this community are weakly interconnected._
- **Should `Icons.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07380520266182698 - nodes in this community are weakly interconnected._
- **Should `MenuEditor.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05191919191919192 - nodes in this community are weakly interconnected._