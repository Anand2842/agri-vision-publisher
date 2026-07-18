import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useSiteContent } from "@/hooks/useSiteContent";
import { friendlyZodError } from "@/lib/form-errors";

const authSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (search) => authSearchSchema.parse(search),
  component: Auth,
  head: () => ({
    meta: [{ title: "Sign in — The Agriculture Popular Article Magazine" }],
    links: [{ rel: "canonical", href: "https://agriculturemagazine.in/auth" }],
  }),
});

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(72),
});

function Auth() {
  const { get: getHeader } = useSiteContent("header");
  const siteTitle =
    (getHeader("branding", "title_line1") || "The Agriculture") +
    " " +
    (getHeader("branding", "title_line2") || "Popular Article Magazine");
  const nav = useNavigate();
  const { redirect: redirectUrl } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [signUpPending, setSignUpPending] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z.string().min(8).max(72).safeParse(newPassword);
    if (!parsed.success) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated. You're signed in.");
      setRecoveryMode(false);
      nav({ to: redirectUrl || "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z.string().email().max(255).safeParse(resetEmail.trim());
    if (!parsed.success) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
        redirectTo: window.location.origin + "/auth",
      });
      if (error) throw error;
      setResetSent(true);
      toast.success("Password reset link sent. Please check your email.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Detect password recovery flow (from email link with #type=recovery)
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const isRecoveryHash = hash.includes("type=recovery");

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecoveryMode(true);
    });

    if (isRecoveryHash) {
      setRecoveryMode(true);
    } else {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) nav({ to: redirectUrl || "/dashboard" });
      });
    }

    return () => sub.subscription.unsubscribe();
  }, [nav, redirectUrl]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = { email: String(fd.get("email")), password: String(fd.get("password")) };
    const r = schema.safeParse(data);
    if (!r.success) {
      toast.error(friendlyZodError(r.error));
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

        // Detect if the email is already taken under Supabase Email Enumeration Prevention
        if (
          signUpData.user &&
          signUpData.user.identities &&
          signUpData.user.identities.length === 0
        ) {
          toast.error("An account with this email already exists. Please sign in instead.");
          setLoading(false);
          return;
        }

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

  if (recoveryMode) {
    return (
      <>
        <SiteHeader />
        <main id="main-content" className="container-editorial py-20 max-w-md">
          <div className="eyebrow">Account recovery</div>
          <h1 className="font-display text-2xl mt-3 text-ink">Set a new password</h1>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Choose a new password for your account. You'll be signed in automatically.
          </p>
          <form onSubmit={handleUpdatePassword} className="mt-8 space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 8 characters)"
                className="w-full h-10 bg-paper border border-rule px-4 pr-10 rounded-sm text-sm focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full h-10 bg-paper border border-rule px-4 pr-10 rounded-sm text-sm focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button
              disabled={loading}
              className="w-full h-10 flex justify-center items-center bg-primary text-primary-foreground px-6 rounded-sm text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (signUpPending) {
    return (
      <>
        <SiteHeader />
        <main id="main-content" className="container-editorial py-20 max-w-md text-center">
          <div className="eyebrow text-primary">Verification Required</div>
          <h1 className="font-display text-2xl mt-3 text-ink">Check your email</h1>
          <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
            We have sent a verification link to your email address. Please click the link to confirm
            your account and sign in.
          </p>
          <button
            onClick={() => setSignUpPending(false)}
            className="mt-8 w-full h-10 flex justify-center items-center bg-primary text-primary-foreground px-6 rounded-sm text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Back to Sign In
          </button>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (resetMode) {
    return (
      <>
        <SiteHeader />
        <main id="main-content" className="container-editorial py-20 max-w-md">
          <div className="eyebrow">Account recovery</div>
          <h1 className="font-display text-2xl mt-3 text-ink">Reset your password</h1>
          {resetSent ? (
            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              If an account exists for <strong>{resetEmail}</strong>, we've sent a password reset
              link. Please check your inbox (and spam folder).
            </p>
          ) : (
            <>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Enter the email associated with your account and we'll send you a secure link to set
                a new password.
              </p>
              <form onSubmit={handleReset} className="mt-8 space-y-4">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full h-10 bg-paper border border-rule px-4 rounded-sm text-sm focus:outline-none focus:border-primary"
                />
                <button
                  disabled={loading}
                  className="w-full h-10 flex justify-center items-center bg-primary text-primary-foreground px-6 rounded-sm text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
          <button
            onClick={() => {
              setResetMode(false);
              setResetSent(false);
            }}
            className="mt-6 text-sm text-primary hover:underline"
          >
            ← Back to sign in
          </button>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="container-editorial py-20 max-w-md">
        <div className="eyebrow">{mode === "signin" ? "Welcome back" : `Join ${siteTitle}`}</div>
        <h1 className="font-display text-2xl mt-3 text-ink">
          {mode === "signin" ? "Sign in" : "Create your account"}
        </h1>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          {mode === "signup" && (
            <input
              name="full_name"
              required
              autoComplete="name"
              placeholder="Full name *"
              className="w-full h-10 bg-paper border border-rule px-4 rounded-sm text-sm focus:outline-none focus:border-primary"
            />
          )}
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            className="w-full h-10 bg-paper border border-rule px-4 rounded-sm text-sm focus:outline-none focus:border-primary"
          />
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              minLength={8}
              placeholder="Password (min 8 characters)"
              className="w-full h-10 bg-paper border border-rule px-4 pr-10 rounded-sm text-sm focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button
            disabled={loading}
            className="w-full h-10 flex justify-center items-center bg-primary text-primary-foreground px-6 rounded-sm text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
          >
            {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <div className="mt-6 flex items-center justify-between text-sm">
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-primary hover:underline"
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
          {mode === "signin" && (
            <button
              onClick={() => setResetMode(true)}
              className="text-muted-foreground hover:text-orange hover:underline"
            >
              Forgot password?
            </button>
          )}
        </div>
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
