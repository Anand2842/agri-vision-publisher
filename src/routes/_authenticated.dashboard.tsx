import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";
import { getLocalStorageClaims, syncOfflineClaims, type PaymentClaim } from "@/lib/paymentStorage";
import { 
  ShieldCheck, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  CreditCard,
  Award
} from "lucide-react";
import { SubmissionRowSkeleton, StatCardSkeleton } from "@/components/site/Skeletons";

function getClaimMemberId(claim: { member_id?: string | null; notes?: string | null }) {
  if (claim.member_id) return claim.member_id;
  if (claim.notes) {
    const match = claim.notes.match(/\[MEMBER_ID:\s*(TAPAM-2026-\d{4})\]/);
    if (match) return match[1];
  }
  return null;
}

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [{ title: "Author Dashboard — The Agriculture Popular Article Magazine" }, { name: "robots", content: "noindex" }],
    links: [{ rel: "canonical", href: "https://agriculturemagazine.in/dashboard" }],
  }),
});

type Submission = { id: string; title: string; status: string; plan: string; created_at: string };

// PaymentClaim type is imported from @/lib/paymentStorage (single source of truth)

function Dashboard() {
  const nav = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [isStaff, setIsStaff] = useState(false);
  const [subs, setSubs] = useState<Submission[] | null>(null);
  const [payments, setPayments] = useState<PaymentClaim[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    async function initSession() {
      try {
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        setSession(activeSession);
        if (activeSession) {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", activeSession.user.id);
          const roleList = (roles || []).map((r) => r.role);
          setIsStaff(roleList.includes("admin") || roleList.includes("moderator"));
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setLoadingSession(false);
      }
    }

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, activeSession) => {
      setSession(activeSession);
      if (activeSession) {
        try {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", activeSession.user.id);
          const roleList = (roles || []).map((r) => r.role);
          setIsStaff(roleList.includes("admin") || roleList.includes("moderator"));
        } catch (err) {
          console.error("Auth change role fetch error:", err);
        }
      } else {
        setIsStaff(false);
      }
      setLoadingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    if (!session) return;
    
    try {
      // Fetch only the current user's submissions
      const subPromise = supabase
        .from("submissions")
        .select("id,title,status,plan,created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      // Fetch only the current user's payment claims
      const paymentPromise = supabase
        .from("membership_payments")
        .select("id,user_id,plan,amount,transaction_ref,payment_method,receipt_path,status,notes,created_at,updated_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      const [subRes, payRes] = await Promise.all([subPromise, paymentPromise]);

      if (subRes.error) {
        console.error("Submissions fetch error:", subRes.error);
        if (subRes.error.code !== "PGRST205") {
          toast.error(subRes.error.message);
        }
        setSubs([]);
      } else {
        setSubs(subRes.data || []);
      }

      if (payRes.error) {
        console.warn("Payments fetch error, attempting local storage fallback:", payRes.error);
        try {
          const localClaims = getLocalStorageClaims(session.user.id);
          setPayments(localClaims);
        } catch (fallbackErr) {
          console.error("Failed to load local storage claims:", fallbackErr);
          setPayments([]);
        }
      } else {
        setPayments(payRes.data || []);
      }
    } catch (err: any) {
      console.error("Error in loadData:", err);
      setSubs([]);
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    if (session) {
      syncOfflineClaims(session.user.id).then(() => {
        loadData();
      });
    } else {
      setSubs([]);
      setPayments([]);
      setIsStaff(false);
    }
  }, [session]);

  const total = subs?.length ?? 0;
  const pending =
    subs?.filter((s) => ["submitted", "under_review", "revision_requested"].includes(s.status))
      .length ?? 0;
  const published = subs?.filter((s) => s.status === "published").length ?? 0;

  // Derive membership status
  const activeMembership = payments.find((p) => p.status === "approved");
  const pendingMembership = payments.find((p) => p.status === "pending");

  const getPlanName = (plan: string) => {
    switch (plan) {
      case "single": return "Single Article Plan";
      case "annual": return "Annual Membership Plan";
      case "lifetime": return "Lifetime Membership Plan";
      case "institute": return "Institutional Partnership Plan";
      default: return plan;
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="container-dashboard py-16 font-sans">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="eyebrow">Author Dashboard</div>
            <h1 className="font-display text-5xl mt-3 text-ink">Welcome back</h1>
            {session?.user?.email && (
              <p className="text-sm text-muted-foreground mt-2">{session.user.email}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-4 items-center self-start md:self-auto">
            {isStaff && (
              <Link
                to="/admin/queue"
                className="text-xs uppercase tracking-wider bg-orange hover:bg-orange/90 text-background px-4 py-2.5 rounded font-semibold transition"
              >
                Go to Editorial Console
              </Link>
            )}
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                nav({ to: "/" });
              }}
              className="text-sm text-foreground/70 hover:text-primary cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Dynamic Membership Status Panel */}
        <section className="mt-8 z-10 relative">
          {loadingSession || loadingPayments ? (
            <div className="bg-paper border border-rule p-4 rounded text-center text-xs text-muted-foreground">
              Checking account privileges...
            </div>
          ) : isStaff ? (
            // User is a staff member (Admin/Moderator)
            <div className="bg-orange/5 border border-orange/20 p-6 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-orange/10 p-3 rounded-full text-ink shrink-0">
                  <ShieldCheck className="h-6 w-6 text-orange" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-ink font-bold flex items-center gap-2">
                    Staff Account Privileges Active
                  </h3>
                  <p className="text-xs text-foreground/80 mt-1">
                    You are logged in as an editor/moderator. You have full access to view, verify, and approve manuscript submissions and payment claims in the Editorial Console.
                  </p>
                </div>
              </div>
              <Link
                to="/admin/queue"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-4 py-2.5 rounded font-semibold uppercase tracking-wider shrink-0 transition flex items-center gap-1.5 cursor-pointer"
              >
                Editorial Console <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : activeMembership ? (
            // User is a premium active member
            <div className="bg-sage/10 border border-green-300 p-6 rounded flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-full text-green-700 shrink-0">
                  <ShieldCheck className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-ink font-bold flex items-center gap-2.5 flex-wrap">
                    Active Premium Member
                    {getClaimMemberId(activeMembership) && (
                      <span className="bg-primary/10 text-primary text-[10px] uppercase font-sans font-bold px-2 py-0.5 rounded-sm">
                        ID: {getClaimMemberId(activeMembership)}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-foreground/80 mt-1 font-sans">
                    Your {getPlanName(activeMembership.plan)} is verified and fully active. Settle manuscript submissions for priority reviews.
                  </p>
                  {activeMembership.notes && (
                    <p className="text-[10px] bg-white border border-green-200/50 text-green-800 px-2 py-1 mt-2 rounded max-w-lg font-sans">
                      <strong>Editor's note:</strong> {activeMembership.notes}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 flex-wrap w-full lg:w-auto shrink-0">
                <Link
                  to="/membership/certificate/$claimId"
                  params={{ claimId: activeMembership.id }}
                  target="_blank"
                  className="bg-primary hover:bg-primary/95 text-white text-xs px-4 py-2.5 rounded font-semibold uppercase tracking-wider transition inline-flex items-center gap-1.5 cursor-pointer font-sans"
                >
                  <Award className="h-3.5 w-3.5" /> Download Certificate
                </Link>
                <Link
                  to="/submit"
                  className="bg-green-700 hover:bg-green-800 text-white text-xs px-4 py-2.5 rounded font-semibold uppercase tracking-wider transition font-sans text-center flex-1 lg:flex-initial"
                >
                  Submit Manuscript
                </Link>
              </div>
            </div>
          ) : pendingMembership ? (
            // Membership claim is pending review
            <div className="bg-ochre/5 border border-ochre/30 p-6 rounded flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm">
              <div className="flex items-start gap-4 min-w-0">
                <div className="bg-ochre/15 p-3 rounded-full text-ochre shrink-0">
                  <Clock className="h-6 w-6 animate-spin" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-lg text-ink font-bold">Payment Verification In Progress</h3>
                  <p className="text-xs text-foreground/80 mt-1.5 leading-relaxed max-w-xl">
                    Your membership payment claim has been submitted successfully and is currently under review by our editorial team. Verification is typically completed within 1–2 business days. Your membership benefits will activate immediately upon approval.
                  </p>
                  
                  {/* Styled Payment Reference Details */}
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs border-t border-ochre/20 pt-3">
                    <div>
                      <span className="text-muted-foreground uppercase font-sans font-semibold tracking-wider text-[10px] block">Selected Plan</span>
                      <span className="font-display text-ink font-semibold mt-0.5 block">{getPlanName(pendingMembership.plan)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground uppercase font-sans font-semibold tracking-wider text-[10px] block">Amount Paid</span>
                      <span className="font-display text-ink font-semibold mt-0.5 block">₹{pendingMembership.amount}</span>
                    </div>
                    <div className="min-w-0 max-w-xs sm:max-w-md">
                      <span className="text-muted-foreground uppercase font-sans font-semibold tracking-wider text-[10px] block">Transaction Ref (UTR)</span>
                      <code className="font-mono bg-ochre/10 text-ink text-[11px] px-1.5 py-0.5 rounded border border-ochre/10 break-all select-all mt-0.5 block whitespace-pre-wrap max-h-24 overflow-y-auto">
                        {pendingMembership.transaction_ref}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
              <span className="bg-ochre/10 border border-ochre/25 text-ink text-[10px] px-3.5 py-2 rounded-sm font-mono uppercase tracking-wider font-bold shrink-0 self-start lg:self-center">
                In Review Queue
              </span>
            </div>
          ) : (
            // No membership active
            <div className="bg-paper border border-rule p-6 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-secondary/40 p-3 rounded text-foreground/60 shrink-0">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-ink font-bold">Standard Contributor Account</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                    Unlock priority reviews, publish multiple articles without individual submission fees, and acquire your official Author Certificate by subscribing to our annual or lifetime plan.
                  </p>
                </div>
              </div>
              <Link
                to="/membership"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-4 py-2.5 rounded font-semibold uppercase tracking-wider shrink-0 transition flex items-center gap-1.5 cursor-pointer"
              >
                Choose Membership <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </section>

        {/* Stats Grid */}
        <div className="mt-12 grid sm:grid-cols-3 gap-6">
          {subs === null ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <Stat label="Total submissions" value={total} />
              <Stat label="In review" value={pending} />
              <Stat label="Published" value={published} />
            </>
          )}
        </div>

        {/* Submissions Section */}
        <section className="mt-16">
          <div className="eyebrow">My Submissions</div>
          <div className="rule-thick mt-3" />
          {subs === null ? (
            <ul className="divide-y divide-[var(--color-rule)]">
              {Array.from({ length: 3 }).map((_, i) => (
                <SubmissionRowSkeleton key={i} />
              ))}
            </ul>
          ) : subs.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">No submissions yet.</p>
              <button
                onClick={() => nav({ to: "/submit" })}
                className="mt-5 bg-primary text-primary-foreground px-5 py-3 rounded-sm text-sm cursor-pointer"
              >
                Begin a submission
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-[var(--color-rule)]">
              {subs.map((s) => (
                <li key={s.id} className="py-6 flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <div className="font-display text-xl text-ink truncate">{s.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>Ticket #{s.id.slice(0, 8).toUpperCase()}</span>
                      <span>·</span>
                      <span>{new Date(s.created_at).toLocaleDateString()}</span>
                      <span>·</span>
                      <span className="uppercase text-[10px] bg-secondary/80 text-foreground px-1.5 py-0.5 rounded-sm font-semibold">{s.plan}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={s.status} />
                    {s.status === "published" && (
                      <Link
                        to="/article/certificate/$submissionId"
                        params={{ submissionId: s.id }}
                        target="_blank"
                        className="bg-primary/10 hover:bg-primary/20 text-primary text-[10px] uppercase font-sans font-bold px-3 py-1.5 rounded-sm transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Award className="h-3.5 w-3.5" /> Certificate
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Payment History Verification Claims */}
        {!loadingPayments && payments.length > 0 && (
          <section className="mt-16">
            <div className="eyebrow">Direct Payment Verification Claims</div>
            <div className="rule-thick mt-3" />
            <div className="mt-6 border border-rule rounded overflow-hidden">
              <ul className="divide-y divide-rule bg-paper">
                {payments.map((pay) => (
                  <li key={pay.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
                    <div>
                      <div className="font-display text-ink font-bold flex items-center gap-2">
                        {getPlanName(pay.plan)} · ₹{pay.amount.toLocaleString()}
                        <span className="text-[10px] text-muted-foreground font-mono font-normal">
                          (Ref: {pay.transaction_ref})
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Settle claim filed on: {new Date(pay.created_at).toLocaleString()} via <span className="uppercase">{pay.payment_method}</span>
                      </div>
                      {pay.notes && (
                        <div className="text-[11px] bg-muted/50 border border-rule/50 px-3 py-1.5 mt-2 rounded text-foreground/80">
                          <strong>Admin Notes:</strong> {pay.notes}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0">
                      {pay.status === "pending" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-ochre/15 text-ink text-xs font-semibold uppercase tracking-wider">
                          <Clock className="h-3.5 w-3.5 text-ochre animate-spin" /> Pending Review
                        </span>
                      )}
                      {pay.status === "approved" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sage/20 text-ink text-xs font-semibold uppercase tracking-wider">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Approved
                        </span>
                      )}
                      {pay.status === "rejected" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-destructive/15 text-destructive text-xs font-semibold uppercase tracking-wider">
                          <XCircle className="h-3.5 w-3.5 text-red-600" /> Rejected
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Help / FAQ */}
        <section className="mt-16 border-t border-rule pt-8">
          <div className="eyebrow">Need help?</div>
          <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
            Read answers to the most common questions about submissions, peer review, fees,
            membership, and certificates on our{" "}
            <Link to="/faq" className="text-primary underline-offset-2 hover:underline">
              FAQ page
            </Link>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-paper border border-rule p-7 shadow-sm">
      <div className="font-display text-5xl text-ink tabular-nums">{value}</div>
      <div className="eyebrow mt-3">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    submitted: "bg-secondary text-secondary-foreground",
    under_review: "bg-ochre/20 text-ink",
    revision_requested: "bg-destructive/15 text-destructive",
    approved: "bg-sage/20 text-ink",
    published: "bg-primary text-primary-foreground",
    rejected: "bg-destructive/15 text-destructive",
    draft: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`text-[0.65rem] uppercase tracking-widest px-3 py-1.5 rounded-sm shrink-0 ${map[status] || "bg-muted"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
