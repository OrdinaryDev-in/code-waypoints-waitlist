import { Resend } from "resend";

export function resendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY env var");
  }
  return new Resend(apiKey);
}

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "CodeWaypoints <onboarding@resend.dev>";

export function confirmationEmailHtml({
  name,
  position,
  confirmUrl,
}: {
  name?: string | null;
  position: number;
  confirmUrl: string;
}) {
  const greeting = name ? `Hey ${name},` : "Hey there,";
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; color: #15141a;">
      <h2 style="font-size: 22px; margin-bottom: 8px;">${greeting} you're on the list 🎉</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #33313d;">
        Thanks for signing up for <strong>CodeWaypoints</strong> — you're
        <strong>#${position}</strong> in line. We'll email you the moment
        the doors open.
      </p>
      <p style="margin: 24px 0;">
        <a href="${confirmUrl}"
           style="background:#7c3aed;color:#fff;padding:12px 20px;border-radius:8px;
                  text-decoration:none;font-weight:600;display:inline-block;">
          Confirm your email
        </a>
      </p>
      <p style="font-size: 13px; color: #7a7365;">
        Didn't sign up? You can safely ignore this email.
      </p>
    </div>
  `;
}
