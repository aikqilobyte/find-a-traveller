# Auth email templates

Branded replacements for Supabase's default auth emails.

## How to apply

Supabase dashboard → **Authentication** → **Emails** → pick the template → paste the HTML → **Save**.

| File | Supabase template | Suggested subject |
|---|---|---|
| `confirm-signup.html` | Confirm signup | `Confirm your email — Find A Traveller` |
| `reset-password.html` | Reset password | `Reset your password — Find A Traveller` |

The logo is loaded from `https://findatraveller.netlify.app/logo-mark.png`. If the site moves to a
custom domain, update that URL in both files (and here).

Supabase template variables used: `{{ .ConfirmationURL }}`, `{{ .Email }}`. Do not rename them.

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
