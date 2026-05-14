import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Author Dashboard — The Agriculture Popular Article Magazine" }] }),
});

type Submission = { id: string; title: string; status: string; plan: string; created_at: string };

function Dashboard() {
  const nav = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [subs, setSubs] = useState<Submission[] | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { nav({ to: "/auth" }); return; }
      setEmail(data.session.user.email ?? null);
      const { data: rows, error } = await supabase.from("submissions").select("id,title,status,plan,created_at").order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setSubs(rows || []);
    });
  }, [nav]);

  const total = subs?.length ?? 0;
  const pending = subs?.filter((s) => ["submitted", "under_review", "revision_requested"].includes(s.status)).length ?? 0;
  const published = subs?.filter((s) => s.status === "published").length ?? 0;

  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16">
        <div className="flex items-end justify-between">
          <div>
            <div className="eyebrow">Author Dashboard</div>
            <h1 className="font-display text-5xl mt-3 text-ink">Welcome back</h1>
            {email && <p className="text-sm text-muted-foreground mt-2">{email}</p>}
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); nav({ to: "/" }); }} className="text-sm text-foreground/70 hover:text-primary">Sign out</button>
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-6">
          <Stat label="Total submissions" value={total} />
          <Stat label="In review" value={pending} />
          <Stat label="Published" value={published} />
        </div>

        <section className="mt-16">
          <div className="eyebrow">My Submissions</div>
          <div className="rule-thick mt-3" />
          {subs === null ? (
            <div className="py-16 text-center text-muted-foreground">Loading…</div>
          ) : subs.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">No submissions yet.</p>
              <button onClick={() => nav({ to: "/submit" })} className="mt-5 bg-primary text-primary-foreground px-5 py-3 rounded-sm text-sm">Begin a submission</button>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-rule)]">
              {subs.map((s) => (
                <li key={s.id} className="py-6 flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <div className="font-display text-xl text-ink truncate">{s.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Ticket #{s.id.slice(0, 8).toUpperCase()} · {new Date(s.created_at).toLocaleDateString()} · {s.plan}
                    </div>
                  </div>
                  <StatusBadge status={s.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-paper border border-rule p-7">
      <div className="font-display text-5xl text-ink tabular-nums">{value}</div>
      <div className="eyebrow mt-3">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    submitted: "bg-secondary text-secondary-foreground",
    under_review: "bg-ochre/20 text-ink",
    revision_requested: "bg-destructive/15 text-destructive",
    approved: "bg-sage/20 text-ink",
    published: "bg-primary text-primary-foreground",
    rejected: "bg-destructive/15 text-destructive",
    draft: "bg-muted text-muted-foreground",
  };
  return <span className={`text-[0.65rem] uppercase tracking-widest px-3 py-1.5 rounded-sm shrink-0 ${map[status] || "bg-muted"}`}>{status.replace("_", " ")}</span>;
}
