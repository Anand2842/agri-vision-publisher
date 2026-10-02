import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavCounts, type CountKey } from "@/components/admin/useNavCounts";
import logo from "@/assets/logo.webp";
import {
  LayoutGrid,
  BookOpen,
  FileText,
  FolderTree,
  Inbox,
  ListChecks,
  Users,
  LayoutTemplate,
  ShieldCheck,
  Mail,
  DatabaseBackup,
  Menu,
  ExternalLink,
  LogOut,
  Loader2,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/_authenticated/admin")({
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
  badge?: CountKey;
  group: "Work" | "Publishing" | "Settings";
}[] = [
  { to: "/admin", label: "Inbox", icon: LayoutGrid, exact: true, roles: ["admin"], group: "Work" },
  { to: "/admin/queue", label: "Review queue", icon: ListChecks, roles: ["admin", "moderator"], badge: "review", group: "Work" },
  { to: "/admin/submissions", label: "Submissions", icon: Inbox, roles: ["admin"], badge: "ready", group: "Work" },
  { to: "/admin/memberships", label: "Membership claims", icon: ShieldCheck, roles: ["admin", "moderator"], badge: "claims", group: "Work" },
  { to: "/admin/messages", label: "Messages", icon: Mail, roles: ["admin"], badge: "messages", group: "Work" },
  { to: "/admin/issues", label: "Issues", icon: BookOpen, roles: ["admin"], group: "Publishing" },
  { to: "/admin/articles", label: "Articles", icon: FileText, roles: ["admin"], group: "Publishing" },
  { to: "/admin/categories", label: "Categories", icon: FolderTree, roles: ["admin"], group: "Publishing" },
  { to: "/admin/content", label: "Site content", icon: LayoutTemplate, roles: ["admin"], group: "Settings" },
  { to: "/admin/users", label: "Users & roles", icon: Users, roles: ["admin"], group: "Settings" },
  { to: "/admin/backups", label: "Backups", icon: DatabaseBackup, roles: ["admin"], group: "Settings" },
];

const BADGE_HINT: Record<CountKey, string> = {
  review: "awaiting review",
  ready: "approved, ready to publish",
  claims: "pending verification",
  messages: "received in the last 7 days",
};

function AdminLayout() {
  const { user, isAdmin, isModerator, loading, signOut } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const role: EditorRole | null = isAdmin ? "admin" : isModerator ? "moderator" : null;
  const counts = useNavCounts(role).data;

  useEffect(() => {
    if (!loading && typeof window !== "undefined") {
      if (!user) {
        navigate({
          to: "/auth",
          search: {
            redirect: window.location.pathname + window.location.search + window.location.hash,
          },
        });
      } else if (role === "moderator") {
        const allowedPaths = ["/admin/queue", "/admin/memberships"];
        const isPathAllowed = allowedPaths.some(
          (p) => window.location.pathname === p || window.location.pathname.startsWith(p + "/"),
        );
        if (!isPathAllowed) {
          navigate({
            to: "/admin/queue",
            replace: true,
          });
        }
      }
    }
  }, [user, role, loading, navigate]);

  // Close the mobile menu after navigating.
  useEffect(() => setMenuOpen(false), [path]);

  // On server rendering or while client auth is resolving, show checking access
  if (typeof window === "undefined" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2 bg-background font-sans text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking access…
      </div>
    );
  }

  if (role === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 font-sans">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl text-ink">Access restricted</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your account ({user?.email}) does not have editorial privileges. Ask an existing admin to
            grant you a role.
          </p>
          <div className="mt-6 flex justify-center gap-4 text-sm">
            <Link to="/dashboard" className="text-primary underline">
              Author dashboard
            </Link>
            <Link to="/" className="text-primary underline">
              Back to site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const visibleItems = items.filter((it) => it.roles.includes(role));
  const current = visibleItems.find((it) => (it.exact ? path === it.to : path.startsWith(it.to)));

  const nav = (
    <nav className="flex flex-col gap-5" aria-label="Admin navigation">
      {(["Work", "Publishing", "Settings"] as const).map((group) => {
        const groupItems = visibleItems.filter((it) => it.group === group);
        if (!groupItems.length) return null;
        return (
          <div key={group}>
            <div className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-white/45">
              {group}
            </div>
            <ul className="flex flex-col gap-0.5">
              {groupItems.map((it) => {
                const active = it === current;
                const n = it.badge ? (counts?.[it.badge] ?? 0) : 0;
                return (
                  <li key={it.to}>
                    <Link
                      to={it.to}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange ${
                        active
                          ? "bg-white/15 text-white font-medium"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <it.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{it.label}</span>
                      {n > 0 && it.badge && (
                        <span
                          title={`${n} ${BADGE_HINT[it.badge]}`}
                          className="min-w-5 rounded-full bg-orange px-1.5 text-center text-[11px] font-semibold leading-5 text-white tabular-nums"
                        >
                          {n}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );

  const sidebar = (
    <div className="flex h-full flex-col bg-navy text-white">
      <Link to={role === "admin" ? "/admin" : "/admin/queue"} className="flex items-center gap-2.5 px-5 py-4 border-b border-white/10">
        <img src={logo} alt="" width={32} height={32} className="h-8 w-8 rounded-sm bg-white/90 p-0.5" />
        <div className="leading-tight">
          <div className="text-sm font-semibold">Editorial Console</div>
          <div className="text-[11px] text-white/55 capitalize">{role}</div>
        </div>
      </Link>
      <div className="flex-1 overflow-y-auto px-2 py-4">{nav}</div>
      <div className="border-t border-white/10 px-2 py-3 text-sm">
        <a
          href="/"
          target="_blank"
          rel="noopener"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-white/75 hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" /> View site
        </a>
        <button
          onClick={async () => {
            await signOut();
            navigate({ to: "/" });
          }}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-white/75 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
        <div className="px-3 pt-2 text-[11px] text-white/45 truncate" title={user?.email}>
          {user?.email}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-sans md:pl-60">
      <aside className="hidden md:block fixed inset-y-0 left-0 w-60 z-30">{sidebar}</aside>

      <header className="md:hidden sticky top-0 z-20 flex items-center gap-3 border-b border-rule bg-paper px-4 py-2.5">
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <button aria-label="Open admin menu" className="rounded-md p-1.5 hover:bg-secondary">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 border-0">
            <SheetTitle className="sr-only">Admin navigation</SheetTitle>
            {sidebar}
          </SheetContent>
        </Sheet>
        <div className="text-sm font-semibold text-ink">{current?.label ?? "Admin"}</div>
      </header>

      <main className="px-4 py-6 md:px-8 md:py-8 max-w-[1400px]">
        <Outlet />
      </main>
    </div>
  );
}
