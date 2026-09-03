import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resendClient, FROM_EMAIL } from "@/lib/resend";

export const dynamic = "force-dynamic";

async function confirmEmail(email: string) {
  const supabase = supabaseAdmin();

  const { data: row } = await supabase
    .from("waitlist")
    .select("id, name, confirmed")
    .eq("email", email)
    .maybeSingle();

  if (!row) return { ok: false as const, alreadyConfirmed: false };

  if (row.confirmed) {
    return { ok: true as const, alreadyConfirmed: true };
  }

  await supabase
    .from("waitlist")
    .update({ confirmed: true, confirmed_at: new Date().toISOString() })
    .eq("id", row.id);

  // Fire the "thanks" email now that the address is verified — best-effort,
  // a failure here shouldn't block showing the confirmation to the user.
  try {
    const resend = resendClient();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Thanks for confirming — you're all set 🚀",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; color: #15141a;">
          <h2 style="font-size: 22px;">Thanks${row.name ? `, ${row.name}` : ""} — you're confirmed!</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #33313d;">
            Your spot on the CodeWaypoints waitlist is locked in. We'll send
            one more email the day the doors open — no spam before then.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error("resend thank-you send error", err);
  }

  return { ok: true as const, alreadyConfirmed: false };
}

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const normalized = email?.trim().toLowerCase();

  const result = normalized ? await confirmEmail(normalized) : { ok: false as const, alreadyConfirmed: false };

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center p-4 text-center">
      <div className="max-w-sm">
        {result.ok ? (
          <>
            <h1 className="text-2xl font-semibold text-white mb-2">
              {result.alreadyConfirmed ? "Already confirmed ✅" : "Confirmed ✅"}
            </h1>
            <p className="text-slate-400 text-sm">
              Thanks for confirming your email. We'll be in touch the day
              CodeWaypoints launches.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-white mb-2">
              Couldn&apos;t confirm that link
            </h1>
            <p className="text-slate-400 text-sm">
              This confirmation link looks invalid or expired. Sign up again
              from the homepage and we&apos;ll send a fresh one.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
