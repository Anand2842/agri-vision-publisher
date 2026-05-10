import { Link } from "@tanstack/react-router";
import { Search, Menu, X, Phone, Facebook, Instagram, Twitter, Mail, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const nav: { to: string; label: string; children?: { to: string; label: string }[] }[] = [
  { to: "/", label: "Home" },
  { to: "/editorial-board", label: "Editorial Board" },
  { to: "/current-issue", label: "Current Issue" },
  {
    to: "/archives",
    label: "Archives",
    children: [
      { to: "/archives", label: "Volume 5" },
      { to: "/archives", label: "Volume 4" },
      { to: "/archives", label: "Volume 3" },
      { to: "/archives", label: "Volume 2" },
      { to: "/archives", label: "Volume 1" },
    ],
  },
  {
    to: "/submission-guidelines",
    label: "Submission",
    children: [
      { to: "/submission-guidelines", label: "Author Guidelines" },
      { to: "/submit", label: "Submit Articles" },
    ],
  },
  {
    to: "/membership",
    label: "Publication",
    children: [
      { to: "/membership", label: "Publication Fees" },
      { to: "/membership", label: "Payment" },
    ],
  },
  { to: "/contact", label: "Advertise" },
  { to: "/about", label: "Events" },
  { to: "/current-issue", label: "Volume (05) Issue (07), Feb 2026" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-rule">
      {/* Utility bar */}
      <div className="bg-navy text-white text-xs">
        <div className="container-editorial flex items-center justify-between h-9">
          <a href="tel:+919928123930" className="flex items-center gap-2 text-brick font-medium">
            <Phone className="h-3.5 w-3.5" />
            +91-9928123930
          </a>
          <div className="flex items-center gap-5">
            <Link to="/" className="hover:text-orange transition-colors hidden sm:inline">Home</Link>
            <Link to="/about" className="hover:text-orange transition-colors hidden sm:inline">About</Link>
            <Link to="/contact" className="hover:text-orange transition-colors hidden sm:inline">Contact</Link>
            <span className="hidden sm:inline w-px h-4 bg-white/20" />
            <a href="#" aria-label="Facebook" className="hover:text-orange"><Facebook className="h-3.5 w-3.5" /></a>
            <a href="#" aria-label="Instagram" className="hover:text-orange"><Instagram className="h-3.5 w-3.5" /></a>
            <a href="#" aria-label="Twitter" className="hover:text-orange"><Twitter className="h-3.5 w-3.5" /></a>
            <a href="mailto:editor@theagriculturemagazine.com" aria-label="Email" className="hover:text-orange"><Mail className="h-3.5 w-3.5" /></a>
            <a href="#" className="hidden md:inline hover:text-orange ml-2">Researchgate</a>
          </div>
        </div>
      </div>

      {/* Logo + search + Special Issue */}
      <div className="container-editorial flex items-center justify-between gap-6 py-4 md:py-5">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="The Agriculture Magazine" width={140} height={140} className="h-14 md:h-20 w-auto" />
        </Link>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="hidden md:flex flex-1 max-w-md items-center border border-rule overflow-hidden"
        >
          <input
            type="search"
            placeholder="Search…"
            className="flex-1 px-4 py-2.5 text-sm bg-transparent focus:outline-none"
          />
          <button className="bg-orange text-white px-4 py-2.5 hover:brightness-105">
            <Search className="h-4 w-4" />
          </button>
        </form>

        <div className="flex items-center gap-2">
          {signedIn ? (
            <Link to="/dashboard" className="hidden md:inline-flex text-xs uppercase tracking-wider font-condensed text-foreground/70 hover:text-orange">
              Dashboard
            </Link>
          ) : (
            <Link to="/auth" className="hidden md:inline-flex text-xs uppercase tracking-wider font-condensed text-foreground/70 hover:text-orange">
              Sign in
            </Link>
          )}
          <Link to="/current-issue" className="btn-orange">Special Issue</Link>
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-navy" aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Dark navigation bar */}
      <nav className="bg-navy hidden lg:block">
        <div className="container-editorial flex flex-wrap items-stretch">
          {nav.map((n) => (
            <div key={n.label} className="relative group">
              <Link to={n.to} className="nav-link flex items-center gap-1">
                {n.label}
                {n.children && <ChevronDown className="h-3 w-3" />}
              </Link>
              {n.children && (
                <div className="absolute left-0 top-full hidden group-hover:block bg-navy border-t border-white/10 min-w-[220px] z-50 shadow-xl">
                  {n.children.map((c) => (
                    <Link
                      key={c.label}
                      to={c.to}
                      className="block px-5 py-3 text-xs uppercase tracking-wider font-condensed text-white/85 hover:text-orange hover:bg-white/5"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-rule bg-background">
          <form onSubmit={(e) => e.preventDefault()} className="container-editorial py-3 flex items-center border-b border-rule">
            <input type="search" placeholder="Search…" className="flex-1 px-3 py-2 text-sm bg-muted" />
            <button className="bg-orange text-white px-4 py-2 ml-2"><Search className="h-4 w-4" /></button>
          </form>
          <div className="container-editorial py-3 flex flex-col">
            {nav.map((n) => (
              <Link key={n.label} to={n.to} onClick={() => setOpen(false)} className="text-sm font-condensed uppercase tracking-wider py-2.5 border-b border-rule/60 text-navy hover:text-orange">
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
