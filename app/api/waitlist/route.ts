import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { resendClient, FROM_EMAIL, confirmationEmailHtml } from "@/lib/resend";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: string; name?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const name = body.name?.trim() || null;

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  const supabase = supabaseAdmin();

  const { data: inserted, error: insertError } = await supabase
    .from("waitlist")
    .insert([{ email, name }])
    .select("id, created_at")
    .single();

  if (insertError) {
    // Postgres unique_violation
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "That email is already on the waitlist" },
        { status: 409 }
      );
    }
    console.error("waitlist insert error", insertError);
    return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 500 });
  }

  // 1-based position by signup order.
  const { count, error: countError } = await supabase
    .from("waitlist")
    .select("id", { count: "exact", head: true })
    .lte("created_at", inserted.created_at);

  const position = countError || count == null ? null : count;

  // Best-effort confirmation email — a failure here shouldn't fail the signup,
  // since the row is already saved. Log it and let the user know either way.
  let emailSent = true;
  try {
    const resend = resendClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const confirmUrl = `${appUrl}/confirm?email=${encodeURIComponent(email)}`;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "You're on the CodeWaypoints waitlist 🎉",
      html: confirmationEmailHtml({ name, position: position ?? 0, confirmUrl }),
    });
  } catch (err) {
    emailSent = false;
    console.error("resend send error", err);
  }

  return NextResponse.json({
    success: true,
    position,
    emailSent,
  });
}
