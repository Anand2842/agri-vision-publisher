import { createFileRoute } from "@tanstack/react-router";
import { QueueConsole } from "@/components/moderator/QueueConsole";

export const Route = createFileRoute("/admin/queue")({
  component: AdminQueue,
});

function AdminQueue() {
  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl text-ink">Editorial Queue</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Review submissions, move them between statuses, and leave editorial notes for authors. No catalog edits.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <QueueConsole />
      </div>
    </div>
  );
}
