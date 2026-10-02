import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Real email delivery via Resend (https://resend.com).
// Required server env vars: RESEND_API_KEY, EMAIL_FROM (a verified sender, e.g.
// "Agriculture Magazine <editor@agriculturemagazine.in>"), EDITOR_EMAIL.
// Without RESEND_API_KEY the message is logged on the server and { sent: false } is returned.

const input = z.object({
  // "editor" = the editorial inbox (any signed-in user may notify it);
  // a user id or an email address = a specific person (staff only, so this can't be
  // used as a spam relay).
  to: z.union([z.literal("editor"), z.string().uuid(), z.string().email()]),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(10000),
});

export const sendNotificationEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: z.infer<typeof input>) => input.parse(data))
  .handler(async ({ data, context }) => {
    let recipient: string;
    if (data.to === "editor") {
      recipient = process.env.EDITOR_EMAIL || "";
      if (!recipient) throw new Error("EDITOR_EMAIL is not configured");
    } else {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: roles, error } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", context.userId);
      if (error) throw new Error(`Role check failed: ${error.message}`);
      const isStaff = (roles ?? []).some((r) => r.role === "admin" || r.role === "moderator");
      if (!isStaff) throw new Error("Forbidden: staff only");
      if (data.to.includes("@")) {
        recipient = data.to;
      } else {
        const { data: u, error: uErr } = await supabaseAdmin.auth.admin.getUserById(data.to);
        if (uErr || !u.user?.email) throw new Error("Recipient has no email address");
        recipient = u.user.email;
      }
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) {
      console.log(`[email not sent: RESEND_API_KEY/EMAIL_FROM missing] to=${recipient} subject=${data.subject}`);
      return { sent: false };
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [recipient], subject: data.subject, text: data.body }),
    });
    if (!res.ok) {
      console.error(`[email] Resend error ${res.status}: ${await res.text()}`);
      return { sent: false };
    }
    return { sent: true };
  });
