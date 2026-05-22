import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  getLocalStorageClaims, 
  updateLocalStorageClaimStatus, 
  updateLocalStorageClaimNotes, 
  MOCK_PROFILES 
} from "@/lib/paymentStorage";
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

function AdminMemberships() {
  const [claims, setClaims] = useState<PaymentClaim[] | null>(null);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [receiptUrls, setReceiptUrls] = useState<Record<string, string>>({});

  const loadData = async () => {
    setLoading(true);
    let claimsData: PaymentClaim[] = [];
    
    try {
      // Fetch claims
      const { data: remoteClaims, error: claimsErr } = await supabase
        .from("membership_payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (claimsErr) throw claimsErr;
      claimsData = (remoteClaims || []) as PaymentClaim[];
    } catch (err: any) {
      console.warn("Supabase membership payments fetch failed, falling back to local storage:", err);
      setIsOfflineMode(true);
      claimsData = getLocalStorageClaims() as PaymentClaim[];
    }

    try {
      // Fetch profiles of users who made claims
      const userIds = Array.from(new Set((claimsData || []).map((c) => c.user_id)));
      
      const profilesMap: Record<string, Profile> = {};
      if (userIds.length > 0) {
        try {
          const { data: profilesData, error: profsErr } = await supabase
            .from("profiles")
            .select("id, full_name, institution, country")
            .in("id", userIds);

          if (!profsErr && profilesData) {
            profilesData.forEach((p) => {
              profilesMap[p.id] = p;
            });
          }
        } catch (profErr) {
          console.warn("Failed to fetch profiles from database:", profErr);
        }
      }

      // Merge / fallback with MOCK_PROFILES for any missing profiles
      userIds.forEach((uid) => {
        if (!profilesMap[uid] || !profilesMap[uid].full_name) {
          const mockProf = MOCK_PROFILES[uid];
          if (mockProf) {
            profilesMap[uid] = {
              id: uid,
              full_name: mockProf.full_name,
              institution: mockProf.institution,
              country: mockProf.country
            };
          } else {
            profilesMap[uid] = {
              id: uid,
              full_name: "Agri Researcher",
              institution: "Agricultural Research Center",
              country: "India"
            };
          }
        }
      });

      // Generate secure signed URLs for receipts
      const urlsMap: Record<string, string> = {};
      await Promise.all(
        claimsData.map(async (c) => {
          if (c.receipt_path) {
            if (c.receipt_path.startsWith("data:") || c.receipt_path.startsWith("http")) {
              urlsMap[c.id] = c.receipt_path;
              return;
            }
            try {
              const { data, error } = await supabase.storage
                .from("receipts")
                .createSignedUrl(c.receipt_path, 60);
              if (!error && data) {
                urlsMap[c.id] = data.signedUrl;
              } else {
                const { data: pubData } = supabase.storage
                  .from("receipts")
                  .getPublicUrl(c.receipt_path);
                urlsMap[c.id] = pubData.publicUrl;
              }
            } catch (err) {
              const { data: pubData } = supabase.storage
                .from("receipts")
                .getPublicUrl(c.receipt_path);
              urlsMap[c.id] = pubData.publicUrl;
            }
          }
        })
      );
      setReceiptUrls(urlsMap);

      setClaims(claimsData);
      setProfiles(profilesMap);
    } catch (err: any) {
      toast.error(err.message || "Failed to load membership claims");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    const claim = claims?.find((c) => c.id === id);
    const notes = claim?.notes || "";
    if (isOfflineMode) {
      try {
        updateLocalStorageClaimStatus(id, status, notes);
        toast.success(`Claim status updated to ${status} (Local Storage)`);
        loadData();
      } catch (err: any) {
        toast.error("Failed to update status in local storage");
      }
      return;
    }
    
    try {
      const { error } = await supabase
        .from("membership_payments")
        .update({ status, notes, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast.success(`Claim status updated to ${status}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update claim");
    }
  };

  const handleSaveNotes = async (id: string, notes: string) => {
    if (isOfflineMode) {
      try {
        updateLocalStorageClaimNotes(id, notes);
        toast.success("Notes saved successfully (Local Storage)");
        setClaims((prev) =>
          prev
            ? prev.map((c) =>
                c.id === id ? { ...c, notes, updated_at: new Date().toISOString() } : c
              )
            : null
        );
      } catch (err: any) {
        toast.error("Failed to save notes in local storage");
      }
      return;
    }
    
    try {
      const { error } = await supabase
        .from("membership_payments")
        .update({ notes, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast.success("Notes saved successfully");
      setClaims((prev) =>
        prev
          ? prev.map((c) =>
              c.id === id ? { ...c, notes, updated_at: new Date().toISOString() } : c
            )
          : null
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to save notes");
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
      {isOfflineMode && (
        <div className="bg-orange/5 border border-orange/20 p-4 rounded flex items-start gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 text-orange shrink-0 mt-0.5 font-bold" />
          <div>
            <h3 className="font-display text-sm text-ink font-bold">Offline Local Storage Mode Active</h3>
            <p className="text-xs text-foreground/80 mt-1 leading-relaxed">
              Remote database table <code className="bg-orange/10 px-1 py-0.5 rounded font-mono text-[10px] text-orange">membership_payments</code> was not detected. All claim audits and approvals are stored in local storage for local demonstration.
            </p>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-ink">Membership Claims</h2>
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
      {loading ? (
        <div className="py-20 text-center text-muted-foreground border border-rule bg-paper">
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            Fetching claims and author profiles...
          </span>
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
                    <span className="text-[10px] text-muted-foreground font-mono">
                      CLAIM ID: #{claim.id.slice(0, 8).toUpperCase()}
                    </span>
                    {getStatusBadge(claim.status)}
                    <span className={`px-2 py-0.5 border text-[10px] uppercase font-semibold tracking-wider rounded-sm ${getPlanBadgeStyle(claim.plan)}`}>
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
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Submitted By</span>
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
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Payment Verification</span>
                        <span className="font-display text-ink font-bold block">
                          ₹{claim.amount.toLocaleString()} via <span className="uppercase text-xs">{claim.payment_method}</span>
                        </span>
                        <span className="text-xs text-muted-foreground font-mono block mt-0.5 select-all">
                          Ref / UTR: {claim.transaction_ref}
                        </span>
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
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Receipt Screenshot</span>
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
                          <span className="bg-paper text-ink px-2.5 py-1 text-[10px] uppercase font-bold flex items-center gap-1 shadow">
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
                      <span className="text-[10px] text-center text-muted-foreground block font-medium">
                        Change verification state:
                      </span>
                      <div className="flex gap-2">
                        {claim.status !== "approved" && (
                          <button
                            onClick={() => handleUpdateStatus(claim.id, "approved")}
                            className="flex-1 py-1.5 border border-sage text-ink text-[10px] font-semibold flex items-center justify-center gap-1 hover:bg-sage hover:text-ink transition"
                          >
                            <Check className="h-3 w-3" /> Set Approved
                          </button>
                        )}
                        {claim.status !== "rejected" && (
                          <button
                            onClick={() => handleUpdateStatus(claim.id, "rejected")}
                            className="flex-1 py-1.5 border border-destructive/30 text-destructive text-[10px] font-semibold flex items-center justify-center gap-1 hover:bg-destructive/5 transition"
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
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" /> Editorial/Verification Notes
        </label>
        {hasChanged && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-[10px] text-orange hover:underline font-bold disabled:opacity-50"
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
