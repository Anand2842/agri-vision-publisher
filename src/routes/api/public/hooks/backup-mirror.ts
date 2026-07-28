import { createFileRoute } from "@tanstack/react-router";
import { performBackupMirror } from "@/lib/backup-logic";

export const Route = createFileRoute("/api/public/hooks/backup-mirror")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Authenticate with a dedicated server-only webhook secret.
        // The Supabase publishable key is public and must never gate this endpoint.
        const provided =
          request.headers.get("x-backup-secret") ??
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
          "";
        const expected = process.env.BACKUP_WEBHOOK_SECRET ?? "";
        const ok =
          expected.length > 0 &&
          provided.length === expected.length &&
          // constant-time-ish comparison
          provided.split("").reduce((acc, ch, i) => acc | (ch.charCodeAt(0) ^ expected.charCodeAt(i)), 0) === 0;
        if (!ok) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
        try {
          const result = await performBackupMirror("cron");
          return Response.json(result);
        } catch (e) {
          return new Response(
            JSON.stringify({
              error: e instanceof Error ? e.message : "Unknown error",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
