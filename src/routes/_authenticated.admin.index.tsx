import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { adminKey, db, dbCount } from "@/lib/adminQuery";
import { useNavCounts } from "@/components/admin/useNavCounts";
import { QueryState } from "@/components/admin/QueryState";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminInbox,
});

const LIMIT = 6;
const STALE_DAYS = 7;

type SubRow = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  salutation: string | null;
  author_name: string | null;
  guest_name: string | null;
};

const subName = (s: SubRow) =>
  [s.salutation, s.author_name || s.guest_name].filter(Boolean).join(" ") || "Registered author";

// The admin home page: what is waiting for an editor, oldest first.
function AdminInbox() {
  const counts = useNavCounts("admin").data;

  const review = useQuery({
    queryKey: adminKey("inbox", "review"),
    queryFn: () =>
      db(
        supabase
          .from("submissions")
          .select("id,title,status,created_at,salutation,author_name,guest_name")
          .in("status", ["submitted", "under_review"])
          .order("created_at", { ascending: true })
          .limit(LIMIT),
      ),
  });

  const ready = useQuery({
    queryKey: adminKey("inbox", "ready"),
    queryFn: () =>
      db(
        supabase
          .from("submissions")
          .select("id,title,status,created_at,salutation,author_name,guest_name")
          .eq("status", "approved")
          .order("created_at", { ascending: true })
          .limit(LIMIT),
      ),
  });

  const claims = useQuery({
    queryKey: adminKey("inbox", "claims"),
    queryFn: async () => {
      const rows = await db(
        supabase
          .from("membership_payments")
          .select("id,user_id,plan,amount,transaction_ref,created_at")
          .eq("status", "pending")
          .order("created_at", { ascending: true })
          .limit(LIMIT),
      );
      const ids = [...new Set(rows.map((r) => r.user_id))];
      const profiles = ids.length
        ? await db(supabase.from("profiles").select("id,full_name").in("id", ids))
        : [];
      const names = Object.fromEntries(profiles.map((p) => [p.id, p.full_name]));
      return rows.map((r) => ({ ...r, name: names[r.user_id] || "Unnamed member" }));
    },
  });

  const messages = useQuery({
    queryKey: adminKey("inbox", "messages"),
    queryFn: () =>
      db(
        supabase
          .from("contact_messages")
          .select("id,name,subject,created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ),
  });

  const totals = useQuery({
    queryKey: adminKey("inbox", "totals"),
    queryFn: async () => {
      const head = { count: "exact" as const, head: true };
      const [articles, issues, latest] = await Promise.all([
        dbCount(supabase.from("articles").select("id", head).eq("status", "published")),
        dbCount(supabase.from("issues").select("id", head)),
        db(
          supabase
            .from("issues")
            .select("volume,issue_number,title")
            .order("volume", { ascending: false })
            .order("issue_number", { ascending: false })
            .limit(1),
        ),
      ]);
      return { articles, issues, latest: latest[0] ?? null };
    },
  });

  const pending = (counts?.review ?? 0) + (counts?.ready ?? 0) + (counts?.claims ?? 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Inbox</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {counts === undefined
              ? "Checking what needs attention…"
              : pending === 0
                ? "Nothing is waiting for you."
                : `${pending} item${pending === 1 ? "" : "s"} waiting for an editor, oldest first.`}
          </p>
        </div>
        {totals.data && (
          <div className="text-xs text-muted-foreground">
            {totals.data.articles} published articles · {totals.data.issues} issues
            {totals.data.latest &&
              ` · latest: Vol ${totals.data.latest.volume}, Issue ${totals.data.latest.issue_number}`}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel
          title="Submissions to review"
          count={counts?.review}
          to="/admin/queue"
          query={review}
          empty="No submissions waiting for review."
        >
          {review.data?.map((s) => (
            <Row
              key={s.id}
              to="/admin/queue"
              title={s.title}
              meta={`${subName(s)} · ${s.status.replace(/_/g, " ")}`}
              date={s.created_at}
            />
          ))}
        </Panel>

        <Panel
          title="Approved, ready to publish"
          count={counts?.ready}
          to="/admin/submissions"
          query={ready}
          empty="No approved submissions waiting to be published."
        >
          {ready.data?.map((s) => (
            <Row key={s.id} to="/admin/submissions" title={s.title} meta={subName(s)} date={s.created_at} />
          ))}
        </Panel>

        <Panel
          title="Membership claims to verify"
          count={counts?.claims}
          to="/admin/memberships"
          query={claims}
          empty="No membership claims waiting."
        >
          {claims.data?.map((c) => (
            <Row
              key={c.id}
              to="/admin/memberships"
              title={c.name}
              meta={`${c.plan} plan · ₹${c.amount} · ref ${c.transaction_ref}`}
              date={c.created_at}
            />
          ))}
        </Panel>

        <Panel
          title="Recent messages"
          count={counts?.messages}
          countHint="this week"
          to="/admin/messages"
          query={messages}
          empty="No messages yet."
        >
          {messages.data?.map((m) => (
            <Row key={m.id} to="/admin/messages" title={m.subject} meta={m.name} date={m.created_at} fresh />
          ))}
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  count,
  countHint,
  to,
  query,
  empty,
  children,
}: {
  title: string;
  count?: number;
  countHint?: string;
  to: string;
  query: Parameters<typeof QueryState>[0]["query"] & { data?: unknown[] };
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-rule bg-paper">
      <header className="flex items-center justify-between gap-3 border-b border-rule px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">
          {title}
          {count !== undefined && count > 0 && (
            <span className="ml-2 rounded-full bg-orange/15 px-2 py-0.5 text-xs font-semibold text-orange tabular-nums">
              {count}
              {countHint ? ` ${countHint}` : ""}
            </span>
          )}
        </h2>
        <Link to={to} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-orange">
          Open <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>
      <QueryState query={query} />
      {query.data &&
        (query.data.length === 0 ? (
          <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {empty}
          </div>
        ) : (
          <ul className="divide-y divide-rule">{children}</ul>
        ))}
    </section>
  );
}

function Row({
  to,
  title,
  meta,
  date,
  fresh = false,
}: {
  to: string;
  title: string;
  meta: string;
  date: string;
  // Messages are listed newest first, so age isn't a warning there.
  fresh?: boolean;
}) {
  const old = !fresh && Date.now() - new Date(date).getTime() > STALE_DAYS * 864e5;
  return (
    <li>
      <Link to={to} className="flex items-start justify-between gap-4 px-4 py-2.5 hover:bg-secondary/40">
        <div className="min-w-0">
          <div className="truncate text-sm text-ink">{title}</div>
          <div className="truncate text-xs text-muted-foreground">{meta}</div>
        </div>
        <span
          className={`shrink-0 text-xs tabular-nums ${old ? "font-medium text-amber-700" : "text-muted-foreground"}`}
          title={new Date(date).toLocaleString()}
        >
          {formatDistanceToNow(new Date(date), { addSuffix: true })}
        </span>
      </Link>
    </li>
  );
}
