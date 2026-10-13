# Graph Report - PrometeoBook  (2026-10-13)

## Corpus Check
- 95 files · ~47,969 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 731 nodes · 2129 edges · 16 communities (14 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 74 edges (avg confidence: 0.86)
- Token cost: 195,832 input · 0 output

## Community Hubs (Navigation)
- Prenotazioni e timeline staff
- Sito pubblico e layout
- App Gestione: navigazione e PWA
- Azioni admin, menu e impostazioni
- WhatsApp automatico (YCloud)
- Documentazione e design system
- Prenotazione cliente e pagina privata
- Dipendenze e strumenti
- Modello dati e notifiche push
- Accesso e autenticazione
- Configurazione TypeScript
- Schema database
- Icona app Gestione
- Migrazione app Gestione
- Migrazione WhatsApp
- Configurazione PostCSS

## God Nodes (most connected - your core abstractions)
1. `next` - 42 edges
2. `README - Prometeo Fine Dining sito web` - 37 edges
3. `base()` - 34 edges
4. `formatDateLong()` - 28 edges
5. `react` - 25 edges
6. `BookingWizard()` - 25 edges
7. `telHref()` - 24 edges
8. `MenuEditor()` - 21 edges
9. `RequestCard()` - 21 edges
10. `serviceLabel()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `Design pre-delivery checklist` --semantically_similar_to--> `Pre-Delivery Checks (typecheck, lint, build, mobile 320-430px)`  [INFERRED] [semantically similar]
  design-system/prometeo-fine-dining/MASTER.md → CLAUDE.md
- `Design pre-delivery checklist` --semantically_similar_to--> `No invented content rule`  [INFERRED] [semantically similar]
  design-system/prometeo-fine-dining/MASTER.md → CLAUDE.md
- `Prometeo Fine Dining Website` --references--> `Motion Rules (fade+slide-up, stagger, reducedMotion user)`  [EXTRACTED]
  README.md → design-system/prometeo-fine-dining/MASTER.md
- `App icon (logo + GESTIONE, Penpot export)` --conceptually_related_to--> `Prometeo Gestione staff app (installable PWA)`  [INFERRED]
  design-system/prometeo-fine-dining/MASTER.md → README.md
- `Staff app design (A+B hybrid approved in Penpot)` --implements--> `Prometeo Gestione staff app (installable PWA)`  [INFERRED]
  design-system/prometeo-fine-dining/MASTER.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Booking request lifecycle (request, staff decision, WhatsApp reply, customer edit)** — readme_booking_flow, readme_booking_states, readme_accept_reject_flow, readme_whatsapp_ycloud, readme_customer_booking_page, readme_create_booking_function [INFERRED 0.85]
- **Prometeo Gestione staff app UI** — design_system_prometeo_fine_dining_master_staff_app_design, design_system_prometeo_fine_dining_master_request_card, design_system_prometeo_fine_dining_master_timeline_in_sala, design_system_prometeo_fine_dining_master_whatsapp_status_ui, design_system_prometeo_fine_dining_master_app_icon [EXTRACTED 1.00]
- **Brand design tokens (color, type, spacing, motion)** — design_system_prometeo_fine_dining_master_color_tokens, design_system_prometeo_fine_dining_master_typography, design_system_prometeo_fine_dining_master_spacing, design_system_prometeo_fine_dining_master_motion_rules, design_system_prometeo_fine_dining_master_components [EXTRACTED 1.00]
- **App icon composition: logo mark + wordmark + palette** — design_app_icon_icon_1024_hand_flame_logo, design_app_icon_icon_1024_gestione_wordmark, design_app_icon_icon_1024_gold_on_black_palette [EXTRACTED 1.00]
- **Gestione brand lockup composition** — design_app_icon_lockup_1024_hand_flame_mark, design_app_icon_lockup_1024_gestione_wordmark, design_app_icon_lockup_1024_gold_brand_color [EXTRACTED 1.00]

## Communities (16 total, 2 thin omitted)

### Community 0 - "Prenotazioni e timeline staff"
Cohesion: 0.07
Nodes (82): acceptBookingAction(), answer(), AnswerResult, cancelBookingAction(), declineBookingAction(), created, metadata, plural() (+74 more)

### Community 1 - "Sito pubblico e layout"
Cohesion: 0.05
Nodes (56): nextConfig, motion, next, cinzel, cormorant, hanken, metadata, viewport (+48 more)

### Community 2 - "App Gestione: navigazione e PWA"
Cohesion: 0.06
Nodes (72): icons(), OUT, png(), splashes(), logoutAction(), removeDeviceAction(), testPushAction(), updateDevicePrefsAction() (+64 more)

### Community 3 - "Azioni admin, menu e impostazioni"
Cohesion: 0.07
Nodes (66): qrcode, react, zod, ActionResult, cookieOpts, createBookingAction(), deleteBookingAction(), deleteCategoryAction() (+58 more)

### Community 4 - "WhatsApp automatico (YCloud)"
Cohesion: 0.06
Nodes (66): bad(), check(), [command = "check", arg], commands, createTemplates(), createWebhook(), die(), digits() (+58 more)

### Community 5 - "Documentazione e design system"
Cohesion: 0.06
Nodes (54): AGENTS.md, Data model chain (types.ts -> schemas.ts -> seed.ts -> admin forms), Graphify Update Workflow, graphify knowledge graph workflow, Pre-Delivery Checks (typecheck, lint, build, mobile 320-430px), Design System MASTER - Prometeo Fine Dining, App icon (logo + GESTIONE, Penpot export), Color Tokens (ink, ink-2, ink-3, cream, gold, gold-deep, paper, ember) (+46 more)

### Community 6 - "Prenotazione cliente e pagina privata"
Cohesion: 0.10
Nodes (45): Availability, BookingInput, BookingResult, bookingSchema, cancelMyBooking(), changeMyBooking(), changeSchema, getAvailability() (+37 more)

### Community 7 - "Dipendenze e strumenti"
Cohesion: 0.04
Nodes (47): eslintConfig, dependencies, motion, next, qrcode, react, react-dom, server-only (+39 more)

### Community 8 - "Modello dati e notifiche push"
Cohesion: 0.07
Nodes (36): db, force, steps, metadata, NotificationsPage(), announce(), BookingEvent, clip() (+28 more)

### Community 9 - "Accesso e autenticazione"
Cohesion: 0.16
Nodes (22): server-only, @supabase/ssr, @supabase/supabase-js, loginAction(), LoginPage(), metadata, LoginForm(), Admin (+14 more)

### Community 10 - "Configurazione TypeScript"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 11 - "Schema database"
Cohesion: 0.18
Nodes (12): bookings_date_idx, bookings_phone_idx, dishes_category_idx, public.admins, public.bookings, public.categories, public.dishes, public.push_devices (+4 more)

### Community 12 - "Icona app Gestione"
Cohesion: 0.16
Nodes (16): Prometeo Gestione App Icon (1024px), GESTIONE Serif Wordmark, Gold on Black Brand Palette, Hand and Flame Logo Mark, Prometeo Fine Dining Brand, Prometeo Gestione Staff Web App, GESTIONE Wordmark, Gold on Near-Black Palette (+8 more)

### Community 14 - "Migrazione WhatsApp"
Cohesion: 0.60
Nodes (3): public.whatsapp_messages, whatsapp_messages_booking_idx, whatsapp_messages_provider_idx

## Knowledge Gaps
- **14 isolated node(s):** `react-dom`, `@tailwindcss/postcss`, `@types/node`, `@types/qrcode`, `@types/react` (+9 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 197 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Sito pubblico e layout` to `Prenotazioni e timeline staff`, `App Gestione: navigazione e PWA`, `Azioni admin, menu e impostazioni`, `Prenotazione cliente e pagina privata`, `Dipendenze e strumenti`, `Modello dati e notifiche push`, `Accesso e autenticazione`?**
  _High betweenness centrality (0.242) - this node is a cross-community bridge._
- **What connects `react-dom`, `@tailwindcss/postcss`, `@types/node` to the rest of the system?**
  _14 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Prenotazioni e timeline staff` be split into smaller, more focused modules?**
  _Cohesion score 0.0662280701754386 - nodes in this community are weakly interconnected._
- **Why does `src/app/globals.css (@theme tokens)` connect `Documentazione e design system` to `Sito pubblico e layout`?**
  _High betweenness centrality (0.151) - this node is a cross-community bridge._
- **Should `Sito pubblico e layout` be split into smaller, more focused modules?**
  _Cohesion score 0.052184769038701624 - nodes in this community are weakly interconnected._
- **Should `App Gestione: navigazione e PWA` be split into smaller, more focused modules?**
  _Cohesion score 0.05737234652897304 - nodes in this community are weakly interconnected._
- **Should `Azioni admin, menu e impostazioni` be split into smaller, more focused modules?**
  _Cohesion score 0.0695970695970696 - nodes in this community are weakly interconnected._