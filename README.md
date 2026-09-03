# CodeWaypoints — Coming Soon / Waitlist

A tiny, standalone Next.js site: a coming-soon landing page with an email
waitlist backed by Supabase, plus confirmation + thank-you emails via
Resend. Deliberately separate from the main `code-waypoints` app — no
shared deploy, no shared auth, just a landing page.

## Stack

- **Next.js 15** (App Router, TypeScript, Tailwind)
- **Supabase** — stores `waitlist` rows (email, name, confirmed status)
- **Resend** — sends the confirmation email on signup, and a thank-you
  email once the link is clicked

## 1. Supabase setup

1. Create a Supabase project (or reuse an existing one — a `waitlist`
   table doesn't need to live in the same project as your main app, but
   it can).
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
3. Grab your Project URL, `anon` key, and `service_role` key from
   **Project Settings → API**.

## 2. Resend setup

1. Sign up at [resend.com](https://resend.com) (free tier: 100
   emails/day, 3,000/month).
2. Verify a sending domain under **Domains** (or leave
   `RESEND_FROM_EMAIL` as the sandbox `onboarding@resend.dev` while
   testing — it only delivers to your own verified account email until
   you verify a domain).
3. Create an API key under **API Keys**.

## 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (keep secret — server-only) |
| `RESEND_API_KEY` | Resend → API Keys |
| `RESEND_FROM_EMAIL` | e.g. `CodeWaypoints <hello@yourdomain.com>` once a domain is verified |
| `NEXT_PUBLIC_APP_URL` | This site's own deployed URL (used to build the confirmation link) |

## 4. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, submit the form, and check the inbox tied
to the email you used (Resend's sandbox sender only delivers to the email
address on your own Resend account until a domain is verified).

## 5. Deploy on Vercel

1. Push this directory to its own GitHub repo (or a subdirectory — set
   Vercel's "Root Directory" if so).
2. [Import the repo into Vercel](https://vercel.com/new).
3. Add the same environment variables from `.env.local` in the Vercel
   project's **Settings → Environment Variables**. Set
   `NEXT_PUBLIC_APP_URL` to the Vercel-assigned domain (or your custom
   domain once attached).
4. Deploy. Every push to the default branch redeploys automatically.

## How the flow works

1. Visitor submits the form on `/` → `POST /api/waitlist`.
2. The route inserts `{ email, name }` into Supabase using the
   `service_role` key (bypasses RLS — this is a trusted server context),
   computes the signup's 1-based position, and sends a **confirmation**
   email via Resend with a link to `/confirm?email=...`.
3. Visiting `/confirm` (a Server Component, no client-side Supabase key
   needed) marks the row `confirmed = true` and sends a **thank-you**
   email.

Both emails are best-effort: if Resend fails, the signup itself still
succeeds (the row is already saved) and the failure is logged server-side
rather than surfaced as a broken signup.

## Notes / limitations

- One repo, one purpose: this is intentionally not wired into the main
  `code-waypoints` app's auth or database schema — see that repo's
  `CLAUDE.md` for why a separate site was chosen.
- No admin UI for viewing signups yet — use the Supabase Table Editor.
- No rate limiting on `/api/waitlist` — fine for a pre-launch page behind
  normal traffic; add Vercel's Edge Config / Upstash rate limiting if you
  expect abuse.
