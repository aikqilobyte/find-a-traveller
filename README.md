# Find A Traveller

A peer-to-peer marketplace that connects **shoppers** who need to send or obtain items with **travellers** who have unused luggage capacity. One account, three services: **Luggage Sharing**, **Ship Requests**, and **Travel Buddy**.

## Product overview

- **Luggage Sharing** — travellers publish available luggage space (route, dates, capacity, price per kg); shoppers search and book it.
- **Ship Requests** — shoppers post items they need transported; travellers browse and make offers.
- **Travel Buddy** — users post upcoming trips and connect with others travelling the same route/dates.

Every booking (from either Luggage Sharing or a Ship Request) flows through one unified state machine: request → offer negotiation → payment → pickup → in transit → delivery + OTP → completed → reviews.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions, Server Components) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui (Radix primitives) |
| Icons | lucide-react |
| Database / Auth / Storage / Realtime | Supabase (PostgreSQL, Supabase Auth, Supabase Storage, Supabase Realtime) |
| Validation | Zod |
| Payments | Stripe-ready abstraction, defaults to a labeled dev/test flow (no Stripe keys required) |

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full layering, [docs/DATABASE.md](docs/DATABASE.md) for the schema, and [docs/BUSINESS-FLOWS.md](docs/BUSINESS-FLOWS.md) for the end-to-end user journeys.

## Local setup

### 1. Prerequisites

- Node.js 20+ and npm
- A free [Supabase](https://supabase.com) project (Project URL, anon key, service role key)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from your Supabase project's **Settings → API** page. Leave the Stripe variables blank to use the built-in test payment flow.

### 4. Run the database migrations

Open your Supabase project's **SQL Editor** and run the files in `supabase/migrations/` **in order** (they're numbered). Alternatively, if you have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed and linked to your project:

```bash
supabase db push
```

This creates every table, enum, index, RLS policy, and the SECURITY DEFINER functions that enforce capacity limits, the booking state machine, and OTP verification server-side (see [docs/DATABASE.md](docs/DATABASE.md)).

### 5. Seed demo data (optional but recommended)

```bash
npm run seed
```

Creates demo accounts, sample listings across several routes, a completed order with reviews, and prints the demo credentials (see [Demo accounts](#demo-accounts) below).

### 6. Run the app

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Demo accounts

All demo accounts use the password `Demo1234!`.

| Email | Role |
|---|---|
| `ahmed.traveller@findatraveller.demo` | Traveller (Dhaka ⇄ Dubai) |
| `fatima.shopper@findatraveller.demo` | Shopper |
| `karim.dual@findatraveller.demo` | Both traveller and shopper |
| `nusrat.traveller@findatraveller.demo` | Traveller (London ⇄ Dhaka) |
| `admin@findatraveller.demo` | Admin (`/admin`) |

## Testing

```bash
npm run typecheck   # TypeScript
npm run lint        # ESLint
npm run test        # Vitest — unit tests for fee math, status maps, error mapping
npm run build       # Production build
```

Capacity locking, the booking state machine, and OTP verification are enforced in Postgres (`supabase/migrations/20260101000002_functions.sql`) using row locks and `SECURITY DEFINER` functions, not in application code — see [docs/DATABASE.md](docs/DATABASE.md#concurrency--capacity-locking) for how that's tested and verified.

## Build & deploy

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deploying to Vercel and wiring up a production Supabase project and (optionally) Stripe.

## Known limitations

See [docs/MVP-SCOPE.md](docs/MVP-SCOPE.md) for what's fully wired, what's a documented dev/test stand-in (payments, delivery OTP delivery), and what's explicitly out of scope for this MVP (Google/Apple OAuth wiring, full KYC, GPS tracking).
