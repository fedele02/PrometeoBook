# Graph Report - PrometeoBook  (2026-10-15)

## Corpus Check
- 98 files · ~52,652 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 781 nodes · 2200 edges · 43 communities (36 shown, 7 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 74 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `228c298b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- BookingsBoard.tsx
- next
- gestore-prometeo-2026/actions.ts
- BookingWizard.tsx
- Icons.tsx
- pwa.ts
- types.ts
- auth.ts
- whatsapp.ts
- index.ts
- Config TypeScript
- Schema database
- Icona app Gestione
- MyBookings.tsx
- Rule: Every Change Propagates
- README Prometeo Fine Dining
- package.json
- messages.ts
- templates.ts
- Staff app design (ibrido A+B Penpot)
- Environment Variables (Supabase, Site URL, Resend)
- Componenti (button, navbar, mobile bar, photos, callout, sheet)
- dependencies
- devDependencies
- customers.ts
- scripts
- Prenotazione in 4 tocchi
- privacy/page.tsx
- MenuEditor.tsx
- 2026-10-13_app-gestione.sql
- public.whatsapp_messages
- eslint.config.mjs
- Stack: Next.js 16, React 19, Tailwind v4, Motion, Supabase, Vercel
- 2026-10-15_privacy.sql
- Design System MASTER.md (prometeo-fine-dining)
- Mobile First (verified 320-430px and up)
- vercel.json
- postcss.config.mjs
- Motion Rules (fade+slide-up, stagger, reducedMotion user)
- time.ts
- prenota/actions.ts
- board.ts

## God Nodes (most connected - your core abstractions)
1. `next` - 44 edges
2. `base()` - 34 edges
3. `formatDateLong()` - 28 edges
4. `react` - 27 edges
5. `BookingWizard()` - 26 edges
6. `telHref()` - 24 edges
7. `MenuEditor()` - 21 edges
8. `RequestCard()` - 21 edges
9. `isActive()` - 21 edges
10. `serviceLabel()` - 21 edges

## Surprising Connections (you probably didn't know these)
- `createTemplates()` --calls--> `createRequest()`  [EXTRACTED]
  scripts/whatsapp.ts → src/lib/whatsapp/templates.ts
- `test()` --calls--> `sendComponents()`  [EXTRACTED]
  scripts/whatsapp.ts → src/lib/whatsapp/templates.ts
- `test()` --calls--> `toE164()`  [EXTRACTED]
  scripts/whatsapp.ts → src/lib/whatsapp/ycloud.ts
- `Rule: Every Change Propagates` --references--> `Color tokens (ink, cream, gold, paper, ember, ok, chat)`  [EXTRACTED]
  CLAUDE.md → design-system/prometeo-fine-dining/MASTER.md
- `README Prometeo Fine Dining` --references--> `Horizontal Scroll Journey`  [EXTRACTED]
  README.md → design-system/prometeo-fine-dining/MASTER.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **App icon composition: logo mark + wordmark + palette** — design_app_icon_icon_1024_hand_flame_logo, design_app_icon_icon_1024_gestione_wordmark, design_app_icon_icon_1024_gold_on_black_palette [EXTRACTED 1.00]
- **Gestione brand lockup composition** — design_app_icon_lockup_1024_hand_flame_mark, design_app_icon_lockup_1024_gestione_wordmark, design_app_icon_lockup_1024_gold_brand_color [EXTRACTED 1.00]
- **Ciclo di vita della richiesta di prenotazione** — readme_booking_flow, readme_create_booking_sql, readme_anti_spam_rules, readme_customer_booking_page, readme_accept_reject_flow [INFERRED 0.85]
- **Misure privacy e conformità GDPR** — readme_no_cookie_banner, readme_special_requests_consent, readme_purge_old_data, readme_customer_data_deletion, readme_security_headers, design_system_prometeo_fine_dining_master_static_map, design_system_prometeo_fine_dining_master_consent_checkbox [INFERRED 0.85]
- **Flusso messaggi WhatsApp automatici** — readme_whatsapp_ycloud, readme_whatsapp_templates, readme_ycloud_webhook, readme_whatsapp_manual_fallback, readme_accept_reject_flow, design_system_prometeo_fine_dining_master_whatsapp_status_ui [INFERRED 0.85]

## Communities (43 total, 7 thin omitted)

### Community 0 - "BookingsBoard.tsx"
Cohesion: 0.16
Nodes (30): AnswerResult, deleteBookingAction(), created, CustomersPage(), Detail(), metadata, plural(), BookingsBoard() (+22 more)

### Community 1 - "next"
Cohesion: 0.06
Nodes (50): csp, nextConfig, securityHeaders, motion, next, cinzel, cormorant, hanken (+42 more)

### Community 2 - "gestore-prometeo-2026/actions.ts"
Cohesion: 0.07
Nodes (53): zod, acceptBookingAction(), ActionResult, answer(), cancelBookingAction(), cookieOpts, createBookingAction(), declineBookingAction() (+45 more)

### Community 3 - "BookingWizard.tsx"
Cohesion: 0.20
Nodes (26): Availability, cancelMyBooking(), getAvailability(), BookingWizard(), Done(), savedGuest(), shortDate(), Step (+18 more)

### Community 4 - "Icons.tsx"
Cohesion: 0.08
Nodes (56): logoutAction(), registerDeviceAction(), removeDeviceAction(), PanelLayout(), AdminNav(), Count(), ITEMS, InstallBanner() (+48 more)

### Community 5 - "pwa.ts"
Cohesion: 0.11
Nodes (21): icons(), OUT, png(), splashes(), pin, tiles, x0, x1 (+13 more)

### Community 6 - "types.ts"
Cohesion: 0.10
Nodes (27): db, force, steps, DishSheet(), DishRow(), matches(), MenuView(), ALLERGENS (+19 more)

### Community 7 - "auth.ts"
Cohesion: 0.17
Nodes (22): server-only, @supabase/ssr, @supabase/supabase-js, loginAction(), LoginPage(), metadata, LoginForm(), Admin (+14 more)

### Community 8 - "whatsapp.ts"
Cohesion: 0.20
Nodes (20): bad(), check(), [command = "check", arg], commands, createTemplates(), createWebhook(), die(), digits() (+12 more)

### Community 9 - "index.ts"
Cohesion: 0.14
Nodes (23): POST(), metadata, SettingsPage(), advances(), alertStaff(), explain(), handleWebhookEvent(), isWebhookConfigured() (+15 more)

### Community 10 - "Config TypeScript"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 11 - "Schema database"
Cohesion: 0.17
Nodes (12): bookings_date_idx, bookings_phone_idx, dishes_category_idx, public.admins, public.bookings, public.categories, public.dishes, public.push_devices (+4 more)

### Community 12 - "Icona app Gestione"
Cohesion: 0.16
Nodes (16): Prometeo Gestione App Icon (1024px), GESTIONE Serif Wordmark, Gold on Black Brand Palette, Hand and Flame Logo Mark, Prometeo Fine Dining Brand, Prometeo Gestione Staff Web App, GESTIONE Wordmark, Gold on Near-Black Palette (+8 more)

### Community 13 - "MyBookings.tsx"
Cohesion: 0.33
Nodes (10): MyBookings(), onStorage(), forgetBooking(), read(), rememberBooking(), RememberedBooking, rememberedBookings(), storedBookings() (+2 more)

### Community 14 - "Rule: Every Change Propagates"
Cohesion: 0.23
Nodes (6): AGENTS.md, Data model chain (types.ts -> schemas.ts -> seed.ts -> admin forms), Graphify Update Workflow, graphify knowledge graph workflow, Pre-Delivery Checks (typecheck, lint, build, mobile 320-430px), Mappa del codice (graphify)

### Community 15 - "README Prometeo Fine Dining"
Cohesion: 0.20
Nodes (13): Design System MASTER Prometeo Fine Dining, Color tokens (ink, cream, gold, paper, ember, ok, chat), Token in src/app/globals.css (@theme), Horizontal Scroll Journey, Motion: fade + slide-up, reduced motion, Pre-delivery checklist, Griglia 8 px e spaziature, Tipografia Cinzel / Cormorant / Hanken Grotesk (+5 more)

### Community 16 - "package.json"
Cohesion: 0.14
Nodes (13): name, private, version, react-dom, tailwindcss, @tailwindcss/postcss, @types/node, @types/qrcode (+5 more)

### Community 17 - "messages.ts"
Cohesion: 0.19
Nodes (12): address(), customStart(), DECLINE_REASONS, DeclineReason, firstName(), guests(), MessageBooking, templateValues() (+4 more)

### Community 18 - "templates.ts"
Cohesion: 0.21
Nodes (13): WhatsappKind, buttonUrl(), cleanParam(), createRequest(), fill(), renderMessage(), SAMPLE, sendComponents() (+5 more)

### Community 19 - "Staff app design (ibrido A+B Penpot)"
Cohesion: 0.21
Nodes (12): App icon Gestione, Notifiche (titolo Evento · Nome), Request card (Accetta / Rifiuta), Staff app design (ibrido A+B Penpot), Timeline In sala, UI WhatsApp automatico e stati messaggi, Accetta / Rifiuta richieste, App Prometeo Gestione (+4 more)

### Community 20 - "Environment Variables (Supabase, Site URL, Resend)"
Cohesion: 0.23
Nodes (11): Admin Area (Prenotazioni, Menu, Locale e orari), To Complete With Client (hours, prices, allergens, privacy, photo rights), Repository dati supabase/local, Notifica email prenotazioni (Resend), Environment Variables (Supabase, Site URL, Resend), Menu al tavolo (QR), Resend Booking Email Notification, Migrazioni Supabase (app-gestione, whatsapp, privacy) (+3 more)

### Community 21 - "Componenti (button, navbar, mobile bar, photos, callout, sheet)"
Cohesion: 0.18
Nodes (10): Componenti (button, navbar, mobile bar, photos, callout, sheet), Consent checkbox, Legal line (footer e menu QR), Mappa statica (mappa-1600.webp), Da completare con il cliente, Dati aziendali nel footer, Header di sicurezza e CSP, Consenso per richieste particolari (art. 9) (+2 more)

### Community 22 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, motion, next, qrcode, react, react-dom, server-only, @supabase/ssr (+3 more)

### Community 23 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/qrcode, @types/react (+3 more)

### Community 24 - "customers.ts"
Cohesion: 0.18
Nodes (22): deleteCustomerAction(), BookingsPage(), metadata, metadata, RequestsPage(), DayChip, Row, Request (+14 more)

### Community 25 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, assets:app, assets:map, build, dev, lint, seed:supabase, start (+2 more)

### Community 26 - "Prenotazione in 4 tocchi"
Cohesion: 0.22
Nodes (10): Regole anti-spam per telefono e IP, Booking Anti-Spam (honeypot + 4/day per phone), Prenotazione in 4 tocchi, create_booking SQL Function (atomic slot lock), Funzione SQL create_booking, Pagina privata del cliente /prenotazione/<token>, Elimina i dati del cliente, Informativa privacy e tempi di conservazione (+2 more)

### Community 27 - "privacy/page.tsx"
Cohesion: 0.39
Nodes (6): metadata, PrivacyPage(), ClearDeviceData(), DEVICE_KEYS, PRIVACY_UPDATED, RETENTION

### Community 28 - "MenuEditor.tsx"
Cohesion: 0.14
Nodes (33): qrcode, react, uploadImageAction(), NotFound(), AdminMenuPage(), metadata, DeleteCustomer(), ImagePicker() (+25 more)

### Community 30 - "public.whatsapp_messages"
Cohesion: 0.60
Nodes (3): public.whatsapp_messages, whatsapp_messages_booking_idx, whatsapp_messages_provider_idx

### Community 31 - "eslint.config.mjs"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 32 - "Stack: Next.js 16, React 19, Tailwind v4, Motion, Supabase, Vercel"
Cohesion: 0.50
Nodes (3): Motion Reveal Animations (respects reduced motion), Prometeo Fine Dining Website, Stack: Next.js 16, React 19, Tailwind v4, Motion, Supabase, Vercel

### Community 34 - "Design System MASTER.md (prometeo-fine-dining)"
Cohesion: 0.67
Nodes (3): Design Direction (black, gold, Cinzel, Hanken Grotesk), Design System MASTER.md (prometeo-fine-dining), UI UX Pro Max Skill

### Community 40 - "time.ts"
Cohesion: 0.16
Nodes (19): Calendar(), monthStart(), shiftMonth(), WD, WD_FULL, addDays(), asDate(), dayState (+11 more)

### Community 41 - "prenota/actions.ts"
Cohesion: 0.13
Nodes (15): BookingInput, BookingResult, bookingSchema, changeMyBooking(), changeSchema, checkSlot(), connectionKey(), GuestResult (+7 more)

### Community 42 - "board.ts"
Cohesion: 0.47
Nodes (9): DayService, dayServices(), dayStatusLine(), defaultService(), ServiceName, fromMin(), serviceLabel(), slotsForDate() (+1 more)

## Knowledge Gaps
- **33 isolated node(s):** `react-dom`, `@tailwindcss/postcss`, `@types/node`, `@types/qrcode`, `@types/react` (+28 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 227 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `BookingsBoard.tsx`, `gestore-prometeo-2026/actions.ts`, `BookingWizard.tsx`, `Icons.tsx`, `pwa.ts`, `types.ts`, `auth.ts`, `prenota/actions.ts`, `MyBookings.tsx`, `package.json`, `customers.ts`, `privacy/page.tsx`, `MenuEditor.tsx`?**
  _High betweenness centrality (0.237) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `BookingWizard()` (e.g. with `IconCalendar()` and `IconClock()`) actually correct?**
  _`BookingWizard()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `react-dom`, `@tailwindcss/postcss`, `@types/node` to the rest of the system?**
  _33 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.06350877192982456 - nodes in this community are weakly interconnected._
- **Why does `src/app/globals.css (@theme tokens)` connect `README Prometeo Fine Dining` to `next`?**
  _High betweenness centrality (0.162) - this node is a cross-community bridge._
- **Should `gestore-prometeo-2026/actions.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06927551560021153 - nodes in this community are weakly interconnected._
- **Why does `Color tokens (ink, cream, gold, paper, ember, ok, chat)` connect `README Prometeo Fine Dining` to `Staff app design (ibrido A+B Penpot)`, `Rule: Every Change Propagates`?**
  _High betweenness centrality (0.162) - this node is a cross-community bridge._