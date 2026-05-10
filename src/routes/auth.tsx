import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/auth")({
  component: Auth,
  head: () => ({ meta: [{ title: "Sign in — Agripop" }] }),
});

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
});

function Auth() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) nav({ to: "/dashboard" }); });
  }, [nav]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = { email: String(fd.get("email")), password: String(fd.get("password")) };
    const r = schema.safeParse(data);
    if (!r.success) { toast.error(r.error.issues[0].message); return; }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: String(fd.get("full_name") || "") } },
        });
        if (error) throw error;
        toast.success("Account created");
        nav({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword(data);
        if (error) throw error;
        nav({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-20 max-w-md">
        <div className="eyebrow">{mode === "signin" ? "Welcome back" : "Join Agripop"}</div>
        <h1 className="font-display text-4xl mt-3 text-ink">{mode === "signin" ? "Sign in" : "Create your account"}</h1>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {mode === "signup" && (
            <input name="full_name" placeholder="Full name" className="w-full bg-paper border border-rule px-4 py-3 rounded-sm text-sm focus:outline-none focus:border-primary" />
          )}
          <input name="email" type="email" required placeholder="Email" className="w-full bg-paper border border-rule px-4 py-3 rounded-sm text-sm focus:outline-none focus:border-primary" />
          <input name="password" type="password" required minLength={8} placeholder="Password (min 8 characters)" className="w-full bg-paper border border-rule px-4 py-3 rounded-sm text-sm focus:outline-none focus:border-primary" />
          <button disabled={loading} className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-sm text-sm hover:bg-primary/90 disabled:opacity-60">
            {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-6 text-sm text-primary hover:underline">
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
        <div className="mt-10 text-xs text-muted-foreground">
          By continuing you agree to our <Link to="/about" className="underline">terms</Link>.
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
