# Graph Report - PrometeoBook  (2026-10-13)

## Corpus Check
- 92 files · ~47,969 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 667 nodes · 1995 edges · 18 communities (15 shown, 3 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2bef977d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- time.ts
- gestore-prometeo-2026/actions.ts
- BookingWizard.tsx
- app/layout.tsx
- Icons.tsx
- package.json
- MenuView.tsx
- auth.ts
- compilerOptions
- index.ts
- Stack: Next.js 16, React 19, Tailwind v4, Motion, Supabase, Vercel
- postcss.config.mjs
- README - Prometeo Fine Dining sito web
- types.ts
- BookingsBoard.tsx
- pwa.tsx
- Design System MASTER.md (prometeo-fine-dining)

## God Nodes (most connected - your core abstractions)
1. `next` - 42 edges
2. `base()` - 34 edges
3. `formatDateLong()` - 28 edges
4. `react` - 25 edges
5. `BookingWizard()` - 25 edges
6. `telHref()` - 24 edges
7. `MenuEditor()` - 21 edges
8. `RequestCard()` - 21 edges
9. `serviceLabel()` - 21 edges
10. `isActive()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `Components (Button, Navbar, Mobile bar, Photos, Callout, Sheet)` --conceptually_related_to--> `4-Step Booking Flow (people, day, time, name/phone)`  [INFERRED]
  design-system/prometeo-fine-dining/MASTER.md → README.md
- `Lighthouse Mobile Results` --conceptually_related_to--> `Pre-delivery Checklist (viewports, touch targets, contrast, Lighthouse >= 90, no invented content)`  [INFERRED]
  README.md → design-system/prometeo-fine-dining/MASTER.md
- `Mobile First (320-430 px checked first)` --conceptually_related_to--> `Lighthouse Mobile Results`  [INFERRED]
  design-system/prometeo-fine-dining/MASTER.md → README.md
- `splashes()` --calls--> `splashFile()`  [EXTRACTED]
  scripts/make-app-assets.ts → src/lib/pwa.ts
- `createTemplates()` --calls--> `createRequest()`  [EXTRACTED]
  scripts/whatsapp.ts → src/lib/whatsapp/templates.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Booking Integrity: flow, server recheck, atomic SQL lock, anti-spam** — readme_booking_flow, readme_create_booking_function, readme_booking_anti_spam, readme_time_availability [EXTRACTED 1.00]
- **Artifacts kept aligned by the propagation rule** — claude_change_propagation_rule, claude_graphify_update_workflow, claude_data_model_chain, readme_design_system_master, readme_environment_variables, readme_content_sources [EXTRACTED 1.00]
- **Prometeo design system foundations** — design_system_prometeo_fine_dining_master_color_tokens, design_system_prometeo_fine_dining_master_typography, design_system_prometeo_fine_dining_master_spacing, design_system_prometeo_fine_dining_master_components, design_system_prometeo_fine_dining_master_motion_rules [EXTRACTED 1.00]
- **Table booking pipeline (UI flow, availability, atomic insert, notification, admin)** — readme_booking_flow, readme_admin_area [INFERRED 0.85]

## Communities (18 total, 3 thin omitted)

### Community 0 - "time.ts"
Cohesion: 0.08
Nodes (58): created, CustomersPage(), metadata, plural(), BookingsPage(), metadata, metadata, RequestsPage() (+50 more)

### Community 1 - "gestore-prometeo-2026/actions.ts"
Cohesion: 0.07
Nodes (61): qrcode, zod, ActionResult, cookieOpts, createBookingAction(), deleteCategoryAction(), deleteDishAction(), deviceSchema (+53 more)

### Community 2 - "BookingWizard.tsx"
Cohesion: 0.09
Nodes (54): react, Detail(), Availability, cancelMyBooking(), changeMyBooking(), getAvailability(), submitBooking(), BookingPage() (+46 more)

### Community 3 - "app/layout.tsx"
Cohesion: 0.05
Nodes (35): AGENTS.md, Data Model Propagation Chain (types -> schemas -> seed -> admin forms), Graphify Update Workflow, Pre-Delivery Checks (typecheck, lint, build, mobile 320-430px), Design System MASTER - Prometeo Fine Dining, Color Tokens (ink, ink-2, ink-3, cream, gold, gold-deep, paper, ember), Components (Button, Navbar, Mobile bar, Photos, Callout, Sheet), Motion Rules (fade+slide-up, stagger, reducedMotion user) (+27 more)

### Community 4 - "Icons.tsx"
Cohesion: 0.05
Nodes (74): nextConfig, motion, next, logoutAction(), removeDeviceAction(), updateDevicePrefsAction(), PanelLayout(), NotFound() (+66 more)

### Community 5 - "package.json"
Cohesion: 0.04
Nodes (46): eslintConfig, dependencies, motion, next, qrcode, react, react-dom, server-only (+38 more)

### Community 6 - "MenuView.tsx"
Cohesion: 0.15
Nodes (17): db, force, steps, DishSheet(), DishRow(), matches(), MenuView(), ALLERGENS (+9 more)

### Community 7 - "auth.ts"
Cohesion: 0.16
Nodes (21): @supabase/ssr, @supabase/supabase-js, loginAction(), LoginPage(), metadata, LoginForm(), Admin, getAdmin() (+13 more)

### Community 8 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 9 - "index.ts"
Cohesion: 0.07
Nodes (57): bad(), check(), [command = "check", arg], commands, createTemplates(), createWebhook(), die(), digits() (+49 more)

### Community 10 - "Stack: Next.js 16, React 19, Tailwind v4, Motion, Supabase, Vercel"
Cohesion: 0.33
Nodes (3): Motion Reveal Animations (respects reduced motion), Prometeo Fine Dining Website, Stack: Next.js 16, React 19, Tailwind v4, Motion, Supabase, Vercel

### Community 14 - "types.ts"
Cohesion: 0.09
Nodes (35): server-only, web-push, testPushAction(), metadata, NotificationsPage(), STATUS, announce(), BookingEvent (+27 more)

### Community 15 - "BookingsBoard.tsx"
Cohesion: 0.11
Nodes (34): acceptBookingAction(), answer(), AnswerResult, cancelBookingAction(), declineBookingAction(), deleteBookingAction(), DayChip, dayHref() (+26 more)

### Community 16 - "pwa.tsx"
Cohesion: 0.10
Nodes (30): icons(), OUT, png(), splashes(), AdminRootLayout(), metadata, viewport, detectPlatform() (+22 more)

### Community 17 - "Design System MASTER.md (prometeo-fine-dining)"
Cohesion: 0.67
Nodes (3): Design Direction (black, gold, Cinzel, Hanken Grotesk), Design System MASTER.md (prometeo-fine-dining), UI UX Pro Max Skill

## Knowledge Gaps
- **22 isolated node(s):** `react-dom`, `@tailwindcss/postcss`, `@types/node`, `@types/qrcode`, `@types/react` (+17 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 197 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Icons.tsx` to `time.ts`, `gestore-prometeo-2026/actions.ts`, `BookingWizard.tsx`, `app/layout.tsx`, `package.json`, `MenuView.tsx`, `auth.ts`, `types.ts`, `BookingsBoard.tsx`, `pwa.tsx`?**
  _High betweenness centrality (0.229) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `BookingWizard()` (e.g. with `IconCalendar()` and `IconClock()`) actually correct?**
  _`BookingWizard()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `react-dom`, `@tailwindcss/postcss`, `@types/node` to the rest of the system?**
  _22 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `time.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08294209702660407 - nodes in this community are weakly interconnected._
- **Should `gestore-prometeo-2026/actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07316118935837246 - nodes in this community are weakly interconnected._
- **Should `BookingWizard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09182692307692308 - nodes in this community are weakly interconnected._
- **Should `app/layout.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.047872340425531915 - nodes in this community are weakly interconnected._