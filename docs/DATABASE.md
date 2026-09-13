# Database

PostgreSQL via Supabase. Schema lives in `supabase/migrations/`, applied in numeric order:

| File | Contents |
|---|---|
| `20260101000001_init.sql` | Enums, all tables, indexes, constraints |
| `20260101000002_functions.sql` | Fee engine, new-user trigger, rating trigger, and every state-changing RPC function |
| `20260101000003_rls.sql` | Row Level Security policies |
| `20260101000004_seed_categories.sql` | The 7 fixed item categories |
| `20260101000005_newsletter.sql` | Newsletter subscribers table (landing page footer) |
| `20260101000006_notification_prefs.sql` | `profiles.email_notifications_enabled` |

## Tables

`profiles`, `user_roles`, `categories`, `traveller_posts`, `traveller_post_categories`, `ship_requests`, `ship_request_categories`, `travel_buddy_posts`, `bookings`, `booking_items`, `offers`, `payments`, `conversations`, `conversation_participants`, `messages`, `pickup_confirmations`, `delivery_otps`, `delivery_confirmations`, `reviews`, `notifications`, `reports`, `admin_actions`.

All primary keys are UUIDs (`gen_random_uuid()`). All money columns are **integer cents**, never floating point (`item_price_cents`, `service_fee_cents`, `platform_fee_cents`, `total_cents`, `amount_cents`, `price_cents`, `proposed_payment_cents`, `item_value_cents`).

## Key indexes

- `traveller_posts(origin_country, destination_country)`, `(departure_date)`, `(status)`, `(traveller_id)`, `(created_at desc)`
- `ship_requests(origin_country, destination_country)`, `(status)`, `(shopper_id)`, `(created_at desc)`
- `bookings(shopper_id)`, `(traveller_id)`, `(status)`, `(created_at desc)`
- `notifications(user_id, created_at desc)` and a partial index `where is_read = false`

## Concurrency & capacity locking

`traveller_posts.remaining_capacity_kg` is the single source of truth for how much space is left. It is only ever mutated inside `_hold_capacity()` / `_release_capacity()` (internal helpers in `20260101000002_functions.sql`), both of which run inside a `SECURITY DEFINER` function that opens with:

```sql
select * into v_post from traveller_posts where id = p_post_id for update;
```

`FOR UPDATE` takes a row lock for the duration of the enclosing transaction. If two shoppers try to book the last 5kg of a 5kg-remaining listing at the same instant, Postgres serializes the two transactions: the first to commit decrements `remaining_capacity_kg` to 0 and flips `status` to `fully_booked`; the second one's `for update` blocks until the first commits, then re-reads `remaining_capacity_kg` (now 0) and raises `insufficient_capacity` — it can never succeed. This is the mechanism behind business rules #1–#3 in [MVP-SCOPE.md](MVP-SCOPE.md).

Counter-offers that change the requested weight reconcile the hold atomically (`create_counter_offer` releases the old amount and re-holds the new amount inside the same locked transaction), so renegotiating a booking can never silently over-commit a post's capacity.

**How to verify this yourself:** open two separate browser sessions as different shoppers, both viewing the same nearly-full listing, and submit two bookings that together exceed the remaining capacity within the same second. The second request will fail with "There isn't enough available space left for this weight," and the first booking's capacity deduction will be the only one applied. (Automated concurrency tests would need a live Postgres connection, which isn't available in this build environment — see [MVP-SCOPE.md](MVP-SCOPE.md#recommended-production-improvements).)

## Row Level Security

RLS is enabled on every table. The general shape:

- **Public read** on active/completed marketplace content (`traveller_posts` where `status = 'active'`, `ship_requests` where `status in ('active','offer_received')`, `travel_buddy_posts` where `status = 'active'`, all `reviews`, all `categories`, all `profiles` — a profile row itself never contains secrets).
- **Owner read/write** on a user's own posts, notifications, and reports.
- **Participant read** on `bookings`, `booking_items`, `offers`, `payments`, `conversations`, `messages`, `pickup_confirmations`, `delivery_confirmations` — scoped to `shopper_id = auth.uid() OR traveller_id = auth.uid()` (or the conversation-participants join for chat).
- **No direct client write** on `bookings`, `offers`, `payments`, pickup/delivery/OTP tables. Every state change goes through a `SECURITY DEFINER` function (see below), so there is no RLS `insert`/`update` policy on these tables for the `authenticated` role at all — the only way to change a booking's status is to call one of the functions, which re-checks `auth.uid()`, ownership, and the current state before doing anything.
- **Admin bypass** via `is_admin()`, a `SECURITY DEFINER` helper that reads `profiles.is_admin` for the current user. Admin actions are additionally logged to `admin_actions`.

## RPC functions (the state machine)

All of the following are `SECURITY DEFINER`, re-validate `auth.uid()` and ownership internally, and are the *only* way to perform their respective action:

| Function | Effect |
|---|---|
| `calculate_fees(item_price_cents)` | Single source of truth for the fee split (8% service fee, 2% platform fee, $1 minimum) |
| `create_luggage_booking` | Locks the post, checks capacity + expiry, decrements capacity, creates the booking + initial offer + conversation |
| `create_offer_on_ship_request` | Traveller offers on a shopper's request; creates the booking + offer |
| `create_counter_offer` | Either party counters; marks the previous offer `countered`, reconciles capacity if weight changed |
| `accept_offer` / `reject_offer` | Only the non-author of the last offer may respond; accepting moves the booking to `payment_pending` |
| `cancel_booking` | Only allowed pre-payment; releases held capacity |
| `create_payment_intent` / `confirm_test_payment` | Test-mode payment confirmation; advances the booking to `pickup_pending` |
| `confirm_pickup` | Traveller only, requires `pickup_pending`; records condition + optional photos |
| `start_transit` | Traveller only, requires `pickup_confirmed` |
| `initiate_delivery` | Traveller only, requires `in_transit` |
| `send_delivery_otp` | Generates a 6-digit code, stores only its bcrypt hash, returns the plaintext once |
| `verify_delivery_otp` | Checks hash + expiry (30 min) + attempt limit (5); on success marks the booking `completed` |
| `create_review` | Requires `completed` status, participant, not self, and the `reviews` unique constraint blocks duplicates |
| `set_post_status` | Owner-only pause/resume/cancel for a traveller post |

See the SQL file itself for the full implementation and the exact error codes each function raises — they're mapped to user-facing copy in `src/lib/actions/errors.ts`.
