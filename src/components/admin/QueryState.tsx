import { AlertTriangle, Loader2, RotateCw } from "lucide-react";

// Loading / error placeholder for admin queries. Renders nothing once data is ready.
export function QueryState({
  query,
  label = "Loading…",
}: {
  query: { isPending: boolean; error: Error | null; refetch: () => unknown; isFetching: boolean };
  label?: string;
}) {
  if (query.error) {
    return (
      <div role="alert" className="p-8 text-center">
        <AlertTriangle className="mx-auto h-5 w-5 text-destructive" />
        <p className="mt-2 text-sm text-ink">Couldn't load this data.</p>
        <p className="mt-1 text-xs text-muted-foreground">{query.error.message}</p>
        <button
          onClick={() => query.refetch()}
          disabled={query.isFetching}
          className="mt-4 inline-flex items-center gap-1.5 border border-rule px-3 py-1.5 text-xs font-medium hover:border-orange disabled:opacity-50"
        >
          <RotateCw className={`h-3.5 w-3.5 ${query.isFetching ? "animate-spin" : ""}`} /> Retry
        </button>
      </div>
    );
  }
  if (query.isPending) {
    return (
      <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> {label}
      </div>
    );
  }
  return null;
}
