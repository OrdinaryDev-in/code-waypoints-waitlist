import { createClient } from "@supabase/supabase-js";

// Server-only client, used from Route Handlers and Server Components.
// The service_role key bypasses RLS, so this file must never be imported
// from client ("use client") code — Next.js will refuse to bundle the
// service-role env var into the browser build anyway, since it has no
// NEXT_PUBLIC_ prefix, but keep this import server-side regardless.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars"
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
