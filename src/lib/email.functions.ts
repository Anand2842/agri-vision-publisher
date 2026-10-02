import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Real email delivery via Resend; see email.server.ts. Also needs EDITOR_EMAIL.

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
    const { deliverEmail, userEmail } = await import("@/lib/email.server");
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
        const email = await userEmail(data.to);
        if (!email) throw new Error("Recipient has no email address");
        recipient = email;
      }
    }

    return deliverEmail(recipient, data.subject, data.body);
  });
