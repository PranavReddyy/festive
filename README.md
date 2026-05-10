# Festive

> A quieter way to find live events.

Festive is an end-to-end events marketplace for small and mid-sized organisers in India — built for festivals, concerts, conferences, workshops, listening rooms, exhibitions, talks, and meetups. It pairs an editorial, awwwards-leaning attendee experience with a serious organiser back office: tiered ticketing, QR-coded admissions, an in-app door scanner, and a deep analytics dashboard.

This repository is the production-grade web application — Next.js 16, React 19, Tailwind v4, and Supabase Postgres with row-level security.

---

## Table of contents

1. [What Festive is](#what-festive-is)
2. [Feature tour](#feature-tour)
3. [Architecture](#architecture)
4. [Tech stack](#tech-stack)
5. [Design system](#design-system)
6. [Getting started](#getting-started)
7. [Project structure](#project-structure)
8. [Data model & security](#data-model--security)
9. [API surface](#api-surface)
10. [Notes on Next.js 16](#notes-on-nextjs-16)
11. [Team](#team)
12. [Roadmap](#roadmap)

---

## What Festive is

Most ticketing platforms are loud — surge pricing, bidding wars, infinite ad-stuffed feeds, and dashboards that bury the data their hosts actually need. Festive is the deliberate opposite:

- **Editorial, not algorithmic.** Events are listed by their organisers, ranked by date and curation, never by paid placement.
- **Plain pricing.** Listing is free; a flat 2% capped fee per ticket. No checkout surcharges. No "convenience" line items.
- **Honest stock.** Capacities, sold-outs, and low-stock signals are computed live from the database — what you see is what's actually left.
- **Privacy-respecting.** No data resale, no weekly digests, no cross-platform pixels.
- **Built for the door.** Scanning a ticket should feel like tearing a stub: fast, offline-tolerant, and unmistakable.

The product is opinionated about its visual identity too — Instrument Serif on warm paper, hairline rules, ink-on-paper buttons, retro-stub tickets — so the platform feels closer to a printed programme than a SaaS dashboard.

---

## Feature tour

### For attendees

- **Browse** — Editorial grid of upcoming events, sortable by date, filterable by category, city, price band, and availability.
- **Search & filter sidebar** — Live-bound filters for category, date range (today / this week / this month / all), price slider in ₹, city free-text, and an "only available" toggle.
- **Save events** — Bookmark events to revisit. Persists per browser via Zustand + localStorage.
- **Event detail** — Editorial header (title first, meta strip after), drop-cap description, sticky tier selector with live capacity, and a "you already have a ticket" state.
- **Tiered tickets** — Multiple price tiers per event, each with its own capacity, description, and progress bar. Sold-out tiers are visibly marked.
- **Reservation flow** — Sign in (or sign up), confirm tier, get a unique QR ticket issued instantly.
- **My tickets** — Retro-stub style ticket cards with serial number, holder, tier, price, perforated stub, and an expandable QR drawer. Cancelled or refunded tickets show a stamped "Void" overlay.
- **Offline-friendly QR** — QR codes are generated client-side from a signed token and can be displayed without a live network connection.

### For organisers

- **Role-aware onboarding** — Sign up as `attendee` or `organiser`. Organiser accounts unlock the dashboard, scanner, and event creation flow.
- **Event composer** — One screen for all event metadata (title, slug, category, banner URL, venue, address, city, date, capacity caps, status) plus an inline ticket-tier editor that supports add / remove / reorder.
- **Draft + publish workflow** — Save events as drafts; publish only when listings are ready. Cancel and complete states change card visibility.
- **Live capacity view** — `events_with_availability` Postgres view aggregates tier capacities and sold counts on every read.
- **Door scanner** — Camera-based QR scanner (`html5-qrcode`) plus manual token entry, both validated against a server endpoint that flips ticket status to `used` and records `checked_in_at`.
- **Per-event scanner picker** — Pick which event you're working the door for; the scanner only validates tickets for that event.

### Organiser analytics dashboard

The dashboard is intentionally dense:

**Headline KPIs** — Lifetime revenue (with 7-day trend vs previous 7-day delta), total tickets sold, sell-through % across all events, average ticket price.

**Operations KPIs** — Total events (live vs draft split), upcoming events with the next date, check-in rate, refund rate (with returned amount).

**Revenue chart** — 30-day daily revenue area chart, plus headline "last 7 days" total.

**Top performing events** — Top 5 events by revenue, with sold count and capacity utilisation %.

**Tier breakdown** — Top 5 tiers across all events with revenue, sold count, and a hairline progress bar showing share of total tickets.

**Recent sales** — Last 5 ticket sales with tier, event, timestamp, and price paid.

**Events table** — Every event you've ever made, with status badge, date, sold/capacity, and a one-click link into the per-event control room.

### Per-event control room

Every event you own opens into its own dedicated dashboard at `/dashboard/events/{id}`:

- **Live numbers strip** — Tickets sold against capacity, gross revenue (with refund deductions noted), sell-through %, and average ticket price for this event alone.
- **Door strip** — Inside (checked-in count), pending entry (live tickets not yet scanned), entries in the last hour as a live activity proxy, and total restricted/refunded count plus check-in rate.
- **Tier breakdown** — Every tier on the event with sold-vs-capacity hairline bar and per-tier revenue.
- **Live participant search** — Type-as-you-go filter across attendee name, email, ticket number, and tier name. Combined with status pills (All / Live / Inside / Pending / Restricted) so you can find anyone in seconds at the door.
- **Per-attendee actions** — Restrict any specific attendee with one click — instantly flips their ticket to `cancelled`, which the door scanner refuses on the next scan. Restore brings them back. Every action is RLS-checked organiser-side via `PATCH /api/tickets/{id}`.
- **Status pills + relative timestamps** — Each row shows ticket number, tier, price, "purchased X ago" and (when applicable) "entered X ago", so you always know who's in the room.

### Across the platform

- **Auth flow** — Email/password via Supabase Auth, with role-aware routing in the proxy and a Postgres trigger that auto-creates a `profiles` row on signup.
- **Protected routes** — `app/(protected)/*` is gated server-side via Supabase RSC client; unauthenticated users are redirected to `/login?redirect=…`.
- **Toasts** — `sonner` toaster wired to a light theme.
- **Loading + error states** — Every async surface has a `Skeleton`, an `EmptyState`, and a real error fallback.

---

## Architecture

```
                              ┌─────────────────────────────┐
                              │         Browser             │
                              │  React 19 · Tailwind v4     │
                              └──────┬──────────────────┬───┘
                                     │ RSC stream       │ Client fetch (TanStack Query)
                              ┌──────▼──────┐    ┌──────▼──────┐
                              │  Next 16    │    │  /api/*     │
                              │  App Router │    │  Route      │
                              │  (RSC)      │    │  handlers   │
                              └──────┬──────┘    └──────┬──────┘
                                     │                   │
                                     │   Supabase JS     │
                                     ▼                   ▼
                              ┌────────────────────────────────┐
                              │  Supabase (Postgres + Auth)    │
                              │  RLS · views · triggers        │
                              └────────────────────────────────┘
```

- **Server Components** read directly from Supabase using the RSC client (`createSupabaseRSCClient`) — no extra API hop for first paint.
- **Client mutations** (booking a ticket, validating a QR, saving an event) go through `/api/*` route handlers that re-establish the user session from cookies.
- **`proxy.ts`** (Next 16's renamed middleware) refreshes Supabase auth cookies on every request and gates the protected route group.

---

## Tech stack

| Layer        | Choice                                                            |
| ------------ | ----------------------------------------------------------------- |
| Framework    | **Next.js 16** (App Router, RSC, Turbopack, `proxy.ts`)           |
| UI runtime   | **React 19** with the React Compiler enabled                      |
| Styling      | **Tailwind CSS v4** (`@theme inline`, oklch tokens, light only)   |
| Primitives   | Radix UI (Dialog, Dropdown, Select, Tabs, Slider, Switch, Avatar) |
| Forms        | React Hook Form + Zod resolvers                                   |
| Server state | TanStack Query                                                    |
| Client state | Zustand (auth, filter, saved-events stores)                       |
| Backend      | Supabase Postgres + Auth + RLS policies                           |
| Charts       | Recharts                                                          |
| QR           | `qrcode` (generation), `html5-qrcode` (scanning)                  |
| Toasts       | `sonner`                                                          |
| Icons        | `lucide-react` (used sparingly, no decorative glyphs)             |
| Type system  | TypeScript 5.x, strict                                            |

---

## Design system

Festive ships a single, deliberately small token set:

- **Background** — `oklch(0.985 0.004 80)` (warm paper)
- **Foreground / ink** — `oklch(0.18 0.012 50)`
- **Accent** — `oklch(0.55 0.16 38)` (terracotta, used only for low-stock signals)
- **Border** — `oklch(0.9 0.006 80)` (hairline)
- **Radius** — `0.5rem` everywhere
- **Display** — Instrument Serif (with italic for emphasis)
- **Body** — Inter
- **Mono** — system mono stack

Vocabulary used everywhere:

- Eyebrow: `text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground`
- Display: `font-display`, italic for emphasised words
- Hairline metric strips: `<dl>` rows separated by `border-r border-border`
- Active state: `border-foreground bg-foreground text-background`

The palette is light-only by design. There is no dark mode and no decorative gradient anywhere in the codebase.

---

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure Supabase

```bash
cp .env.local.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run the schema migration

In the Supabase SQL editor, run `supabase/migrations/001_initial_schema.sql`. This creates:

- `profiles`, `events`, `ticket_tiers`, `tickets`, `saved_events` tables
- `event_category`, `event_status`, `ticket_status`, `user_role` enums
- `events_with_availability` view (joins capacities + sold counts)
- `handle_new_user` trigger that auto-creates a `profiles` row on signup
- Row-level security policies for every table

Optionally run `supabase/seed.sql` for three demo users (one organiser, two attendees), five events across categories, nine tiers, and four sample tickets.

### 4. Dev server

```bash
npm run dev
```

Open <http://localhost:3000>.

### 5. Become an organiser

New users register as `attendee` by default. Switch role on the register page, or in SQL:

```sql
update public.profiles set role = 'organiser', organiser_name = 'Your Org'
where email = 'you@example.com';
```

---

## Scripts

| Command         | Purpose                |
| --------------- | ---------------------- |
| `npm run dev`   | Dev server (Turbopack) |
| `npm run build` | Production build       |
| `npm run start` | Run production server  |
| `npm run lint`  | ESLint                 |

---

## Project structure

```
app/
  (auth)/                login + register, editorial split layout
    login/
    register/
  (public)/              navbar + footer chrome
    page.tsx             home (hero + marquee + grid)
    how-it-works/        the manual
    events/[id]/         event detail
  (protected)/           gated by proxy + RSC auth check
    dashboard/
      page.tsx           organiser analytics (cross-event)
      events/
        new/             create flow
        [id]/page.tsx    per-event control room (KPIs, search, restrict)
        [id]/edit/       edit flow
        [id]/attendees/  legacy redirect → control room
      scanner/           QR scanner picker + scanner
    my-tickets/          attendee ticket wallet
  api/
    auth/callback/       Supabase OAuth callback handler
    events/              GET list, POST create
    events/[id]/         GET single, PATCH, DELETE
    events/[id]/tickets/ list tickets for an event (organiser only)
    tickets/[id]/        GET single ticket · PATCH restrict/restore
    tickets/my/          GET tickets for current user
    tickets/purchase/    POST a reservation against a tier
    tickets/validate/    POST scan + flip status to used
  layout.tsx             root layout, fonts, theme provider
  globals.css            tokens + utilities
  loading.tsx · error.tsx · not-found.tsx

components/
  ui/                    shadcn-style Radix primitives (cva variants)
  common/                Navbar, Footer, Wordmark, providers
  events/                EventCard, EventList, EventFilterSidebar,
                         EventForm, TicketTierSelector
  tickets/               TicketCard (retro stub), QRDisplay, QRScanner
  dashboard/             StatsCard, RevenueChart, EventsTable,
                         AttendeeTable, EventControlRoom

hooks/
  useAuth, useEvents, useTickets, useSavedEvents

lib/
  supabase/              browser + server + RSC clients
  validations/           Zod schemas (event, register, login, tier)
  utils/                 currency, date, qr, slug, cn

store/
  authStore, filterStore (Zustand)

proxy.ts                 Next 16 proxy: refreshes auth, gates routes

supabase/
  migrations/001_initial_schema.sql
  seed.sql

types/                   shared TS types (Event, Ticket, TicketTier, …)
```

---

## Data model & security

### Tables

- **`profiles`** — extends `auth.users` with `full_name`, `avatar_url`, `role` (`attendee` | `organiser` | `admin`), `organiser_name`, timestamps.
- **`events`** — title, slug, description, banner_url, category, status, venue, address, city, event_date, organiser_id, timestamps.
- **`ticket_tiers`** — event_id, name, description, price (₹, integer), capacity, sort_order.
- **`tickets`** — id, ticket_number, qr_token, event_id, tier_id, tier_name, user_id, attendee_name, attendee_email, price_paid, status, purchased_at, checked_in_at.
- **`saved_events`** — user_id ↔ event_id.

### Views

- **`events_with_availability`** — base events table joined with aggregate capacity and sold counts per event.

### Policies

- Public can read **published** events and tier metadata.
- Organisers can write only events whose `organiser_id = auth.uid()`.
- Tickets are readable by their owning user _or_ the organiser of the related event.
- Ticket validation (`status = 'used'`) is restricted to the organiser of the ticket's event.

### Triggers

- `handle_new_user` — fires on `auth.users` insert; creates a matching `profiles` row, defaulting to `attendee`.

---

## API surface

| Method | Path                      | Purpose                                     | Auth         |
| ------ | ------------------------- | ------------------------------------------- | ------------ |
| GET    | `/api/events`             | Paginated event list with filters           | public       |
| POST   | `/api/events`             | Create event + tiers                        | organiser    |
| GET    | `/api/events/:id`         | Event detail with tiers                     | public       |
| PATCH  | `/api/events/:id`         | Update event + tiers                        | owner        |
| DELETE | `/api/events/:id`         | Cancel event                                | owner        |
| GET    | `/api/events/:id/tickets` | Attendee roster                             | owner        |
| GET    | `/api/tickets/my`         | Current user's tickets                      | user         |
| GET    | `/api/tickets/:id`        | Single ticket                               | owner / user |
| PATCH  | `/api/tickets/:id`        | Restrict / restore a ticket                 | organiser    |
| POST   | `/api/tickets/purchase`   | Reserve a seat in a tier                    | user         |
| POST   | `/api/tickets/validate`   | Mark a ticket `used` at the door            | organiser    |
| GET    | `/api/auth/callback`      | Supabase Auth callback (OAuth + magic link) | public       |

---

## Notes on Next.js 16

This project relies on Next 16-specific APIs:

- `proxy.ts` (renamed from `middleware.ts`), function name `proxy`
- `await cookies()` and `await headers()`
- `params` / `searchParams` are `Promise<…>` in pages and route handlers
- Turbopack-only dev/build pipeline
- React 19 with the React Compiler. A few `react-hook-form` `watch()` call sites surface compiler warnings — these are documented and expected.

Refer to `AGENTS.md` for any additional contribution rules.

---

## Team

Festive is built by a team of five. Each person owns a slice of the platform end to end.

| Member        | Role                          | What they shipped                                                                                                                                                 |
| ------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pranav**    | Lead engineer & design system | App Router architecture, design tokens, typography pass, Wordmark, hero / how-it-works / event-detail editorial pages, the retro-stub TicketCard.                 |
| **Ankit**     | Backend & data                | Supabase schema, RLS policies, `handle_new_user` trigger, `events_with_availability` view, seed data, all `/api/*` route handlers, ticket validation logic.       |
| **Manjari**   | Organiser tools & analytics   | Cross-event analytics dashboard, the per-event control room (live KPIs, participant search, restrict/restore, tier breakdown), EventsTable, EventForm composer.   |
| **Sudeekha**  | Tickets & door experience     | QRDisplay generation, html5-qrcode scanner integration, manual entry path, scanner picker page, my-tickets wallet wiring.                                         |
| **Kushpreet** | Discovery & filtering         | EventList with infinite query, EventFilterSidebar (category, date range, price slider, city, availability), saved-events store, EmptyState states across the app. |
