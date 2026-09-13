# MVP scope

This is **one** integrated MVP — there is no MVP-1/2/3 split. This document is the honest accounting of what's fully wired to a real database versus what's a documented, labeled stand-in, and what's explicitly out of scope.

## Fully implemented, real, database-backed

- Email/password auth (sign up, sign in, sign out, forgot/reset password) via Supabase Auth, with SSR sessions and protected `/dashboard/**` and `/admin/**` routes
- Profiles (view, edit, avatar-ready schema, verification status, average rating)
- Luggage Sharing: create/pause/resume/cancel listings, search with real filters (route, date, weight, category, trip type, transport, price) and real pagination
- Ship Requests: create requests, browse, filter, make offers
- Travel Buddy: create posts, browse, filter, message
- Unified booking system shared by Luggage Sharing and Ship Requests
- Offer / counter-offer negotiation with full history (offers are never overwritten, only superseded)
- Server-side, race-safe capacity enforcement (see [DATABASE.md](DATABASE.md#concurrency--capacity-locking))
- Centralized fee engine (server-side, integer cents, never client-trusted)
- Pickup confirmation with condition selection and a confirmation checklist
- Delivery + OTP (bcrypt-hashed, 30-minute expiry, 5-attempt lockout)
- Reviews (one per participant per completed booking, no self-review, duplicate-proof)
- Chat with Supabase Realtime, scoped by RLS
- In-app notifications with unread counts and Realtime push
- Dashboard (role-aware stats, my posts, orders, offers, messages, notifications, profile)
- Basic admin panel (users, posts, requests, bookings, payments, reports, suspend/verify actions, audit log via `admin_actions`)
- Reports (file + admin review/resolve)
- Row Level Security on every table
- Responsive layout (mobile filter drawers, mobile nav, stacked layouts)

## Documented dev/test stand-ins (not fake — clearly labeled, real code, just not live)

| Feature | What happens today | What changes for production |
|---|---|---|
| **Payments** | `confirm_test_payment()` simulates a successful charge. Every payment UI element says "Test Mode — no real charge will be made." | Set `STRIPE_SECRET_KEY`; `src/lib/payments/index.ts` automatically switches to `StripePaymentProvider`. Implement the webhook stub at `src/app/api/webhooks/stripe/route.ts` (the exact state transitions it needs to replicate are documented inline). |
| **Delivery OTP delivery** | No SMS/email provider is configured, so the plaintext code is included directly in the shopper's in-app notification, labeled "[TEST MODE — no SMS configured]". The code is still bcrypt-hashed at rest and rate-limited. | Wire an SMS/email provider in `send_delivery_otp`'s caller and stop including the code in the notification body. |
| **Google / Apple OAuth** | Not wired into the login/signup forms. | Enable the provider in the Supabase Auth dashboard, add a `supabase.auth.signInWithOAuth({ provider })` call — no schema changes needed. |
| **Chat image attachments** | The attachment button is present but disabled with an explanatory tooltip, rather than pretending to upload. | Wire `supabase.storage.from('chat-attachments').upload(...)` and set `messages.image_url`. |
| **Automated concurrency/integration tests** | Unit tests cover the pure TypeScript logic (fee math, status label completeness, error mapping) — see `npm run test`. The capacity-locking and state-machine guarantees are enforced in Postgres and documented with a manual verification recipe in [DATABASE.md](DATABASE.md#concurrency--capacity-locking). | Add pgTAP tests or an integration suite that runs against a real (e.g. branched) Supabase Postgres instance in CI — this build environment had no live database connection available to run one. |

## Explicitly out of scope (per the brief's own "no over-engineering" instruction)

- Microservices, Kubernetes, message queues
- GPS/live location tracking (milestone-based `OrderTimeline` only)
- AI-based matching
- Full KYC (verification is a manual admin toggle: unverified/pending/verified/rejected)
- FX conversion engine (multi-currency columns exist; conversion is not implemented)
- Native mobile apps
- Payout/withdrawal infrastructure for travellers' earnings

## Recommended production improvements

1. Add pgTAP or integration tests against a real Postgres instance for the RPC functions, especially concurrent-booking races.
2. Go live with Stripe (see [DEPLOYMENT.md](DEPLOYMENT.md)) and implement the webhook handler.
3. Add a real SMS/email provider for delivery OTPs instead of the in-app "test mode" notification.
4. Add Google/Apple OAuth.
5. Add file upload for chat images and pickup-evidence photos (the `pickup_confirmations.photo_urls` column already exists; only the upload UI is missing).
6. Add a `supabase gen types typescript` step to CI so `src/lib/types/database.ts` is generated instead of hand-written.
7. Add basic rate limiting (e.g. Upstash) in front of `send_delivery_otp` and `verify_delivery_otp` beyond the existing 5-attempt DB-level lockout.
