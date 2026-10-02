import { useQueryClient } from "@tanstack/react-query";

// Shared data layer for the admin pages. Every query goes through `db()` (or `dbCount()`),
// which turns Supabase errors into thrown errors and gives up after TIMEOUT_MS, so a stalled
// request shows an error with a Retry button instead of a page that never loads.
// Queries use react-query keys starting with "admin" so one refresh updates every page,
// including the sidebar badges.

const TIMEOUT_MS = 15_000;

type DbResult<T> = { data: T; error: { message: string } | null; count?: number | null };

function withTimeout<R>(q: PromiseLike<R>): Promise<R> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error("The server took too long to respond. Check your connection and retry.")),
      TIMEOUT_MS,
    );
  });
  return Promise.race([q, timeout]).finally(() => clearTimeout(timer));
}

export async function db<T>(q: PromiseLike<DbResult<T>>): Promise<NonNullable<T>> {
  const { data, error } = await withTimeout(q);
  if (error) throw new Error(error.message);
  return data as NonNullable<T>;
}

export async function dbCount(q: PromiseLike<DbResult<unknown>>): Promise<number> {
  const { count, error } = await withTimeout(q);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export const adminKey = (...parts: unknown[]) => ["admin", ...parts];

// Call after any admin change: refetches whatever admin data is on screen.
export function useAdminRefresh() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["admin"] });
}
