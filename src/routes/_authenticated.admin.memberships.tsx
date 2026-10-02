import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { adminKey, db, useAdminRefresh } from "@/lib/adminQuery";
import { reviewMembershipClaim } from "@/lib/admin.functions";
import { QueryState } from "@/components/admin/QueryState";
import { 
  Check, 
  X, 
  Clock, 
  AlertCircle, 
  User, 
  Search, 
  CreditCard, 
  Calendar, 
  Image as ImageIcon,
  MessageSquare,
  Building,
  ArrowUpRight
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/memberships")({
  component: AdminMemberships,
});

type PaymentClaim = {
  id: string;
  user_id: string;
  plan: "single" | "annual" | "lifetime" | "institute";
  amount: number;
  transaction_ref: string;
  payment_method: string;
  receipt_path: string | null;
  status: "pending" | "approved" | "rejected";
  member_id?: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  institution: string | null;
  country: string | null;
};

export function getClaimMemberId(claim: { member_id?: string | null; notes?: string | null }) {
  if (claim.member_id) return claim.member_id;
  if (claim.notes) {
    const match = claim.notes.match(/\[MEMBER_ID:\s*(TAPAM-2026-\d{4})\]/);
    if (match) return match[1];
  }
  return null;
}

function AdminMemberships() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const refresh = useAdminRefresh();
  const review = useServerFn(reviewMembershipClaim);

  const query = useQuery({
    queryKey: adminKey("memberships"),
    queryFn: async () => {
      const claims = (await db(
        supabase.from("membership_payments").select("*").order("created_at", { ascending: false }),
      )) as PaymentClaim[];

      const userIds = Array.from(new Set(claims.map((c) => c.user_id)));
      const profiles: Record<string, Profile> = {};
      if (userIds.length > 0) {
        const rows = await db(
          supabase.from("profiles").select("id, full_name, institution, country").in("id", userIds),
        );
        rows.forEach((p) => (profiles[p.id] = p));
      }

      // Receipts are in a private bucket: generate short-lived signed links.
      const receiptUrls: Record<string, string> = {};
      await Promise.all(
        claims.map(async (c) => {
          if (!c.receipt_path) return;
          if (c.receipt_path.startsWith("data:") || c.receipt_path.startsWith("http")) {
            receiptUrls[c.id] = c.receipt_path;
            return;
          }
          const { data } = await supabase.storage
            .from("payment-receipts")
            .createSignedUrl(c.receipt_path, 3600);
          if (data) receiptUrls[c.id] = data.signedUrl;
        }),
      );
      return { claims, profiles, receiptUrls };
    },
  });
  const claims = query.data?.claims ?? null;
  const profiles = query.data?.profiles ?? {};
  const receiptUrls = query.data?.receiptUrls ?? {};

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    const claim = claims?.find((c) => c.id === id);
    if (!claim) return;
    try {
      // Server-side: updates the claim (the database assigns the Member ID) and emails the member.
      const res = await review({ data: { claimId: id, status, notes: claim.notes || "" } });
      toast.success(
        `Claim ${status}${res.memberId ? ` · Member ID ${res.memberId}` : ""}. ${res.emailed ? "Member emailed." : "Email not sent (no address or email not configured)."}`,
      );
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update claim");
    }
  };

  const handleSaveNotes = async (id: string, notes: string) => {
    try {
      await db(
        supabase
          .from("membership_payments")
          .update({ notes, updated_at: new Date().toISOString() })
          .eq("id", id),
      );
      toast.success("Notes saved successfully");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save notes");
    }
  };

  const getPlanBadgeStyle = (plan: string) => {
    switch (plan) {
      case "single":
        return "bg-slate-100 text-slate-800 border-slate-200";
      case "annual":
        return "bg-orange/10 text-orange border-orange/20 font-bold";
      case "lifetime":
        return "bg-amber-100 text-amber-800 border-amber-200 font-bold";
      case "institute":
        return "bg-indigo-100 text-indigo-800 border-indigo-200 font-bold";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider bg-ochre/10 text-ink">
            <Clock className="h-3 w-3 animate-spin" /> Pending
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider bg-sage/20 text-ink">
            <Check className="h-3 w-3 text-green-700" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider bg-destructive/15 text-destructive">
            <X className="h-3 w-3 text-red-600" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  // Filter claims
  const filteredClaims = (claims || []).filter((c) => {
    const profile = profiles[c.user_id];
    const nameMatch = profile?.full_name?.toLowerCase().includes(search.toLowerCase()) || false;
    const instMatch = profile?.institution?.toLowerCase().includes(search.toLowerCase()) || false;
    const refMatch = c.transaction_ref.toLowerCase().includes(search.toLowerCase());
    const idMatch = c.id.toLowerCase().includes(search.toLowerCase());
    
    const searchMatch = search === "" || nameMatch || instMatch || refMatch || idMatch;
    const statusMatch = statusFilter === "all" || c.status === statusFilter;

    return searchMatch && statusMatch;
  });

  const getReceiptUrl = (claimId: string, path: string | null) => {
    if (!path) return "";
    return receiptUrls[claimId] || "";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Membership Claims</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Review, verify, and approve offline bank transfers & UPI QR code payments
          </p>
        </div>
        
        {/* Simple Status Toggles */}
        <div className="flex bg-muted p-1 rounded text-xs font-medium self-start sm:self-center">
          {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded transition-all duration-200 capitalize ${
                statusFilter === tab
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Filter bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by author name, institution, transaction ref, or claim ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-paper border border-rule pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {/* Loading state */}
      {query.isPending || query.error ? (
        <div className="border border-rule bg-paper">
          <QueryState query={query} label="Fetching claims and author profiles…" />
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground border border-rule bg-paper">
          <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
          <p className="font-display text-lg text-ink">No membership claims found</p>
          <p className="text-xs mt-1 text-muted-foreground">
            No claims matched your search filter or status selection.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredClaims.map((claim) => {
            const profile = profiles[claim.user_id];
            const receiptUrl = getReceiptUrl(claim.id, claim.receipt_path);

            return (
              <div
                key={claim.id}
                className="bg-paper border border-rule p-6 flex flex-col md:grid md:grid-cols-12 gap-6 relative shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Visual indicator bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    claim.status === "pending"
                      ? "bg-ochre"
                      : claim.status === "approved"
                      ? "bg-sage"
                      : "bg-destructive"
                  }`}
                />

                {/* Left Side: Submitter and Claim Info */}
                <div className="md:col-span-8 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-muted-foreground font-mono">
                      CLAIM ID: #{claim.id.slice(0, 8).toUpperCase()}
                    </span>
                    {getStatusBadge(claim.status)}
                    <span className={`px-2 py-0.5 border text-xs uppercase font-semibold tracking-wider rounded-sm ${getPlanBadgeStyle(claim.plan)}`}>
                      {claim.plan} Plan
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* User Profile */}
                    <div className="flex items-start gap-2.5">
                      <div className="bg-secondary/40 p-2 text-foreground/70 shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Submitted By</span>
                        <span className="font-display text-ink font-bold block truncate">
                          {profile?.full_name || "Unknown Author"}
                        </span>
                        {profile?.institution && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                            <Building className="h-3 w-3 shrink-0" /> {profile.institution}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Transaction Payment details */}
                    <div className="flex items-start gap-2.5">
                      <div className="bg-secondary/40 p-2 text-foreground/70 shrink-0">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Payment Verification</span>
                        <span className="font-display text-ink font-bold block">
                          ₹{claim.amount.toLocaleString()} via <span className="uppercase text-xs">{claim.payment_method}</span>
                        </span>
                        <span className="text-xs text-muted-foreground font-mono block mt-0.5 select-all">
                          Ref / UTR: {claim.transaction_ref}
                        </span>
                        {getClaimMemberId(claim) && (
                          <span className="inline-flex items-center bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-sm mt-1.5 font-sans">
                            Member ID: {getClaimMemberId(claim)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submission date & Notes */}
                  <div className="grid sm:grid-cols-2 gap-4 border-t border-rule pt-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Submitted on: {new Date(claim.created_at).toLocaleString()}</span>
                    </div>

                    {claim.updated_at !== claim.created_at && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Last updated: {new Date(claim.updated_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes update section */}
                  <MembershipNotesField
                    claimId={claim.id}
                    initialNotes={claim.notes}
                    onSave={handleSaveNotes}
                  />
                </div>

                {/* Right Side: Receipt Thumbnail and Action buttons */}
                <div className="md:col-span-4 flex flex-col justify-between gap-4 border-t md:border-t-0 md:border-l border-rule pt-6 md:pt-0 md:pl-6">
                  {/* Receipt Preview Thumbnail */}
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Receipt Screenshot</span>
                    {receiptUrl ? (
                      <div 
                        onClick={() => setSelectedReceipt(receiptUrl)}
                        className="relative group border border-rule bg-paper aspect-video rounded overflow-hidden cursor-zoom-in hover:border-primary transition"
                      >
                        <img
                          src={receiptUrl}
                          alt="Receipt proof"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                          <span className="bg-paper text-ink px-2.5 py-1 text-xs uppercase font-bold flex items-center gap-1 shadow">
                            <ImageIcon className="h-3.5 w-3.5" /> Inspect
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-dashed border-rule rounded aspect-video flex flex-col items-center justify-center bg-muted/20 text-muted-foreground text-xs p-4 text-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground/50 mb-1" />
                        No receipt screenshot attached.
                      </div>
                    )}
                  </div>

                  {/* Approve / Reject buttons */}
                  {claim.status === "pending" ? (
                    <div className="grid grid-cols-2 gap-2 mt-4 md:mt-0">
                      <button
                        onClick={() => handleUpdateStatus(claim.id, "rejected")}
                        className="py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <X className="h-4 w-4" /> Reject
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(claim.id, "approved")}
                        className="py-2.5 bg-sage hover:bg-sage/40 text-ink text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <Check className="h-4 w-4" /> Approve
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 md:mt-0 space-y-2">
                      <span className="text-xs text-center text-muted-foreground block font-medium">
                        Change verification state:
                      </span>
                      <div className="flex gap-2">
                        {claim.status !== "approved" && (
                          <button
                            onClick={() => handleUpdateStatus(claim.id, "approved")}
                            className="flex-1 py-1.5 border border-sage text-ink text-xs font-semibold flex items-center justify-center gap-1 hover:bg-sage hover:text-ink transition"
                          >
                            <Check className="h-3 w-3" /> Set Approved
                          </button>
                        )}
                        {claim.status !== "rejected" && (
                          <button
                            onClick={() => handleUpdateStatus(claim.id, "rejected")}
                            className="flex-1 py-1.5 border border-destructive/30 text-destructive text-xs font-semibold flex items-center justify-center gap-1 hover:bg-destructive/5 transition"
                          >
                            <X className="h-3 w-3" /> Set Rejected
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Receipt Modal Overlay */}
      {selectedReceipt && (
        <div 
          onClick={() => setSelectedReceipt(null)}
          className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-paper p-1.5 border border-rule shadow-2xl overflow-hidden rounded animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 bg-ink/75 hover:bg-ink text-white p-2 rounded-full shadow-md hover:scale-105 transition"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={selectedReceipt}
              alt="Receipt proof detail"
              className="max-w-full max-h-[85vh] object-contain rounded"
            />
            <div className="p-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Receipt Proof Inspection</span>
              <a 
                href={selectedReceipt} 
                target="_blank" 
                rel="noreferrer" 
                className="text-orange hover:underline font-semibold flex items-center gap-1"
              >
                Open in new tab <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MembershipNotesFieldProps {
  claimId: string;
  initialNotes: string | null;
  onSave: (id: string, notes: string) => Promise<void>;
}

function MembershipNotesField({ claimId, initialNotes, onSave }: MembershipNotesFieldProps) {
  const [localNotes, setLocalNotes] = useState(initialNotes || "");
  const [saving, setSaving] = useState(false);

  const hasChanged = localNotes !== (initialNotes || "");

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(claimId, localNotes);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    setLocalNotes(initialNotes || "");
  }, [initialNotes]);

  return (
    <div className="bg-muted/30 border border-rule/50 p-4 rounded space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" /> Editorial/Verification Notes
        </label>
        {hasChanged && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs text-orange hover:underline font-bold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Notes"}
          </button>
        )}
      </div>
      <textarea
        placeholder="Add confirmation references, bank clearance dates, or failure details here..."
        value={localNotes}
        onChange={(e) => setLocalNotes(e.target.value)}
        className="w-full text-xs bg-paper border border-rule/60 p-2.5 rounded focus:outline-none focus:border-primary min-h-[60px]"
      />
    </div>
  );
}
