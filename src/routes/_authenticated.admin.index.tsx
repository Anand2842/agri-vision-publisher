import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const [counts, setCounts] = useState({ issues: 0, articles: 0, submissions: 0, categories: 0 });
  const [hasAnyAdmin, setHasAnyAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const [iss, art, sub, cat, adm] = await Promise.all([
        supabase.from("issues").select("id", { count: "exact", head: true }),
        supabase.from("articles").select("id", { count: "exact", head: true }),
        supabase.from("submissions").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase
          .from("user_roles")
          .select("id", { count: "exact", head: true })
          .eq("role", "admin"),
      ]);
      setCounts({
        issues: iss.count ?? 0,
        articles: art.count ?? 0,
        submissions: sub.count ?? 0,
        categories: cat.count ?? 0,
      });
      setHasAnyAdmin((adm.count ?? 0) > 0);
    })();
  }, []);

  const claim = async () => {
    const { data, error } = await supabase.rpc("claim_admin_if_none");
    if (error) return toast.error(error.message);
    if (data) {
      toast.success("Admin claimed. Reload to see admin tools.");
      setTimeout(() => location.reload(), 800);
    } else toast.error("An admin already exists.");
  };

  return (
    <div className="space-y-10">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Issues" value={counts.issues} to="/admin/issues" />
        <Stat label="Articles" value={counts.articles} to="/admin/articles" />
        <Stat label="Submissions" value={counts.submissions} to="/admin/submissions" />
        <Stat label="Categories" value={counts.categories} to="/admin/categories" />
      </div>

      {hasAnyAdmin === false && (
        <div className="border border-orange/40 bg-orange/5 p-6">
          <div className="eyebrow text-orange">First run</div>
          <h3 className="font-display text-xl text-ink mt-2">Claim admin access</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl">
            No admin exists yet. As the signed-in user you can promote yourself once. After this the
            action is permanently disabled and only existing admins can grant the role.
          </p>
          <button
            onClick={claim}
            className="mt-4 bg-navy text-white px-5 py-2.5 text-xs uppercase tracking-wider"
          >
            Claim admin
          </button>
        </div>
      )}

      <div>
        <div className="eyebrow">Quick links</div>
        <div className="rule-thick mt-3" />
        <ul className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
          <li>
            <Link to="/admin/issues" className="text-navy hover:text-orange">
              → Create the next issue
            </Link>
          </li>
          <li>
            <Link to="/admin/articles" className="text-navy hover:text-orange">
              → Publish an article + upload PDF
            </Link>
          </li>
          <li>
            <Link to="/admin/submissions" className="text-navy hover:text-orange">
              → Review pending submissions
            </Link>
          </li>
          <li>
            <Link to="/admin/categories" className="text-navy hover:text-orange">
              → Manage categories
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value, to }: { label: string; value: number; to: string }) {
  return (
    <Link
      to={to}
      className="block bg-paper border border-rule p-5 hover:border-orange transition-colors"
    >
      <div className="font-display text-4xl text-ink tabular-nums">{value}</div>
      <div className="eyebrow mt-2">{label}</div>
    </Link>
  );
}
