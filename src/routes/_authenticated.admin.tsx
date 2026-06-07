import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { LayoutGrid, BookOpen, FileText, FolderTree, Inbox, ListChecks, Users, LayoutTemplate, ShieldCheck, Mail, DatabaseBackup } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ location }) => {
    // Skip on SSR — auth session lives in localStorage and isn't available
    // during prerender. The client re-runs beforeLoad after hydration.
    if (typeof window === "undefined") {
      return { role: undefined };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.pathname + location.search + location.hash },
      });
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const list = (roles || []).map((r) => r.role);
    const isAdmin = list.includes("admin");
    const isModerator = list.includes("moderator");

    if (!isAdmin && !isModerator) {
      // Check if there are any admins in the system
      const { count } = await supabase
        .from("user_roles")
        .select("id", { count: "exact", head: true })
        .eq("role", "admin");

      if (count === 0) {
        if (location.pathname === "/admin" || location.pathname === "/admin/") {
          return { role: null };
        }
      }

      throw redirect({
        to: "/dashboard",
        replace: true,
      });
    }

    const role = isAdmin ? "admin" : "moderator";

    if (role === "moderator") {
      const allowedPaths = ["/admin/queue", "/admin/memberships"];
      const isPathAllowed = allowedPaths.some(
        (p) => location.pathname === p || location.pathname.startsWith(p + "/")
      );
      if (!isPathAllowed) {
        throw redirect({
          to: "/admin/queue",
          replace: true,
        });
      }
    }

    return { role };
  },
  component: AdminLayout,
  head: () => ({
    meta: [
      { title: "Admin — The Agriculture Popular Article Magazine" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://agriculturemagazine.in/admin" }],
  }),
});

type EditorRole = "admin" | "moderator";

const items: {
  to: string;
  label: string;
  icon: typeof LayoutGrid;
  exact?: boolean;
  roles: EditorRole[];
}[] = [
  { to: "/admin", label: "Overview", icon: LayoutGrid, exact: true, roles: ["admin"] },
  { to: "/admin/queue", label: "Queue", icon: ListChecks, roles: ["admin", "moderator"] },
  { to: "/admin/memberships", label: "Membership Claims", icon: ShieldCheck, roles: ["admin", "moderator"] },
  { to: "/admin/submissions", label: "Submissions", icon: Inbox, roles: ["admin"] },
  { to: "/admin/users", label: "Users & Roles", icon: Users, roles: ["admin"] },
  { to: "/admin/issues", label: "Issues", icon: BookOpen, roles: ["admin"] },
  { to: "/admin/articles", label: "Articles / Blogs", icon: FileText, roles: ["admin"] },
  { to: "/admin/categories", label: "Categories", icon: FolderTree, roles: ["admin"] },
  { to: "/admin/content", label: "Site Content", icon: LayoutTemplate, roles: ["admin"] },
  { to: "/admin/messages", label: "Messages", icon: Mail, roles: ["admin"] },
  { to: "/admin/backups", label: "Backups", icon: DatabaseBackup, roles: ["admin"] },
];

function AdminLayout() {
  const { role } = Route.useRouteContext() as { role: EditorRole | null | undefined };
  const path = useRouterState({ select: (s) => s.location.pathname });

  // On server rendering or before hydration completes, show checking access
  if (typeof window === "undefined" || role === undefined) {
    return (
      <>
        <SiteHeader />
        <main className="container-dashboard py-10 font-sans">
          <div className="py-20 text-center text-muted-foreground">Checking access…</div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const visibleItems = items.filter((it) => role && it.roles.includes(role));

  return (
    <>
      <SiteHeader />
      <main className="container-dashboard py-10 font-sans">
        <div className="flex items-end justify-between">
          <div>
            <div className="eyebrow">Editorial Console</div>
            <h1 className="font-display text-4xl mt-2 text-ink">
              {role === "moderator" ? "Editor" : "Admin"}
            </h1>
            {role && (
              <p className="text-xs uppercase tracking-widest text-orange mt-2">
                Signed in as {role}
              </p>
            )}
          </div>
          <Link
            to="/dashboard"
            className="text-xs uppercase tracking-wider text-foreground/60 hover:text-orange"
          >
            Back to dashboard
          </Link>
        </div>
        <div className="rule-thick mt-4" />

        {role === null ? (
          <div className="py-20 max-w-xl">
            <h2 className="font-display text-2xl text-ink">Access restricted</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Your account does not have editorial privileges. If this is the first run of the
              platform, an admin can be claimed from the{" "}
              <Link to="/admin" className="underline">
                Overview
              </Link>{" "}
              once available; otherwise contact an existing admin.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-12 gap-8">
            <aside className="col-span-12 md:col-span-3">
              <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
                {visibleItems.map((it) => {
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
