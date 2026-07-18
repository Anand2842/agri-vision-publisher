import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Search,
  Menu,
  X,
  Phone,
  Mail,
  ChevronDown,
  Home,
  Info,
  Users,
  BookOpen,
  Archive,
  FileText,
  Send,
  Award,
  Rocket,
  Megaphone,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGlobalSiteContent } from "@/hooks/useSiteContent";
import logo from "@/assets/logo.png";
import { z } from "zod";

const NavItemSchema = z.object({
  to: z.string().optional(),
  href: z.string().optional(),
  label: z.string(),
  children: z
    .array(
      z.object({
        to: z.string().optional(),
        href: z.string().optional(),
        label: z.string(),
      }),
    )
    .optional(),
});

const NavSchema = z.array(NavItemSchema);

type NavLeaf = { to: string; label: string; description?: string };
type NavItem = { to: string; label: string; description?: string; children?: NavLeaf[] };

const defaultNav: NavItem[] = [
  { to: "/", label: "Home", description: "Latest from the magazine" },
  { to: "/about", label: "About", description: "Our mission & story" },
  { to: "/editorial-board", label: "Editorial", description: "Meet the board" },
  { to: "/current-issue", label: "Current Issue", description: "This month's edition" },
  { to: "/archives", label: "Archives", description: "Browse every back issue" },
  {
    to: "/submission-guidelines",
    label: "Submission",
    children: [
      {
        to: "/submission-guidelines",
        label: "Author Guidelines",
        description: "Format, scope & review process",
      },
      { to: "/submit", label: "Submit Article", description: "Start a new manuscript" },
    ],
  },
  { to: "/membership", label: "Membership", description: "Join the community" },
  {
    to: "/startup-spotlight",
    label: "Resources",
    children: [
      {
        to: "/startup-spotlight",
        label: "Startup Spotlight",
        description: "Agri-ventures to watch",
      },
      { to: "/advertise", label: "Advertise", description: "Reach our readership" },
      { to: "/contact", label: "Contact", description: "Get in touch" },
    ],
  },
];

const iconFor = (label: string) => {
  const key = label.toLowerCase();
  if (key.includes("home")) return Home;
  if (key.includes("about")) return Info;
  if (key.includes("editor")) return Users;
  if (key.includes("current")) return BookOpen;
  if (key.includes("archive")) return Archive;
  if (key.includes("guideline")) return FileText;
  if (key.includes("submit")) return Send;
  if (key.includes("submission")) return FileText;
  if (key.includes("member")) return Award;
  if (key.includes("startup") || key.includes("spotlight")) return Rocket;
  if (key.includes("advertise")) return Megaphone;
  if (key.includes("contact")) return MessageCircle;
  if (key.includes("resource")) return Sparkles;
  return Sparkles;
};

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [editorRole, setEditorRole] = useState<"admin" | "moderator" | "author" | null>(null);
  const [q, setQ] = useState("");
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const navigate = useNavigate();
  const { getHeader, getHeaderJson, getFooter } = useGlobalSiteContent();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const rawNav = getHeaderJson("navigation", "items");
  const navResult = rawNav ? NavSchema.safeParse(rawNav) : null;
  const cmsNav: NavItem[] | null = navResult?.success
    ? navResult.data.map((item) => ({
        to: item.href || item.to || "/",
        label: item.label,
        children: item.children?.map((child) => ({
          to: child.href || child.to || "/",
          label: child.label,
        })),
      }))
    : null;

  const currentNav: NavItem[] = cmsNav ?? defaultNav;

  const isActive = (to: string) => {
    if (to === "/") return pathname === "/";
    return pathname === to || pathname.startsWith(to + "/");
  };
  const isGroupActive = (n: NavItem) =>
    isActive(n.to) || (n.children?.some((c) => isActive(c.to)) ?? false);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    navigate({ to: "/search", search: term ? { q: term } : {} });
    setOpen(false);
  };

  useEffect(() => {
    const loadRole = async (userId: string | null) => {
      if (!userId) {
        setEditorRole(null);
        return;
      }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
      const list = (data || []).map((r) => r.role);
      if (list.includes("admin")) setEditorRole("admin");
      else if (list.includes("moderator")) setEditorRole("moderator");
      else if (list.includes("author")) setEditorRole("author");
      else setEditorRole(null);
    };
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(!!data.session);
      loadRole(data.session?.user.id ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSignedIn(!!s);
      loadRole(s?.user.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-rule">
      {/* Skip-to-content — visible on keyboard focus only */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-navy focus:text-white focus:rounded-sm focus:outline-none focus:ring-2 focus:ring-orange"
      >
        Skip to main content
      </a>

      {/* ISSN identification strip — visible globally, required by ISSN India */}
      <div className="bg-primary/[0.06] border-b border-primary/10 py-1 text-center">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-foreground/50 font-sans">
          {getHeader("branding", "title_line1") || "The Agriculture"}{" "}
          {getHeader("branding", "title_line2") || "Popular Article Magazine"} ·{" "}
          <span className="text-[oklch(var(--orange))]">
            {getFooter("legal", "eissn")
              ? `E-ISSN: ${getFooter("legal", "eissn")}`
              : getFooter("legal", "pissn")
                ? `ISSN: ${getFooter("legal", "pissn")}`
                : "ISSN: Applied for"}
          </span>{" "}
          · Published Monthly · Online · India
        </span>
      </div>

      {/* Utility bar */}
      <div className="bg-navy text-white text-xs">
        <div className="container-editorial flex items-center justify-between min-h-[44px]">
          <a
            href={`tel:${getHeader("topbar", "phone")}`}
            className="flex items-center gap-2 text-orange font-medium"
          >
            <Phone className="h-3.5 w-3.5" />
            {getHeader("topbar", "phone")}
          </a>
          <div className="flex items-center gap-5">
            <Link to="/" className="hover:text-orange transition-colors hidden sm:inline">
              Home
            </Link>
            <Link to="/about" className="hover:text-orange transition-colors hidden sm:inline">
              About
            </Link>
            <Link to="/contact" className="hover:text-orange transition-colors hidden sm:inline">
              Contact
            </Link>
            <span className="hidden sm:inline w-px h-4 bg-white/20" />
            <a
              href={`mailto:${getHeader("topbar", "email")}`}
              aria-label="Email"
              className="hover:text-orange flex items-center gap-1.5"
            >
              <Mail className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{getHeader("topbar", "email")}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Logo + search + Special Issue */}
      <div className="container-editorial flex items-center justify-between gap-6 py-3 md:py-4">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img
            src={getHeader("branding", "logo_url") || logo}
            alt={
              (getHeader("branding", "title_line1") || "The Agriculture") +
              " " +
              (getHeader("branding", "title_line2") || "Popular Article Magazine")
            }
            width={140}
            height={140}
            className="h-10 md:h-14 w-auto"
          />
          <div className="hidden sm:block leading-tight">
            <div className="font-display font-bold text-navy text-base md:text-lg">
              {getHeader("branding", "title_line1") || "The Agriculture"}
            </div>
            <div className="font-display font-bold text-navy text-base md:text-lg -mt-1">
              {getHeader("branding", "title_line2") || "Popular Article Magazine"}
            </div>
            <div className="text-xs uppercase tracking-[0.18em] text-orange font-semibold mt-1">
              {getHeader("branding", "tagline")}
            </div>
          </div>
        </Link>

        <form
          onSubmit={submitSearch}
          className="hidden md:flex flex-1 min-w-[260px] max-w-[560px] h-12 items-center border-2 border-rule focus-within:border-orange overflow-hidden bg-paper rounded-sm"
        >
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search articles, authors, topics…"
            aria-label="Search the magazine"
            className="flex-1 px-4 h-full text-base bg-transparent focus:outline-none placeholder:text-foreground/50"
          />
          <button
            type="submit"
            aria-label="Search"
            className="bg-orange text-white px-5 h-full flex items-center justify-center hover:brightness-105 shrink-0"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
        </form>

        <div className="flex items-center gap-2">
          {editorRole && (
            <Link
              to="/admin/queue"
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 border border-orange/40 bg-orange/10 text-xs uppercase tracking-[0.18em] font-condensed font-semibold text-orange hover:bg-orange hover:text-white transition-colors"
              title={`Signed in as ${editorRole}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-orange" />
              {editorRole}
            </Link>
          )}
          {signedIn ? (
            <Link
              to="/dashboard"
              className="hidden md:inline-flex text-xs uppercase tracking-wider font-condensed text-foreground/70 hover:text-orange"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/auth"
              className="hidden md:inline-flex text-xs uppercase tracking-wider font-condensed text-foreground/70 hover:text-orange"
            >
              Sign in
            </Link>
          )}
          <Link to="/current-issue" className="btn-orange">
            Current Issue
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-3 text-navy transition-transform duration-200 active:scale-90"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Desktop primary navigation */}
      <nav className="bg-navy hidden lg:block border-t border-white/5 shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)]">
        <div className="container-editorial flex items-stretch justify-between gap-1">
          <ul className="flex items-stretch flex-wrap">
            {currentNav.map((n) => {
              const Icon = iconFor(n.label);
              const active = isGroupActive(n);
              const hasChildren = !!n.children?.length;
              return (
                <li key={n.label} className="relative group">
                  <Link
                    to={n.to}
                    tabIndex={hasChildren ? 0 : undefined}
                    onKeyDown={
                      hasChildren
                        ? (e) => {
                            if (e.key === "Escape") {
                              (e.currentTarget as HTMLElement).blur();
                            }
                          }
                        : undefined
                    }
                    className={`relative flex items-center gap-1.5 px-4 py-4 font-condensed uppercase tracking-[0.08em] text-xs font-medium transition-colors duration-200 ${
                      active ? "text-orange" : "text-white/90 hover:text-orange"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 opacity-80 group-hover:opacity-100" />
                    <span>{n.label}</span>
                    {hasChildren && (
                      <ChevronDown className="h-3 w-3 opacity-70 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180 motion-safe:transition-transform motion-reduce:transition-none" />
                    )}
                    {/* Animated underline */}
                    <span
                      className={`pointer-events-none absolute left-3 right-3 bottom-0 h-[2px] bg-orange origin-left transition-transform duration-300 motion-reduce:transition-none ${
                        active
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100 group-focus-within:scale-x-100"
                      }`}
                    />
                  </Link>
                  {hasChildren && (
                    <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-200 absolute left-0 top-full z-50 min-w-[320px] bg-background text-foreground border border-rule shadow-2xl">
                      <div className="h-1 bg-orange" />
                      <ul className="py-2">
                        {n.children!.map((c) => {
                          const CIcon = iconFor(c.label);
                          const cActive = isActive(c.to);
                          return (
                            <li key={c.label}>
                              <Link
                                to={c.to}
                                className={`flex items-start gap-3 px-4 py-3 hover:bg-secondary/60 transition-colors ${
                                  cActive ? "bg-secondary/50" : ""
                                }`}
                              >
                                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-orange/10 text-orange">
                                  <CIcon className="h-4 w-4" />
                                </span>
                                <span className="flex flex-col">
                                  <span className="font-condensed uppercase tracking-wider text-[12px] font-semibold text-navy">
                                    {c.label}
                                  </span>
                                  {c.description && (
                                    <span className="text-[12px] text-muted-foreground leading-snug mt-0.5">
                                      {c.description}
                                    </span>
                                  )}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <Link
            to="/submit"
            className="hidden xl:inline-flex items-center gap-1.5 px-4 py-4 font-condensed uppercase tracking-[0.08em] text-[12px] font-semibold text-navy bg-orange hover:brightness-110 transition"
          >
            <Send className="h-3.5 w-3.5" />
            Submit Article
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-rule bg-background">
          <form
            onSubmit={submitSearch}
            className="container-editorial py-3 flex items-center border-b border-rule"
          >
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="flex-1 px-4 h-12 text-base bg-muted focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="bg-orange text-white px-4 h-12 ml-2 flex items-center justify-center hover:brightness-105"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
          </form>
          <div className="container-editorial py-3 flex flex-col">
            {currentNav.map((n) => {
              const Icon = iconFor(n.label);
              const hasChildren = !!n.children?.length;
              const groupOpen = openMobileGroup === n.label;
              const active = isGroupActive(n);
              return (
                <div key={n.label} className="flex flex-col border-b border-rule/60">
                  {hasChildren ? (
                    <button
                      onClick={() => setOpenMobileGroup(groupOpen ? null : n.label)}
                      className={`flex items-center justify-between gap-2 py-3 text-left font-condensed uppercase tracking-wider text-sm ${
                        active ? "text-orange" : "text-navy"
                      }`}
                      aria-expanded={groupOpen}
                      aria-controls={`mobile-group-${n.label.replace(/\s+/g, "-")}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 opacity-70" />
                        {n.label}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${groupOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  ) : (
                    <Link
                      to={n.to}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2.5 py-3 font-condensed uppercase tracking-wider text-sm hover:text-orange ${
                        active ? "text-orange" : "text-navy"
                      }`}
                    >
                      <Icon className="h-4 w-4 opacity-70" />
                      {n.label}
                    </Link>
                  )}
                  {hasChildren && groupOpen && (
                    <div
                      id={`mobile-group-${n.label.replace(/\s+/g, "-")}`}
                      className="pl-7 pb-2 flex flex-col"
                    >
                      {n.children!.map((c) => {
                        const CIcon = iconFor(c.label);
                        return (
                          <Link
                            key={c.label}
                            to={c.to}
                            onClick={() => setOpen(false)}
                            className="flex items-start gap-2.5 py-2 text-foreground/80 hover:text-orange"
                          >
                            <CIcon className="h-3.5 w-3.5 mt-1 text-orange/80" />
                            <span className="flex flex-col">
                              <span className="text-xs uppercase tracking-wider font-condensed font-semibold">
                                {c.label}
                              </span>
                              {c.description && (
                                <span className="text-xs text-muted-foreground leading-snug">
                                  {c.description}
                                </span>
                              )}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            <Link
              to="/submit"
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex items-center justify-center gap-2 bg-orange text-white py-3 font-condensed uppercase tracking-wider text-sm hover:brightness-110"
            >
              <Send className="h-4 w-4" />
              Submit Article
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
