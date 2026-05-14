import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LayoutGrid, BookOpen, FileText, FolderTree, Inbox } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin — The Agriculture Popular Article Magazine" }, { name: "robots", content: "noindex" }] }),
});

const items = [
  { to: "/admin", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/admin/issues", label: "Issues", icon: BookOpen },
  { to: "/admin/articles", label: "Articles", icon: FileText },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/submissions", label: "Submissions", icon: Inbox },
];

function AdminLayout() {
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { nav({ to: "/auth" }); return; }
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", data.session.user.id);
      const isAdmin = (roles || []).some((r) => r.role === "admin");
      setState(isAdmin ? "ok" : "denied");
    })();
  }, [nav]);

  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-10">
        <div className="flex items-end justify-between">
          <div>
            <div className="eyebrow">Editorial Console</div>
            <h1 className="font-display text-4xl mt-2 text-ink">Admin</h1>
          </div>
          <Link to="/dashboard" className="text-xs uppercase tracking-wider text-foreground/60 hover:text-orange">
            Back to dashboard
          </Link>
        </div>
        <div className="rule-thick mt-4" />

        {state === "loading" && <div className="py-20 text-center text-muted-foreground">Checking access…</div>}
        {state === "denied" && (
          <div className="py-20 max-w-xl">
            <h2 className="font-display text-2xl text-ink">Access restricted</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Your account does not have admin privileges. If this is the first run of the platform, an
              admin can be claimed from the <Link to="/admin" className="underline">Overview</Link> once
              available; otherwise contact an existing admin.
            </p>
          </div>
        )}

        {state === "ok" && (
          <div className="mt-8 grid grid-cols-12 gap-8">
            <aside className="col-span-12 md:col-span-3">
              <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
                {items.map((it) => {
                  const active = it.exact ? path === it.to : path.startsWith(it.to);
                  return (
                    <Link
                      key={it.to}
                      to={it.to}
                      className={`flex items-center gap-2 px-3 py-2.5 text-xs uppercase tracking-wider font-condensed border-l-2 transition-colors whitespace-nowrap ${
                        active
                          ? "border-orange text-navy bg-secondary/40"
                          : "border-transparent text-foreground/70 hover:text-orange"
                      }`}
                    >
                      <it.icon className="h-4 w-4" />
                      {it.label}
                    </Link>
                  );
                })}
              </nav>
            </aside>
            <section className="col-span-12 md:col-span-9 min-w-0">
              <Outlet />
            </section>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
