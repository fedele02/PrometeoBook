# Graph Report - PrometeoBook  (2026-10-05)

## Corpus Check
- 64 files · ~24,602 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 436 nodes · 1097 edges · 14 communities (11 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.83)
- Token cost: 70,348 input · 0 output

## Community Hubs (Navigation)
- Prenotazione e validazione
- Azioni server dell'admin
- Layout radice e configurazione
- Documentazione, design system e regole
- Navigazione admin e icone
- Dipendenze e strumenti
- Dati iniziali e notifiche
- Accesso admin
- Configurazione TypeScript
- Dipendenze e strumenti (2)
- Documentazione, design system e regole (2)
- Configurazione PostCSS
- Documentazione, design system e regole (3)

## God Nodes (most connected - your core abstractions)
1. `next` - 31 edges
2. `base()` - 27 edges
3. `BookingWizard()` - 24 edges
4. `MenuEditor()` - 21 edges
5. `telHref()` - 17 edges
6. `HomePage()` - 17 edges
7. `Emblem()` - 16 edges
8. `BookingsBoard()` - 16 edges
9. `react` - 16 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Components (Button, Navbar, Mobile bar, Photos, Callout, Sheet)` --conceptually_related_to--> `4-Step Booking Flow (people, day, time, name/phone)`  [INFERRED]
  design-system/prometeo-fine-dining/MASTER.md → README.md
- `Lighthouse Mobile Results` --conceptually_related_to--> `Pre-delivery Checklist (viewports, touch targets, contrast, Lighthouse >= 90, no invented content)`  [INFERRED]
  README.md → design-system/prometeo-fine-dining/MASTER.md
- `UI UX Pro Max Skill` --references--> `Design System MASTER - Prometeo Fine Dining`  [EXTRACTED]
  README.md → design-system/prometeo-fine-dining/MASTER.md
- `Mobile First (320-430 px checked first)` --conceptually_related_to--> `Lighthouse Mobile Results`  [INFERRED]
  design-system/prometeo-fine-dining/MASTER.md → README.md
- `BookingWizard()` --indirect_call--> `IconCalendar()`  [INFERRED]
  src/components/booking/BookingWizard.tsx → src/components/Icons.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Booking Integrity: flow, server recheck, atomic SQL lock, anti-spam** — readme_booking_flow, readme_create_booking_function, readme_booking_anti_spam, readme_time_availability [EXTRACTED 1.00]
- **Artifacts kept aligned by the propagation rule** — claude_change_propagation_rule, claude_graphify_update_workflow, claude_data_model_chain, readme_design_system_master, readme_environment_variables, readme_content_sources [EXTRACTED 1.00]
- **Deployment Pipeline: Supabase setup then Vercel with env vars** — readme_supabase_setup, readme_vercel_deployment, readme_environment_variables, supabase_schema [EXTRACTED 1.00]
- **Prometeo design system foundations** — design_system_prometeo_fine_dining_master_color_tokens, design_system_prometeo_fine_dining_master_typography, design_system_prometeo_fine_dining_master_spacing, design_system_prometeo_fine_dining_master_components, design_system_prometeo_fine_dining_master_motion_rules [EXTRACTED 1.00]
- **Dual backend persistence (Supabase prod vs local demo)** — readme_data_repository, readme_local_demo_mode, supabase_schema [EXTRACTED 1.00]
- **Table booking pipeline (UI flow, availability, atomic insert, notification, admin)** — readme_booking_flow, readme_admin_area [INFERRED 0.85]

## Communities (14 total, 3 thin omitted)

### Community 0 - "Prenotazione e validazione"
Cohesion: 0.07
Nodes (55): BookingsPage(), metadata, Availability, BookingInput, BookingResult, bookingSchema, getAvailability(), Slot (+47 more)

### Community 1 - "Azioni server dell'admin"
Cohesion: 0.10
Nodes (53): qrcode, ActionResult, createBookingAction(), deleteBookingAction(), deleteCategoryAction(), deleteDishAction(), guarded(), publish() (+45 more)

### Community 2 - "Layout radice e configurazione"
Cohesion: 0.07
Nodes (30): nextConfig, next, metadata, src/app/globals.css (@theme tokens), cinzel, cormorant, hanken, metadata (+22 more)

### Community 3 - "Documentazione, design system e regole"
Cohesion: 0.06
Nodes (39): AGENTS.md, Data Model Propagation Chain (types -> schemas -> seed -> admin forms), Graphify Update Workflow, Pre-Delivery Checks (typecheck, lint, build, mobile 320-430px), Design System MASTER - Prometeo Fine Dining, Color Tokens (ink, ink-2, ink-3, cream, gold, gold-deep, paper, ember), Components (Button, Navbar, Mobile bar, Photos, Callout, Sheet), Motion Rules (fade+slide-up, stagger, reducedMotion user) (+31 more)

### Community 4 - "Navigazione admin e icone"
Cohesion: 0.09
Nodes (42): motion, PanelLayout(), HomePage(), JsonLd(), PERCORSO, Photo(), splitQuote(), AdminNav() (+34 more)

### Community 5 - "Dipendenze e strumenti"
Cohesion: 0.05
Nodes (41): eslintConfig, dependencies, motion, next, qrcode, react, react-dom, server-only (+33 more)

### Community 6 - "Dati iniziali e notifiche"
Cohesion: 0.09
Nodes (27): react, db, force, steps, DishSheet(), DishRow(), ALLERGENS, DISH_TAGS (+19 more)

### Community 7 - "Accesso admin"
Cohesion: 0.15
Nodes (23): server-only, @supabase/ssr, @supabase/supabase-js, loginAction(), logoutAction(), LoginPage(), metadata, LoginForm() (+15 more)

### Community 8 - "Configurazione TypeScript"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 9 - "Dipendenze e strumenti (2)"
Cohesion: 0.17
Nodes (10): zod, adminBookingSchema, categorySchema, day, dishSchema, FIELD_NAMES, hhmm, settingsSchema (+2 more)

### Community 10 - "Documentazione, design system e regole (2)"
Cohesion: 0.33
Nodes (3): Motion Reveal Animations (respects reduced motion), Prometeo Fine Dining Website, Stack: Next.js 16, React 19, Tailwind v4, Motion, Supabase, Vercel

## Knowledge Gaps
- **124 isolated node(s):** `BookingInput`, `BookingResult`, `Slot`, `Step`, `ServiceSlots` (+119 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 148 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Layout radice e configurazione` to `Prenotazione e validazione`, `Azioni server dell'admin`, `Navigazione admin e icone`, `Dipendenze e strumenti`, `Dati iniziali e notifiche`, `Accesso admin`?**
  _High betweenness centrality (0.312) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `BookingWizard()` (e.g. with `IconCalendar()` and `IconClock()`) actually correct?**
  _`BookingWizard()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `BookingInput`, `BookingResult`, `Slot` to the rest of the system?**
  _124 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Prenotazione e validazione` be split into smaller, more focused modules?**
  _Cohesion score 0.06971153846153846 - nodes in this community are weakly interconnected._
- **Why does `src/app/globals.css (@theme tokens)` connect `Layout radice e configurazione` to `Documentazione, design system e regole`?**
  _High betweenness centrality (0.185) - this node is a cross-community bridge._
- **Should `Azioni server dell'admin` be split into smaller, more focused modules?**
  _Cohesion score 0.10218253968253968 - nodes in this community are weakly interconnected._
- **Why does `Color Tokens (ink, ink-2, ink-3, cream, gold, gold-deep, paper, ember)` connect `Documentazione, design system e regole` to `Layout radice e configurazione`?**
  _High betweenness centrality (0.182) - this node is a cross-community bridge._