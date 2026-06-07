// Server-only client for the secondary (backup) Supabase project.
// NEVER import this from client-reachable modules at top level.
// Always: const { backupAdmin } = await import("@/integrations/supabase/backup-client.server")
//   inside a createServerFn .handler() body.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function createBackupAdminClient(): SupabaseClient {
  const URL = process.env.BACKUP_SUPABASE_URL;
  const KEY = process.env.BACKUP_SUPABASE_SERVICE_ROLE_KEY;
  if (!URL || !KEY) {
    throw new Error(
      "Backup Supabase not configured. Missing BACKUP_SUPABASE_URL and/or BACKUP_SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createClient(URL, KEY, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
}

let _client: SupabaseClient | undefined;
export const backupAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_, prop, receiver) {
    if (!_client) _client = createBackupAdminClient();
    return Reflect.get(_client, prop, receiver);
  },
});
