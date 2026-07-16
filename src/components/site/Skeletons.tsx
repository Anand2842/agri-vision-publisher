import { Skeleton } from "@/components/ui/skeleton";

/** Editorial-tone skeleton for a card in a "Recent Blogs"–style grid. */
export function ArticleCardSkeleton() {
  return (
    <article className="bg-white border border-rule flex flex-col">
      <Skeleton className="w-full aspect-video rounded-none bg-foreground/5" />
      <div className="p-6 flex flex-col gap-3 flex-1">
        <Skeleton className="h-3 w-20 bg-orange/15" />
        <Skeleton className="h-6 w-[92%] bg-foreground/10" />
        <Skeleton className="h-6 w-[70%] bg-foreground/10" />
        <div className="mt-1 space-y-1.5">
          <Skeleton className="h-3 w-32 bg-foreground/8" />
          <Skeleton className="h-3 w-40 bg-foreground/8" />
        </div>
        <div className="mt-2 space-y-1.5">
          <Skeleton className="h-3 w-full bg-foreground/8" />
          <Skeleton className="h-3 w-[85%] bg-foreground/8" />
          <Skeleton className="h-3 w-[60%] bg-foreground/8" />
        </div>
        <Skeleton className="mt-3 h-3 w-24 bg-orange/15" />
      </div>
    </article>
  );
}

/** Grid of article-card skeletons. */
export function ArticleGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-7">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Editorial-list row skeleton — used for search results, dashboard rows, ToC items. */
export function ListRowSkeleton() {
  return (
    <div className="py-6 border-b border-rule">
      <Skeleton className="h-3 w-16 bg-orange/15" />
      <Skeleton className="mt-2 h-5 w-[70%] bg-foreground/10" />
      <div className="mt-3 space-y-1.5">
        <Skeleton className="h-3 w-full bg-foreground/8" />
        <Skeleton className="h-3 w-[80%] bg-foreground/8" />
      </div>
      <Skeleton className="mt-3 h-3 w-40 bg-foreground/8" />
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <ul className="divide-y divide-[var(--color-rule)]">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <ListRowSkeleton />
        </li>
      ))}
    </ul>
  );
}

/** Compact submission row skeleton for the author dashboard. */
export function SubmissionRowSkeleton() {
  return (
    <li className="py-6 flex items-start justify-between gap-6">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-[55%] bg-foreground/10" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-3 w-24 bg-foreground/8" />
          <Skeleton className="h-3 w-20 bg-foreground/8" />
          <Skeleton className="h-3 w-16 bg-orange/15" />
        </div>
      </div>
      <Skeleton className="h-6 w-24 bg-foreground/10 shrink-0" />
    </li>
  );
}

/** Table-style row skeleton used in the admin submissions console. */
export function AdminSubmissionRowSkeleton({ zebra = false }: { zebra?: boolean }) {
  return (
    <li className={`p-5 ${zebra ? "bg-paper/50" : ""}`}>
      <div className="grid md:grid-cols-[1.6fr_1fr_auto_auto] gap-4 items-start">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-5 w-[80%] bg-foreground/10" />
          <Skeleton className="h-3 w-40 bg-foreground/8" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 bg-foreground/10" />
          <Skeleton className="h-3 w-40 bg-foreground/8" />
        </div>
        <Skeleton className="h-6 w-28 bg-foreground/8" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-20 bg-foreground/8 ml-auto" />
          <Skeleton className="h-3 w-16 bg-foreground/8 ml-auto" />
          <Skeleton className="h-4 w-20 bg-foreground/10 ml-auto" />
        </div>
      </div>
    </li>
  );
}

export function AdminSubmissionsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div>
      <div className="bg-secondary/50 border-b border-rule px-5 py-2 flex justify-between">
        <Skeleton className="h-3 w-40 bg-foreground/10" />
        <Skeleton className="h-3 w-24 bg-foreground/8" />
      </div>
      <ul className="divide-y divide-rule">
        {Array.from({ length: count }).map((_, i) => (
          <AdminSubmissionRowSkeleton key={i} zebra={i % 2 === 1} />
        ))}
      </ul>
    </div>
  );
}

/** Stat chip skeleton (matches the layout inside admin StatChip). */
export function StatChipSkeleton() {
  return (
    <div className="border border-rule bg-paper p-3 rounded-sm flex items-center gap-3">
      <Skeleton className="h-8 w-8 rounded-sm bg-foreground/10" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3 w-20 bg-foreground/8" />
        <Skeleton className="h-4 w-10 bg-foreground/12" />
      </div>
    </div>
  );
}

/** Small numeric stat card skeleton for the author dashboard. */
export function StatCardSkeleton() {
  return (
    <div className="border border-rule bg-paper p-6 rounded-sm space-y-3">
      <Skeleton className="h-3 w-24 bg-foreground/8" />
      <Skeleton className="h-8 w-16 bg-foreground/12" />
    </div>
  );
}
