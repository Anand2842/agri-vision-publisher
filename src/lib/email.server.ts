// Server-only email delivery via Resend (https://resend.com).
// Required server env vars: RESEND_API_KEY, EMAIL_FROM (a verified sender, e.g.
// "Agriculture Magazine <editor@agriculturemagazine.in>"). Without them the message is
// logged on the server and { sent: false } is returned.
export async function deliverEmail(to: string, subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.log(`[email not sent: RESEND_API_KEY/EMAIL_FROM missing] to=${to} subject=${subject}`);
    return { sent: false };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });
  if (!res.ok) {
    console.error(`[email] Resend error ${res.status}: ${await res.text()}`);
    return { sent: false };
  }
  return { sent: true };
}

// Email address of a registered user (service role lookup).
export async function userEmail(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  return error ? null : (data.user?.email ?? null);
}
