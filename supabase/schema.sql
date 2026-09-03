-- CodeWaypoints waitlist — run this once against your Supabase project
-- (SQL editor, or `supabase db push` if you wire up migrations later).

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

-- Simple, index-backed waitlist position (1-based, by signup order).
create index if not exists waitlist_created_at_idx on public.waitlist (created_at);

alter table public.waitlist enable row level security;

-- Anyone can sign up (the API route uses the anon key for the insert).
create policy "waitlist_insert_anon" on public.waitlist
  for insert
  with check (true);

-- Anyone can confirm their own email via the confirmation link
-- (matched by email, not by an authenticated session — there is none pre-launch).
create policy "waitlist_update_confirm" on public.waitlist
  for update
  using (true)
  with check (true);

-- No public select policy: signups are readable only via the service_role
-- key (server-side), never from the browser. Add one explicitly if you
-- later want a public "N people waiting" counter.
