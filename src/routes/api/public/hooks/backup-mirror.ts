import { createFileRoute } from "@tanstack/react-router";
import { performBackupMirror } from "@/lib/backup-logic";

export const Route = createFileRoute("/api/public/hooks/backup-mirror")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Authenticate via apikey header (Supabase anon key, the pg_cron pattern)
        const apikey = request.headers.get("apikey");
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!expected || apikey !== expected) {
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
