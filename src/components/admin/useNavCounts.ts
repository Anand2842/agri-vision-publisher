import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { adminKey, dbCount } from "@/lib/adminQuery";

export type CountKey = "review" | "ready" | "claims" | "messages";

// Sidebar badge counts. Shares the "admin" key prefix, so any admin change refreshes them.
export function useNavCounts(role: "admin" | "moderator" | null) {
  return useQuery({
    queryKey: adminKey("nav-counts", role),
    enabled: role !== null,
    refetchInterval: 60_000,
    queryFn: async (): Promise<Partial<Record<CountKey, number>>> => {
      const head = { count: "exact" as const, head: true };
      const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
      const [review, claims, ready, messages] = await Promise.all([
        dbCount(supabase.from("submissions").select("id", head).in("status", ["submitted", "under_review"])),
        dbCount(supabase.from("membership_payments").select("id", head).eq("status", "pending")),
        role === "admin"
          ? dbCount(supabase.from("submissions").select("id", head).eq("status", "approved"))
          : 0,
        role === "admin"
          ? dbCount(supabase.from("contact_messages").select("id", head).gte("created_at", weekAgo))
          : 0,
      ]);
      return { review, claims, ready, messages };
    },
  });
}
