import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  getBackupRuns,
  runBackupMirror,
  testBackupConnection,
} from "@/lib/backup.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DatabaseBackup, PlayCircle, Plug, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/backups")({
  component: AdminBackupsPage,
  head: () => ({
    meta: [
      { title: "Backups — Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type BackupRun = {
  id: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  trigger: string;
  tables_synced: number;
  rows_synced: number;
  files_synced: number;
  auth_users_synced: number;
  error: string | null;
  details: Record<string, number | string>;
};

function AdminBackupsPage() {
  const qc = useQueryClient();
  const fetchRuns = useServerFn(getBackupRuns);
  const triggerRun = useServerFn(runBackupMirror);
  const testConn = useServerFn(testBackupConnection);

  const { data, isLoading } = useQuery({
    queryKey: ["backup_runs"],
    queryFn: () => fetchRuns(),
    refetchInterval: 10_000,
  });

  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
    buckets: string[];
  } | null>(null);

  const testMut = useMutation({
    mutationFn: () => testConn(),
    onSuccess: (res) => {
      setTestResult(res);
      toast[res.ok ? "success" : "error"](res.message);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const runMut = useMutation({
    mutationFn: () => triggerRun(),
    onSuccess: (res) => {
      toast.success(
        `Backup ${res.status}: ${res.tablesSynced} tables, ${res.rowsSynced} rows, ${res.filesSynced} files, ${res.authUsersSynced} users.`,
      );
      qc.invalidateQueries({ queryKey: ["backup_runs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const runs = (data?.runs ?? []) as BackupRun[];

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DatabaseBackup className="h-5 w-5 text-orange" />
            <h2 className="font-display text-2xl text-ink">Disaster Recovery Backups</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            Nightly automated mirror of all tables, storage files, and auth users
            to a secondary Supabase project you control. See{" "}
            <code className="text-xs">BACKUP_RECOVERY.md</code> for the failover runbook.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => testMut.mutate()}
            disabled={testMut.isPending}
          >
            <Plug className="h-4 w-4 mr-2" />
            {testMut.isPending ? "Testing…" : "Test connection"}
          </Button>
          <Button
            size="sm"
            onClick={() => runMut.mutate()}
            disabled={runMut.isPending}
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            {runMut.isPending ? "Running…" : "Run backup now"}
          </Button>
        </div>
      </header>

      {testResult && (
        <div
          className={`rounded border p-3 text-sm ${
            testResult.ok
              ? "border-green-600/30 bg-green-50 text-green-900"
              : "border-red-600/30 bg-red-50 text-red-900"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {testResult.ok ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            {testResult.message}
          </div>
          {testResult.buckets.length > 0 && (
            <div className="mt-1 text-xs">
              Buckets on backup: {testResult.buckets.join(", ") || "(none yet)"}
            </div>
          )}
        </div>
      )}

      <div className="rounded border border-border bg-card">
        <div className="border-b border-border px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">
          Recent Runs (last 30)
        </div>
        {isLoading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : runs.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No backup runs yet. Click <strong>Test connection</strong> first,
            then <strong>Run backup now</strong> to perform the initial mirror.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="px-4 py-2">Started</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Trigger</th>
                <th className="px-4 py-2 text-right">Tables</th>
                <th className="px-4 py-2 text-right">Rows</th>
                <th className="px-4 py-2 text-right">Files</th>
                <th className="px-4 py-2 text-right">Users</th>
                <th className="px-4 py-2">Duration</th>
                <th className="px-4 py-2">Error</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => {
                const dur =
                  r.finished_at && r.started_at
                    ? Math.round(
                        (new Date(r.finished_at).getTime() -
                          new Date(r.started_at).getTime()) /
                          1000,
                      )
                    : null;
                return (
                  <tr key={r.id} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-2 whitespace-nowrap">
                      {new Date(r.started_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">
                      {r.trigger}
                    </td>
                    <td className="px-4 py-2 text-right">{r.tables_synced}</td>
                    <td className="px-4 py-2 text-right">{r.rows_synced}</td>
                    <td className="px-4 py-2 text-right">{r.files_synced}</td>
                    <td className="px-4 py-2 text-right">{r.auth_users_synced}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {dur !== null ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {dur}s
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-red-700 max-w-xs truncate" title={r.error ?? ""}>
                      {r.error ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    success: "bg-green-100 text-green-900 border-green-300",
    partial: "bg-yellow-100 text-yellow-900 border-yellow-300",
    failed: "bg-red-100 text-red-900 border-red-300",
    running: "bg-blue-100 text-blue-900 border-blue-300",
  };
  return (
    <Badge variant="outline" className={map[status] ?? ""}>
      {status}
    </Badge>
  );
}
