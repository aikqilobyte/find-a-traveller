# Auth email templates

Branded replacements for Supabase's default auth emails.

## How to apply

Supabase dashboard → **Authentication** → **Emails** → pick the template → paste the HTML → **Save**.

| File | Supabase template | Suggested subject |
|---|---|---|
| `confirm-signup.html` | Confirm signup | `Confirm your email — Find A Traveller` |
| `reset-password.html` | Reset password | `Reset your password — Find A Traveller` |

The logo is loaded from `https://app.tripshipr.com/logo-mark.png`. If the site moves to a
custom domain, update that URL in both files (and here).

Supabase template variables used: `{{ .SiteURL }}`, `{{ .TokenHash }}`, `{{ .Email }}`. Do not rename them.

## Why these use `{{ .TokenHash }}` and not `{{ .ConfirmationURL }}`

`{{ .ConfirmationURL }}` produces a PKCE link. The proof it needs is held in a cookie in the browser
that started the signup, so the link only completes in that same browser. People sign up on a laptop
and open the mail on their phone, where that cookie does not exist, and the confirmation fails with
`auth_callback_failed`.

`{{ .TokenHash }}` carries its own proof, so the link works from whichever device opened the message.
`/auth/callback` accepts both.

## Site URL must be correct, or none of this matters

`{{ .SiteURL }}` is **Authentication → URL Configuration → Site URL** in the Supabase dashboard, and
Supabase also falls back to it whenever an app-supplied `emailRedirectTo` is not on the allow-list
below. If it still says `http://localhost:3000`, every confirmation email tells the recipient to visit
their own machine.

Set:

- **Site URL**: `https://app.tripshipr.com`
- **Redirect URLs**: `https://app.tripshipr.com/auth/callback` (add `http://localhost:3000/auth/callback`
  too if you want local signup to keep working)

## Sending from your own address

By default these still arrive **from Supabase's shared address**, because the project uses Supabase's
built-in email service. That service is also rate-limited (a handful of emails per hour) and Supabase
explicitly does not intend it for production — so this needs solving before any real launch, not just
for looks.

To fix it, configure **custom SMTP**: Supabase dashboard → **Project Settings** → **Authentication** →
**SMTP Settings**.

Recommended providers (all have free tiers):

| Provider | Free tier | Sender requirement |
|---|---|---|
| [Resend](https://resend.com) | 3,000/month | Needs a domain you control (DNS records) |
| [Brevo](https://brevo.com) | 300/day | Can verify a single email address — no domain needed |
| [SendGrid](https://sendgrid.com) | 100/day | Can verify a single sender address |

Because Find A Traveller doesn't own a domain yet, **Brevo or SendGrid single-sender verification** is
the quickest path — emails would come from e.g. `hello@yourgmail.com` with the display name
"Find A Traveller". Once a real domain exists (e.g. `findatraveller.com`), switch to Resend with
domain verification so mail comes from `noreply@findatraveller.com` and lands in inboxes rather than
spam.

Whichever you choose, you set in Supabase:

- Host / port / username / password from the provider
- **Sender email** — the verified address
- **Sender name** — `Find A Traveller`
