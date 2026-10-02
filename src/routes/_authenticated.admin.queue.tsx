import { createFileRoute } from "@tanstack/react-router";
import { QueueConsole } from "@/components/moderator/QueueConsole";

export const Route = createFileRoute("/_authenticated/admin/queue")({
  component: AdminQueue,
});

function AdminQueue() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Review queue</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Review submissions, move them between statuses, and leave editorial notes for authors.
      </p>
      <div className="mt-6">
        <QueueConsole />
      </div>
    </div>
  );
}
