import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type RowData = Record<string, unknown>;
type MirrorTable = {
  name: string;
  conflict: string;
  naturalKeys?: string[][];
};

// Tables to mirror, in dependency-safe order (parents before children).
// Upserts use the primary key, but several tables also have natural unique
// keys seeded by the bootstrap SQL. If a backup project already has seeded rows
// with generated IDs, remove those conflicting rows first so the primary IDs
// from production can be mirrored and foreign keys continue to line up.
const TABLES: MirrorTable[] = [
  { name: "categories", conflict: "id", naturalKeys: [["slug"]] },
  { name: "issues", conflict: "id", naturalKeys: [["volume", "issue_number"]] },
  { name: "profiles", conflict: "id" },
  { name: "user_roles", conflict: "id", naturalKeys: [["user_id", "role"]] },
  { name: "site_content", conflict: "id", naturalKeys: [["page", "section", "key"]] },
  { name: "membership_payments", conflict: "id", naturalKeys: [["member_id"]] },
  { name: "articles", conflict: "id", naturalKeys: [["slug"]] },
  { name: "submissions", conflict: "id" },
  { name: "submission_events", conflict: "id" },
  { name: "contact_messages", conflict: "id" },
];

const STORAGE_BUCKETS = ["article-pdfs", "manuscripts", "site-assets", "payment-receipts"];

const PAGE_SIZE = 500;

// Supabase errors (PostgrestError, StorageError, AuthError) are plain objects,
// not Error instances — so `e.message` works but `e instanceof Error` is false
// and `String(e)` yields "[object Object]". Extract a readable string.
function fmtErr(e: unknown): string {
  if (!e) return "unknown error";
  if (typeof e === "string") return e;
  if (e instanceof Error) return e.message;
  if (typeof e === "object") {
    const o = e as Record<string, unknown>;
    const parts = [
      o.message,
      o.details ? `details: ${o.details}` : null,
      o.hint ? `hint: ${o.hint}` : null,
      o.code ? `code: ${o.code}` : null,
      o.statusCode ? `status: ${o.statusCode}` : null,
    ].filter(Boolean);
    if (parts.length) return parts.join(" — ");
    try {
      return JSON.stringify(e);
    } catch {
      return "unserializable error";
    }
  }
  return String(e);
}

async function clearNaturalKeyConflicts(
  // Dynamic Supabase table builder factory; generated types cannot model runtime table names.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  backupTable: () => any,
  rows: RowData[],
  naturalKeys: string[][] | undefined,
) {
  if (!naturalKeys?.length) return;

  for (const keys of naturalKeys) {
    if (keys.length === 1) {
      // Single-column natural key: batch delete with .in()
      const col = keys[0];
      const values = Array.from(
        new Set(
          rows
            .map((r) => r[col])
            .filter((v) => v !== null && v !== undefined),
        ),
      );
      if (values.length === 0) continue;
      const { error } = await backupTable().delete().in(col, values);
      if (error) throw error;
    } else {
      // Composite natural key: delete each match individually (small N expected)
      for (const row of rows) {
        const match = Object.fromEntries(keys.map((k) => [k, row[k]]));
        if (Object.values(match).some((v) => v === null || v === undefined)) continue;
        const { error } = await backupTable().delete().match(match);
        if (error) throw error;
      }
    }
  }
}

async function ensureAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(`Role check failed: ${error.message}`);
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (!roles.includes("admin")) {
    throw new Error("Forbidden: admin only");
  }
}

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

// Shared core called by both the manual server fn and the cron webhook.
export async function performBackupMirror(trigger: "manual" | "cron"): Promise<{
  runId: string;
  status: "success" | "partial" | "failed";
  tablesSynced: number;
  rowsSynced: number;
  filesSynced: number;
  authUsersSynced: number;
  errors: string[];
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { backupAdmin } = await import("@/integrations/supabase/backup-client.server");

  // Create a backup_runs row up front so we have an ID to attach errors to
  const { data: runRow, error: runErr } = await supabaseAdmin
    .from("backup_runs")
    .insert({ trigger, status: "running" })
    .select("id")
    .single();
  if (runErr || !runRow) {
    throw new Error(`Failed to create backup_runs row: ${runErr?.message}`);
  }
  const runId = runRow.id as string;

  const errors: string[] = [];
  let tablesSynced = 0;
  let rowsSynced = 0;
  let filesSynced = 0;
  let authUsersSynced = 0;
  const tableDetails: Record<string, number | string> = {};

  // 1. Mirror tables
  for (const table of TABLES) {
    const { name, conflict } = table;
    try {
      let from = 0;
      let tableRows = 0;
      while (true) {
        // Dynamic table name: bypass generated Database literal-union typing.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const primaryFrom = (supabaseAdmin as any).from(name);
        const { data, error } = await primaryFrom.select("*").range(from, from + PAGE_SIZE - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const backupTable = () => (backupAdmin as any).from(name);
        await clearNaturalKeyConflicts(backupTable, data as RowData[], table.naturalKeys);
        const { error: upErr } = await backupTable().upsert(data, {
          onConflict: conflict,
        });
        if (upErr) throw upErr;
        tableRows += data.length;
        if (data.length < PAGE_SIZE) break;
        from += PAGE_SIZE;
      }
      tableDetails[name] = tableRows;
      rowsSynced += tableRows;
      tablesSynced += 1;
    } catch (e) {
      const msg = fmtErr(e);
      tableDetails[name] = `error: ${msg}`;
      errors.push(`table ${name}: ${msg}`);
    }
  }

  // 2. Mirror storage buckets (file content)
  for (const bucket of STORAGE_BUCKETS) {
    try {
      let bucketFiles = 0;
      await mirrorBucket(bucket, supabaseAdmin, backupAdmin, (n) => {
        bucketFiles += n;
      });
      tableDetails[`bucket:${bucket}`] = bucketFiles;
      filesSynced += bucketFiles;
    } catch (e) {
      const msg = fmtErr(e);
      tableDetails[`bucket:${bucket}`] = `error: ${msg}`;
      errors.push(`bucket ${bucket}: ${msg}`);
    }
  }

  // 3. Mirror auth users (id, email, metadata only — password hashes unavailable)
  try {
    let page = 1;
    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage: 200,
      });
      if (error) throw error;
      const users = data?.users ?? [];
      if (users.length === 0) break;
      for (const u of users) {
        try {
          // Try to create; if it exists, update instead.
          const { error: cErr } = await backupAdmin.auth.admin.createUser({
            email: u.email ?? undefined,
            email_confirm: !!u.email_confirmed_at,
            phone: u.phone ?? undefined,
            phone_confirm: !!u.phone_confirmed_at,
            user_metadata: u.user_metadata ?? {},
            app_metadata: u.app_metadata ?? {},
            id: u.id, // preserve UUID so user_roles/profiles FKs line up
          } as Parameters<typeof backupAdmin.auth.admin.createUser>[0]);
          if (cErr && !/already (registered|exists)/i.test(cErr.message)) {
            // try update by id
            await backupAdmin.auth.admin.updateUserById(u.id, {
              email: u.email ?? undefined,
              user_metadata: u.user_metadata ?? {},
              app_metadata: u.app_metadata ?? {},
            });
          }
          authUsersSynced += 1;
        } catch (e) {
          errors.push(`auth user ${u.id}: ${fmtErr(e)}`);
        }
      }
      if (users.length < 200) break;
      page += 1;
    }
  } catch (e) {
    errors.push(`auth listUsers: ${fmtErr(e)}`);
  }

  const status: "success" | "partial" | "failed" =
    errors.length === 0 ? "success" : tablesSynced > 0 || filesSynced > 0 ? "partial" : "failed";

  await supabaseAdmin
    .from("backup_runs")
    .update({
      finished_at: new Date().toISOString(),
      status,
      tables_synced: tablesSynced,
      rows_synced: rowsSynced,
      files_synced: filesSynced,
      auth_users_synced: authUsersSynced,
      error: errors.length ? errors.slice(0, 20).join(" | ") : null,
      details: tableDetails,
    })
    .eq("id", runId);

  return {
    runId,
    status,
    tablesSynced,
    rowsSynced,
    filesSynced,
    authUsersSynced,
    errors,
  };
}

async function mirrorBucket(
  bucket: string,
  primary: Awaited<ReturnType<typeof loadPrimary>>,
  backup: Awaited<ReturnType<typeof loadBackup>>,
  onFiles: (n: number) => void,
) {
  // Ensure the bucket exists on the backup side
  const { data: buckets } = await backup.storage.listBuckets();
  const existing = (buckets ?? []).find((b) => b.name === bucket);
  if (!existing) {
    await backup.storage.createBucket(bucket, {
      public: bucket === "article-pdfs" || bucket === "site-assets",
    });
  }
  await walkAndCopy(bucket, "", primary, backup, onFiles);
}

async function walkAndCopy(
  bucket: string,
  prefix: string,
  primary: Awaited<ReturnType<typeof loadPrimary>>,
  backup: Awaited<ReturnType<typeof loadBackup>>,
  onFiles: (n: number) => void,
) {
  let offset = 0;
  while (true) {
    const { data, error } = await primary.storage.from(bucket).list(prefix, { limit: 100, offset });
    if (error) throw error;
    if (!data || data.length === 0) break;
    for (const item of data) {
      const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
      // Folders have no id and metadata is null
      const isFolder = !item.id && item.metadata == null;
      if (isFolder) {
        await walkAndCopy(bucket, itemPath, primary, backup, onFiles);
        continue;
      }
      // Download from primary
      const { data: blob, error: dlErr } = await primary.storage.from(bucket).download(itemPath);
      if (dlErr) throw dlErr;
      // Upload to backup (upsert)
      const arrBuf = await blob.arrayBuffer();
      const contentType =
        (item.metadata as { mimetype?: string } | null)?.mimetype ?? "application/octet-stream";
      const { error: upErr } = await backup.storage
        .from(bucket)
        .upload(itemPath, new Uint8Array(arrBuf), {
          upsert: true,
          contentType,
        });
      if (upErr) throw upErr;
      onFiles(1);
    }
    if (data.length < 100) break;
    offset += 100;
  }
}

// Type helpers so the helper signatures match dynamic imports
async function loadPrimary() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}
async function loadBackup() {
  const { backupAdmin } = await import("@/integrations/supabase/backup-client.server");
  return backupAdmin;
}
