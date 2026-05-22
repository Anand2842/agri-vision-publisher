import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { useSiteContent } from "@/hooks/useSiteContent";

const authSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (search) => authSearchSchema.parse(search),
  component: Auth,
  head: () => ({ title: "Sign in — The Agriculture Popular Article Magazine" }),
});

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
});

function Auth() {
  const { get: getHeader } = useSiteContent("header");
  const siteTitle = (getHeader("branding", "title_line1") || "The Agriculture") + " " + (getHeader("branding", "title_line2") || "Popular Article Magazine");
  const nav = useNavigate();
  const { redirect: redirectUrl } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [signUpPending, setSignUpPending] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: redirectUrl || "/dashboard" });
    });
  }, [nav, redirectUrl]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = { email: String(fd.get("email")), password: String(fd.get("password")) };
    const r = schema.safeParse(data);
    if (!r.success) {
      toast.error(r.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: window.location.origin + (redirectUrl || "/dashboard"),
            data: { full_name: String(fd.get("full_name") || "") },
          },
        });
        if (error) throw error;
        
        if (!signUpData.session) {
          toast.success("Signup successful! Please check your email.");
          setSignUpPending(true);
          return;
        }

        toast.success("Account created");
        nav({ to: redirectUrl || "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword(data);
        if (error) throw error;
        nav({ to: redirectUrl || "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (signUpPending) {
    return (
      <>
        <SiteHeader />
        <main className="container-editorial py-20 max-w-md text-center">
          <div className="eyebrow text-primary">Verification Required</div>
          <h1 className="font-display text-4xl mt-3 text-ink">Check your email</h1>
          <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
            We have sent a verification link to your email address. Please click the link to confirm your account and sign in.
          </p>
          <button
            onClick={() => setSignUpPending(false)}
            className="mt-8 w-full bg-primary text-primary-foreground px-6 py-3 rounded-sm text-sm hover:bg-primary/90 transition-colors"
          >
            Back to Sign In
          </button>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-20 max-w-md">
        <div className="eyebrow">
          {mode === "signin" ? "Welcome back" : `Join ${siteTitle}`}
        </div>
        <h1 className="font-display text-4xl mt-3 text-ink">
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h1>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {mode === "signup" && (
            <input
              name="full_name"
              required
              placeholder="Full name *"
              className="w-full bg-paper border border-rule px-4 py-3 rounded-sm text-sm focus:outline-none focus:border-primary"
            />
          )}
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full bg-paper border border-rule px-4 py-3 rounded-sm text-sm focus:outline-none focus:border-primary"
          />
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Password (min 8 characters)"
            className="w-full bg-paper border border-rule px-4 py-3 rounded-sm text-sm focus:outline-none focus:border-primary"
          />
          <button
            disabled={loading}
            className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-sm text-sm hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 text-sm text-primary hover:underline"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
        <div className="mt-10 text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link to="/submission-guidelines" className="underline">
            terms
          </Link>
          .
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
