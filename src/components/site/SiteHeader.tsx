import { Link } from "@tanstack/react-router";
import { Search, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/", label: "Home" },
  { to: "/current-issue", label: "Current Issue" },
  { to: "/archives", label: "Archives" },
  { to: "/editorial-board", label: "Editorial Board" },
  { to: "/submission-guidelines", label: "Submit" },
  { to: "/membership", label: "Membership" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled ? "bg-paper/95 backdrop-blur border-b border-rule" : "bg-paper border-b border-transparent"
      }`}
    >
      <div className="container-editorial flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-sm bg-primary flex items-center justify-center">
            <span className="font-display text-primary-foreground text-lg leading-none">A</span>
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="font-display text-base text-ink">Agripop</div>
            <div className="eyebrow text-[0.55rem]">The Agriculture Popular Magazine</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-[0.82rem] tracking-wide text-foreground/80 hover:text-primary transition-colors"
              activeProps={{ className: "text-primary font-medium" }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/search" aria-label="Search" className="p-2 hover:text-primary">
            <Search className="h-4 w-4" />
          </Link>
          {signedIn ? (
            <Link to="/dashboard" className="hidden md:inline-flex text-[0.82rem] px-3 py-1.5 rounded-sm border border-foreground/20 hover:border-primary hover:text-primary">
              Dashboard
            </Link>
          ) : (
            <Link to="/auth" className="hidden md:inline-flex text-[0.82rem] text-foreground/80 hover:text-primary">
              Sign in
            </Link>
          )}
          <Link to="/submit" className="hidden md:inline-flex text-[0.82rem] bg-primary text-primary-foreground px-4 py-2 rounded-sm hover:bg-primary/90 transition-colors">
            Submit Article
          </Link>
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-rule bg-paper">
          <div className="container-editorial py-4 flex flex-col gap-3">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="text-sm py-1">
                {n.label}
              </Link>
            ))}
            <Link to="/submit" onClick={() => setOpen(false)} className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-sm text-center mt-2">
              Submit Article
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
