# Deployment

## Supabase (production project)

1. Create a new Supabase project (a separate one from local/staging).
2. Run every file in `supabase/migrations/` in order via the SQL Editor, or `supabase db push` if the project is linked via the CLI.
3. In **Authentication → URL Configuration**, set the Site URL and add your production domain's `/auth/callback` to the redirect allow-list.
4. In **Authentication → Emails**, apply the branded templates from `docs/email-templates/` (see the README there). The links themselves are built by the app, not by Supabase, so the template only controls how the email looks.
5. Still in Supabase, set up **custom SMTP** (Project Settings → Authentication → SMTP Settings). Until you do, auth emails come from Supabase's shared address and are rate-limited to a handful per hour — fine for a demo, not for launch. `docs/email-templates/README.md` lists providers.
6. Copy the Project URL, anon key, and service role key into your hosting provider's environment variables. **Never** expose the service role key to the client or commit it.

## Vercel

1. Import the repository into Vercel.
2. Set environment variables (from `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` (your production URL), and the Stripe variables once you have them.
3. Build command `next build`, output is handled automatically by the Next.js framework preset — no custom configuration needed.
4. Redeploy after changing environment variables (they're baked into the server bundle at build time for anything read outside a request handler).

## Going live with Stripe

1. Create a Stripe account, get a live secret key and publishable key.
2. Set `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET`.
3. `src/lib/payments/index.ts` will automatically report `StripePaymentProvider` as configured — replace the "Pay Now (Test Mode)" button's `onClick` in `src/components/booking/pay-now-button.tsx` with a call that creates a Stripe PaymentIntent for `booking.total_cents` and mounts Stripe Elements or redirects to Checkout.
4. Implement `src/app/api/webhooks/stripe/route.ts`: verify the signature with `stripe.webhooks.constructEvent`, and on `payment_intent.succeeded` use `src/lib/supabase/admin.ts` (the service role client — a webhook has no user session) to set `payments.status = 'paid'` and the booking to `pickup_pending`, mirroring what `confirm_test_payment()` does today.
5. Register the webhook endpoint in the Stripe dashboard pointing at `https://<your-domain>/api/webhooks/stripe`.

## Seeding a production-adjacent demo/staging environment

`npm run seed` is meant for local development — it creates accounts with a well-known password. Do not run it against a real production project. For a staging demo, either run it against a dedicated staging Supabase project, or write a separate seed script with unique, non-guessable demo credentials.

## Post-deploy checklist

- [ ] All 6 migrations applied
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set only on the server (never in a `NEXT_PUBLIC_*` variable)
- [ ] `NEXT_PUBLIC_SITE_URL` matches the deployed domain. Auth email links fall back to the request origin if it is missing or still set to localhost (see `src/lib/site-url.ts`), so this is no longer fatal — but set it anyway, or emails will point at whichever domain the user happened to sign up on
- [ ] Custom SMTP configured, or you accept Supabase's shared sender and its hourly rate limit
- [ ] A real signup on the deployed site delivers a confirmation email, and the link lands back on the deployed domain
- [ ] Supabase Auth redirect allow-list includes `https://<domain>/auth/callback`
- [ ] `npm run build` succeeds with production environment variables
- [ ] At least one admin account exists (`profiles.is_admin = true`) — the seed script creates one; in production, set it manually via the SQL Editor after your first real sign-up: `update profiles set is_admin = true where email = '...';`
