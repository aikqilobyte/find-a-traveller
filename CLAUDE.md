# Find A Traveller — notes for Claude Code

- Product name in all user-facing text is **"Find A Traveller"**, never "FAT — Find A Traveller".
- **One service, two sides.** Travel Buddy and the separate "Luggage Sharing" product were removed; what ships is a single shipping marketplace where travellers post trips (`traveller_posts`) and senders post packages (`ship_requests`). The two entry points are `/find-a-traveller` ("Explore as Sender") and `/find-a-sender` ("Explore as Traveller"). Old routes redirect in `next.config.ts`.
- **Guests can browse everything.** Only committing actions (booking, offering, paying, posting) require an account — use `getCurrentProfile()` + `<SignInGate>` rather than `requireProfile()` on public pages.
- **Bangla is a first-class language.** Public copy lives in `src/lib/i18n/dictionaries.ts` (`en` + `bn`); `Dictionary` is derived from the English tree so a missing Bangla key fails typecheck. Locale is a cookie (`fat_locale`), read server-side via `getDictionary()`. Dashboard/admin are not translated yet.
- Brand colours are sampled from the logo; regenerate logo assets with `node scripts/build-logo-assets.mjs` after replacing `brand/logo-source.png`.
- Next.js is pinned to **15.5.x** (not 16) and shadcn/ui to the classic Radix-based CLI (`npx shadcn@3.8.5`), not the newer "base-nova"/base-ui preset — both were deliberate downgrades from what `create-next-app`/`shadcn init` installed by default, to stay on well-documented, stable APIs. Don't let a future `npx create-next-app` or `npx shadcn init` silently upgrade past these without checking compatibility first.
- Business logic (capacity locking, the booking state machine, fees, OTP) lives in Postgres `SECURITY DEFINER` functions in `supabase/migrations/20260101000002_functions.sql`, not in Server Actions. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for why. When adding a new state-changing feature, add a new SQL function rather than mutating `bookings`/`offers`/`payments` directly from a Server Action.
- Money is always integer cents. Never introduce a float for currency.
- Run `npm run typecheck && npm run lint && npm run test && npm run build` before considering a change done.
- No live Supabase project was available while this codebase was authored — see the root README's Local Setup section before assuming the app has been run end-to-end against a real database.
