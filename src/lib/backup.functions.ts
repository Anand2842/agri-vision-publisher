import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ensureAdmin, fmtErr, performBackupMirror } from "./backup-logic";

export const testBackupConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    try {
      const { backupAdmin } = await import("@/integrations/supabase/backup-client.server");
      // Try a harmless metadata call - list storage buckets
      const { data, error } = await backupAdmin.storage.listBuckets();
      if (error) throw error;
      return {
        ok: true,
        buckets: (data ?? []).map((b) => b.name),
        message: "Connected to backup project successfully.",
      };
    } catch (e) {
      return {
        ok: false,
        buckets: [],
        message: fmtErr(e),
      };
    }
  });

export const getBackupRuns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("backup_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return { runs: data ?? [] };
  });

export const runBackupMirror = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const result = await performBackupMirror("manual");
    return result;
  });
