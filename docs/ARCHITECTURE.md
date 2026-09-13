# Architecture

Find A Traveller is a **modular monolith**: one Next.js application, one Postgres database, organized into clear layers so business logic doesn't leak into React components.

```
UI (app/**, components/**)
  |
Server Actions (lib/actions/**)         <- authorization + input validation (Zod)
  |
Postgres RPC functions (supabase/migrations/*_functions.sql)  <- money math, state machine, capacity locks
  |
Supabase (PostgreSQL + Auth + Storage + Realtime)
```

## Why business logic lives in Postgres functions, not Server Actions

Capacity checks, fee calculation, and the booking state machine are implemented as `SECURITY DEFINER` SQL functions (`create_luggage_booking`, `accept_offer`, `verify_delivery_otp`, etc.), not in TypeScript. Two reasons:

1. **Concurrency.** `SELECT ... FOR UPDATE` inside a single Postgres function is the only way to guarantee two simultaneous bookings can't both succeed against the same remaining capacity. Doing a read-then-write in application code has a race window; a single locked transaction doesn't.
2. **Defense in depth.** Supabase's anon/authenticated keys let a client call `supabase.rpc(...)` directly, bypassing the Next.js server entirely. If the capacity check lived only in a Server Action, a forged direct RPC call could skip it. Because the check lives *in* the function that's exposed via RPC, there's no path around it.

Server Actions in `src/lib/actions/**` still exist and matter: they parse/validate `FormData` with Zod, translate Postgres error codes into user-facing messages (`lib/actions/errors.ts`), and call `revalidatePath`/`redirect`. They are the only place the app talks to Supabase from the client's perspective — but they are not the security boundary; the database is.

## Folder structure

```
src/
  app/                        Next.js App Router routes
    (marketing pages at the root: /, /about)
    available-space/          Luggage Sharing marketplace
    ship-requests/            Ship Requests marketplace + detail + offer
    travel-buddy/             Travel Buddy marketplace + detail
    traveller/[id]/           Traveller post detail + booking
    dashboard/                Authenticated app shell (posts, orders, offers, messages, notifications, profile)
    admin/                    Admin panel
    auth/callback/            Supabase email-link (PKCE) exchange
    api/webhooks/stripe/      Stripe webhook stub
  components/
    ui/                       shadcn/ui primitives (generated, do not hand-edit)
    layout/                   Navbar, Footer, mobile nav
    marketplace/              Cards, filter panels, sort/pagination controls
    booking/                  Booking form, offer negotiation, payment, pickup, delivery/OTP, timeline
    posts/                    Create-post forms (luggage, ship request, travel buddy)
    chat/, reviews/, notifications/, reports/, admin/, common/
  lib/
    supabase/                 client.ts (browser), server.ts (RSC/Server Actions), admin.ts (service role), middleware.ts
    actions/                  Server Actions, one file per domain
    queries/                  Read-only data fetching for Server Components
    validations/              Zod schemas
    types/database.ts         Hand-written types mirroring the SQL schema
    fees.ts, money.ts         Client-side display helpers (the DB is still authoritative)
    payments/                 Payment provider abstraction (test mode vs Stripe-ready)
supabase/migrations/          Numbered SQL migrations — schema, RLS, functions, seed categories
scripts/seed.mjs              Demo data seeding script (uses the service role key)
```

## Request flow example: booking a traveller's available space

1. `app/traveller/[id]/book/page.tsx` (Server Component) loads the post + categories, requires an authenticated profile.
2. `components/booking/booking-form.tsx` (Client Component) renders a native `<form action={formAction}>` bound to the `createLuggageBooking` Server Action via `useActionState`. A local fee estimate (`lib/fees.ts`) updates as the shopper types, purely for display.
3. `lib/actions/bookings.ts#createLuggageBooking` validates the FormData with Zod, then calls `supabase.rpc('create_luggage_booking', {...})` using the **user's own session** (RLS-scoped, not the service role).
4. The Postgres function locks the `traveller_posts` row, re-validates capacity and expiry, decrements `remaining_capacity_kg`, computes fees via `calculate_fees()`, inserts the `bookings` row, an initial `offers` row (the shopper's implicit request), a `conversations` row, and a notification — all in one transaction.
5. On success the Server Action redirects to `/dashboard/orders/[id]`; on failure the Postgres error code is mapped to a plain-language message by `lib/actions/errors.ts`.

Every other state transition (accept/reject/counter an offer, pay, confirm pickup, start transit, send/verify delivery OTP, leave a review) follows the same shape: Server Action validates and calls one Postgres function that does the real work atomically.

## Authentication

Supabase Auth (email/password) with SSR cookie-based sessions via `@supabase/ssr`. `src/middleware.ts` refreshes the session on every request and redirects unauthenticated requests to `/dashboard/**` or `/admin/**` to `/login`. `src/app/auth/callback/route.ts` exchanges the PKCE `code` from signup-confirmation and password-reset emails for a session server-side.

Google/Apple OAuth are **not wired up** (no credentials available in this environment) but the integration point is documented in `src/lib/actions/auth.ts` and `.env.example` — enabling a provider in the Supabase Auth dashboard and adding a `supabase.auth.signInWithOAuth({ provider: 'google' })` call to the login form is the only remaining step.

## Payments

`src/lib/payments/index.ts` selects between a `TestPaymentProvider` (default) and a `StripePaymentProvider` (activates automatically once `STRIPE_SECRET_KEY` is set). The test flow simulates a successful charge and is labeled "Test Mode" everywhere it appears in the UI — it never claims to be a real payment. See [MVP-SCOPE.md](MVP-SCOPE.md) for exactly what would need to change to go live with Stripe.

## Realtime

Chat messages and the notification bell subscribe to `postgres_changes` on the `messages` and `notifications` tables via `@supabase/supabase-js`'s browser client, scoped by RLS to rows the signed-in user can already see.
