import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
    meta: [
      { title: "Sign in — The Agriculture Popular Article Magazine" },
      { name: "description", content: "Sign in or reset your password for The Agriculture Popular Article Magazine." },
      { property: "og:title", content: "Sign in — The Agriculture Popular Article Magazine" },
      { property: "og:description", content: "Access your account at The Agriculture Popular Article Magazine." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://agriculturemagazine.in/auth" }],
  }),
});

const signInSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

const signUpSchema = signInSchema.extend({
  full_name: z.string().trim().min(1, "Full name is required").max(120),
});

type Screen =
  | "signin"
  | "signup"
  | "forgot-email"   // Request a password-reset link
  | "forgot-sent"    // Link request confirmation
  | "signup-pending" // Email confirmation pending
  | "recovery";      // Arrived via password-reset link

function Auth() {
  const { get: getHeader } = useSiteContent("header");
  const siteTitle =
    (getHeader("branding", "title_line1") || "The Agriculture") +
    " " +
    (getHeader("branding", "title_line2") || "Popular Article Magazine");
  const { redirect: redirectUrl } = Route.useSearch();

  const [screen, setScreen] = useState<Screen>("signin");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);

  const [resetEmail, setResetEmail] = useState("");
  const [recoveryNewPw, setRecoveryNewPw] = useState("");
  const [recoveryConfirmPw, setRecoveryConfirmPw] = useState("");

  const err = (msg: string) => {
    setErrorMsg(msg);
    toast.error(msg);
  };

  const clearErr = () => setErrorMsg(null);

  // ─── Check if already signed in or arriving via password-reset link ───
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setScreen("recovery");
    });

    if (hash.includes("type=recovery")) {
      setScreen("recovery");
    } else {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          window.location.href = redirectUrl || "/dashboard";
        }
      });
    }

    return () => sub.subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Sign In ───
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearErr();
    const fd = new FormData(e.currentTarget);
    const raw = { email: String(fd.get("email")).trim(), password: String(fd.get("password")) };
    const r = signInSchema.safeParse(raw);
    if (!r.success) { err(friendlyZodError(r.error)); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(r.data);
      if (error) {
        // Give a clear actionable message
        if (
          error.message?.toLowerCase().includes("invalid login") ||
          error.message?.toLowerCase().includes("invalid credentials")
        ) {
          err("Incorrect password. Use 'Forgot password?' below to reset it.");
        } else if (error.message?.toLowerCase().includes("email not confirmed")) {
          err("Please confirm your email first. Check your inbox for the confirmation email.");
        } else {
          err(error.message);
        }
        return;
      }
      toast.success("Signed in!");
      window.location.href = redirectUrl || "/dashboard";
    } finally {
      setLoading(false);
    }
  };

  // ─── Sign Up ───
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearErr();
    const fd = new FormData(e.currentTarget);
    const raw = {
      email: String(fd.get("email")).trim(),
      password: String(fd.get("password")),
      full_name: String(fd.get("full_name") || "").trim(),
    };
    const r = signUpSchema.safeParse(raw);
    if (!r.success) { err(friendlyZodError(r.error)); return; }

    setLoading(true);
    try {
      const { data: sd, error } = await supabase.auth.signUp({
        email: r.data.email,
        password: r.data.password,
        options: {
          emailRedirectTo: window.location.origin + (redirectUrl || "/dashboard"),
          data: { full_name: r.data.full_name },
        },
      });
      if (error) { err(error.message); return; }

      if (sd.user?.identities?.length === 0) {
        err("An account with this email already exists. Please sign in instead.");
        return;
      }

      if (!sd.session) {
        setScreen("signup-pending");
        return;
      }

      toast.success("Account created!");
      window.location.href = redirectUrl || "/dashboard";
    } finally {
      setLoading(false);
    }
  };

  // ─── Request a recovery link, not a login OTP ───
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErr();
    const emailParsed = z.string().email().max(255).safeParse(resetEmail.trim());
    if (!emailParsed.success) { err("Please enter a valid email address."); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailParsed.data, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) {
        if (error.message?.toLowerCase().includes("rate limit")) {
          err("Please wait a moment before requesting another link.");
        } else {
          err(error.message);
        }
        return;
      }
      toast.success("If an account exists for that email, a password-reset link is on its way.");
      setScreen("forgot-sent");
    } finally {
      setLoading(false);
    }
  };

  // ─── Recovery link — Update password & auto-redirect ───
  const handleRecoveryUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErr();
    if (recoveryNewPw.length < 8) { err("Password must be at least 8 characters."); return; }
    if (recoveryNewPw !== recoveryConfirmPw) { err("Passwords do not match."); return; }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: recoveryNewPw });
      if (error) { err(error.message); return; }
      toast.success("Password updated! Signing you in…");
      setTimeout(() => {
        window.location.href = redirectUrl || "/dashboard";
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  // ─── Shared UI helpers ───
  const PwInput = ({
    value,
    onChange,
    placeholder = "Password (min 8 characters)",
    name,
    autoComplete = "current-password",
  }: {
    value?: string;
    onChange?: (v: string) => void;
    placeholder?: string;
    name?: string;
    autoComplete?: string;
  }) => (
    <div className="relative">
      <input
        name={name}
        type={showPw ? "text" : "password"}
        required
        minLength={8}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full h-11 bg-paper border border-rule px-4 pr-11 rounded-sm text-sm focus:outline-none focus:border-primary"
      />
      <button
        type="button"
        onClick={() => setShowPw(!showPw)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={showPw ? "Hide password" : "Show password"}
      >
        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );

  const ErrorBox = () =>
    errorMsg ? (
      <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-sm">
        {errorMsg}
      </div>
    ) : null;

  const SubmitBtn = ({ label, loadingLabel }: { label: string; loadingLabel: string }) => (
    <button
      type="submit"
      disabled={loading}
      className="w-full h-11 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {loading ? loadingLabel : label}
    </button>
  );

  const Container = ({ children }: { children: React.ReactNode }) => (
    <>
      <SiteHeader />
      <main id="main-content" className="container-editorial py-20 max-w-md font-sans">
        {children}
      </main>
      <SiteFooter />
    </>
  );

  // ── SCREENS ──

  if (screen === "signup-pending") {
    return (
      <Container>
        <div className="eyebrow text-primary">Check your email</div>
        <h1 className="font-display text-2xl mt-3 text-ink">Verify your account</h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          We sent a confirmation link to <strong>{resetEmail || "your email"}</strong>. Click it to
          activate your account and you'll be signed in automatically.
        </p>
        <button
          onClick={() => setScreen("signin")}
          className="mt-8 w-full h-11 flex items-center justify-center bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Back to Sign In
        </button>
      </Container>
    );
  }

  if (screen === "recovery") {
    return (
      <Container>
        <div className="eyebrow">Set a new password</div>
        <h1 className="font-display text-2xl mt-3 text-ink">Update password</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          You'll be signed in automatically once saved.
        </p>
        <form onSubmit={handleRecoveryUpdate} className="mt-8 space-y-4">
          <ErrorBox />
          <PwInput
            value={recoveryNewPw}
            onChange={setRecoveryNewPw}
            placeholder="New password (min 8 characters)"
            autoComplete="new-password"
          />
          <PwInput
            value={recoveryConfirmPw}
            onChange={setRecoveryConfirmPw}
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
          <SubmitBtn label="Set password & sign in" loadingLabel="Saving…" />
        </form>
      </Container>
    );
  }

  if (screen === "forgot-email") {
    return (
      <Container>
        <div className="eyebrow">Reset password</div>
        <h1 className="font-display text-2xl mt-3 text-ink">Forgot your password?</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Enter your email and we'll send you a link to choose a new password.
        </p>
        <form onSubmit={handleRequestReset} className="mt-8 space-y-4">
          <ErrorBox />
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="Email address"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            className="w-full h-11 bg-paper border border-rule px-4 rounded-sm text-sm focus:outline-none focus:border-primary"
          />
          <SubmitBtn label="Send reset link" loadingLabel="Sending…" />
        </form>
        <button
          onClick={() => { clearErr(); setScreen("signin"); }}
          className="mt-5 text-sm text-muted-foreground hover:text-orange hover:underline"
        >
          ← Back to sign in
        </button>
      </Container>
    );
  }

  if (screen === "forgot-sent") {
    return (
      <Container>
        <div className="eyebrow">Check your email</div>
        <h1 className="font-display text-2xl mt-3 text-ink">Reset link requested</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          If an account exists for <strong>{resetEmail}</strong>, you'll receive a link to set a new password. Check your spam folder too.
        </p>
        <div className="mt-5 flex items-center justify-between text-sm">
          <button
            onClick={() => { clearErr(); setScreen("signin"); }}
            className="text-muted-foreground hover:text-orange hover:underline"
          >
            ← Back to sign in
          </button>
          <button
            onClick={() => { clearErr(); setScreen("forgot-email"); }}
            disabled={loading}
            className="text-primary hover:underline disabled:opacity-50"
          >
            Try another email
          </button>
        </div>
      </Container>
    );
  }

  // ── SIGN IN / SIGN UP ──
  return (
    <Container>
      <div className="eyebrow">
        {screen === "signin" ? "Welcome back" : `Join ${siteTitle}`}
      </div>
      <h1 className="font-display text-2xl mt-3 text-ink">
        {screen === "signin" ? "Sign in" : "Create your account"}
      </h1>

      <form
        key={screen}
        onSubmit={screen === "signin" ? handleSignIn : handleSignUp}
        className="mt-8 space-y-4"
      >
        <ErrorBox />

        {screen === "signup" && (
          <input
            name="full_name"
            required
            autoComplete="name"
            placeholder="Full name *"
            className="w-full h-11 bg-paper border border-rule px-4 rounded-sm text-sm focus:outline-none focus:border-primary"
          />
        )}

        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email address"
          className="w-full h-11 bg-paper border border-rule px-4 rounded-sm text-sm focus:outline-none focus:border-primary"
        />

        <PwInput name="password" autoComplete={screen === "signup" ? "new-password" : "current-password"} />

        <SubmitBtn
          label={screen === "signin" ? "Sign in" : "Create account"}
          loadingLabel={screen === "signin" ? "Signing in…" : "Creating account…"}
        />
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <button
          onClick={() => {
            clearErr();
            setScreen(screen === "signin" ? "signup" : "signin");
          }}
          className="text-primary hover:underline"
        >
          {screen === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
        {screen === "signin" && (
          <button
            onClick={() => { clearErr(); setScreen("forgot-email"); }}
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
    </Container>
  );
}
