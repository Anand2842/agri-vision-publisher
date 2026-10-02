import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Editorial actions run on the server: the database change happens as the signed-in user
// (so row-level security and role checks still apply), then the notification email is
// sent from here instead of from the browser.

const SITE = "https://agriculturemagazine.in";
const SIGNATURE =
  "Warm regards,\nDr. Dileep Kumar Dangi\nEditor-in-Chief\nAgri Popular Article Magazine";

const promoteInput = z.object({
  submissionId: z.string().uuid(),
  title: z.string().trim().min(1).max(500),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug may only contain a-z, 0-9 and hyphens"),
  abstract: z.string().max(5000).nullable(),
  issueId: z.string().uuid().nullable(),
  categoryId: z.string().uuid().nullable(),
});

export const promoteSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: z.infer<typeof promoteInput>) => promoteInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    // One database transaction: creates the article and marks the submission published.
    const { data: slug, error } = await supabase.rpc("promote_submission", {
      p_submission_id: data.submissionId,
      p_title: data.title,
      p_slug: data.slug,
      p_abstract: data.abstract ?? "",
      p_issue_id: data.issueId,
      p_category_id: data.categoryId,
    });
    if (error) {
      throw new Error(
        error.code === "23505" ? `The slug "${data.slug}" is already used by another article` : error.message,
      );
    }

    const { data: sub } = await supabase
      .from("submissions")
      .select("user_id, author_email, guest_email, salutation, author_name, guest_name")
      .eq("id", data.submissionId)
      .single();
    const { deliverEmail, userEmail } = await import("@/lib/email.server");
    const to =
      sub?.author_email || sub?.guest_email || (sub?.user_id ? await userEmail(sub.user_id) : null);
    const name =
      [sub?.salutation, sub?.author_name || sub?.guest_name].filter(Boolean).join(" ") || "Author";
    const email = to
      ? await deliverEmail(
          to,
          "Your article has been published",
          `Dear ${name},\n\nYour article "${data.title}" has been published in The Agriculture Popular Article Magazine.\n\nRead it here: ${SITE}/articles/${slug}\n\n${SIGNATURE}`,
        )
      : { sent: false };

    return { slug: slug as string, emailed: email.sent };
  });

const reviewInput = z.object({
  claimId: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  notes: z.string().max(5000),
});

export const reviewMembershipClaim = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: z.infer<typeof reviewInput>) => reviewInput.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    // The member ID is assigned by a database trigger on approval (never in the browser),
    // so two editors approving at once can't hand out the same ID.
    const { data: claim, error } = await supabase
      .from("membership_payments")
      .update({ status: data.status, notes: data.notes, updated_at: new Date().toISOString() })
      .eq("id", data.claimId)
      .select("user_id, plan, member_id, notes")
      .single();
    if (error) throw new Error(error.message);

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", claim.user_id)
      .maybeSingle();
    const { deliverEmail, userEmail } = await import("@/lib/email.server");
    const to = await userEmail(claim.user_id);
    const plan = claim.plan.toUpperCase();
    const body =
      data.status === "approved"
        ? `Your membership claim for the ${plan} plan has been verified.\n\nYour Member ID is: ${claim.member_id}. You can now download your certificate and submit manuscripts from your author dashboard: ${SITE}/dashboard`
        : `Your membership claim for the ${plan} plan could not be verified.\n\nEditor's note: ${data.notes.trim() || "None provided"}`;
    const email = to
      ? await deliverEmail(
          to,
          data.status === "approved" ? "Membership verified" : "Membership claim not approved",
          `Dear ${profile?.full_name || "Member"},\n\n${body}\n\n${SIGNATURE}`,
        )
      : { sent: false };

    return { memberId: claim.member_id, emailed: email.sent };
  });
