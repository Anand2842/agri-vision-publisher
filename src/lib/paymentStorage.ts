import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PaymentClaim {
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
}

export const MOCK_PROFILES: Record<string, { full_name: string; institution: string; country: string }> = {
  "fceb3ee4-c411-41b0-915f-c8d5b429a526": {
    full_name: "Dr. Anand Kumar (Test Author)",
    institution: "Indian Agricultural Research Institute (IARI)",
    country: "India"
  },
  "87ccb941-db76-47c8-aa4d-9dbb5491b3f1": {
    full_name: "Dr. Rajesh Sharma (Test Moderator)",
    institution: "Editorial Console Board",
    country: "India"
  },
  "mock-user-1": {
    full_name: "Dr. Sunita Narain",
    institution: "Centre for Science and Environment",
    country: "India"
  },
  "mock-user-2": {
    full_name: "Dr. MS Swaminathan Foundation",
    institution: "MSSRF Research Center",
    country: "India"
  }
};

const DEFAULT_CLAIMS: PaymentClaim[] = [
  {
    id: "mock-claim-1",
    user_id: "mock-user-1",
    plan: "annual",
    amount: 500,
    transaction_ref: "UTR987654321098",
    payment_method: "upi",
    receipt_path: "mock_receipt_1.png",
    status: "pending",
    notes: null,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "mock-claim-2",
    user_id: "mock-user-2",
    plan: "lifetime",
    amount: 2000,
    transaction_ref: "UTR123456789012",
    payment_method: "bank",
    receipt_path: "mock_receipt_2.png",
    status: "approved",
    notes: "Payment verified successfully by moderator.",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const STORAGE_KEY = "mock_membership_payments";

export function getLocalStorageClaims(userId?: string): PaymentClaim[] {
  if (typeof window === "undefined") return [];
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed initial claims
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CLAIMS));
      return userId ? DEFAULT_CLAIMS.filter(c => c.user_id === userId) : DEFAULT_CLAIMS;
    }
    const claims: PaymentClaim[] = JSON.parse(raw);
    return userId ? claims.filter(c => c.user_id === userId) : claims;
  } catch (err) {
    console.error("Error reading local storage claims:", err);
    return [];
  }
}

export function saveLocalStorageClaim(claim: Omit<PaymentClaim, "id" | "created_at" | "updated_at">): PaymentClaim {
  const claims = getLocalStorageClaims();
  const id = `mock-claim-${Math.random().toString(36).substring(2, 11)}`;
  const now = new Date().toISOString();
  
  const newClaim: PaymentClaim = {
    ...claim,
    transaction_ref: (claim.transaction_ref || "").trim().slice(0, 50),
    id,
    created_at: now,
    updated_at: now
  };
  
  claims.unshift(newClaim);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
  return newClaim;
}

export function updateLocalStorageClaimStatus(
  claimId: string,
  status: "approved" | "rejected",
  notes: string,
  memberId?: string | null
): PaymentClaim | null {
  const claims = getLocalStorageClaims();
  const index = claims.findIndex(c => c.id === claimId);
  if (index === -1) return null;
  
  const updatedClaim: PaymentClaim = {
    ...claims[index],
    status,
    notes: notes || null,
    member_id: memberId !== undefined ? memberId : (status === "approved" ? claims[index].member_id || `TAPAM-2026-${String(claims.filter(c => c.status === "approved" || c.member_id).length + 1).padStart(4, "0")}` : null),
    updated_at: new Date().toISOString()
  };
  
  claims[index] = updatedClaim;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
  return updatedClaim;
}

export function updateLocalStorageClaimNotes(claimId: string, notes: string): PaymentClaim | null {
  const claims = getLocalStorageClaims();
  const index = claims.findIndex(c => c.id === claimId);
  if (index === -1) return null;
  
  const updatedClaim: PaymentClaim = {
    ...claims[index],
    notes: notes || null,
    updated_at: new Date().toISOString()
  };
  
  claims[index] = updatedClaim;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
  return updatedClaim;
}

export function getProfileFallback(userId: string) {
  return MOCK_PROFILES[userId] || {
    full_name: "Agri Researcher",
    institution: "Agricultural Research Center",
    country: "India"
  };
}

const syncInProgress = new Set<string>();

export async function syncOfflineClaims(userId: string) {
  if (typeof window === "undefined" || !userId) return;
  
  const claims = getLocalStorageClaims();
  // Filter claims that belong to this user, are local offline claims, and aren't already syncing
  const pendingSync = claims.filter(
    (c) =>
      c.user_id === userId &&
      c.id.startsWith("mock-claim-") &&
      c.id !== "mock-claim-1" &&
      c.id !== "mock-claim-2" &&
      !syncInProgress.has(c.id)
  );
  
  if (pendingSync.length === 0) return;
  
  // Lock all pending items
  pendingSync.forEach((c) => syncInProgress.add(c.id));
  
  console.log(`[Offline Sync] Found ${pendingSync.length} claims pending synchronization...`);
  
  let syncedCount = 0;
  const updatedClaims = getLocalStorageClaims(); // Fetch fresh to avoid mutation races
  
  for (const localClaim of pendingSync) {
    try {
      // Skip remote sync for local mock user accounts to prevent database foreign key violation (HTTP 422)
      if (MOCK_PROFILES[localClaim.user_id] || localClaim.user_id.startsWith("mock-user-") || localClaim.user_id.startsWith("mock-")) {
        console.info(`[Offline Sync] Skipping remote database insertion for mock sandbox user: ${localClaim.user_id}`);
        continue;
      }

      // Check if this transaction_ref already exists on Supabase to prevent duplicate inserts
      const { data: existing } = await supabase
        .from("membership_payments")
        .select("id")
        .eq("transaction_ref", localClaim.transaction_ref)
        .maybeSingle();
        
      if (existing) {
        // If it already exists in the database, we can simply remove the local mock claim
        const idx = updatedClaims.findIndex((x) => x.id === localClaim.id);
        if (idx !== -1) updatedClaims.splice(idx, 1);
        continue;
      }
      
      // Sanitize payload before insert to prevent garbage/pasted logs pollution
      const sanitizedTxRef = (localClaim.transaction_ref || "").trim().slice(0, 50);

      // Attempt remote insertion
      const { data, error } = await supabase
        .from("membership_payments")
        .insert({
          user_id: localClaim.user_id,
          plan: localClaim.plan,
          amount: localClaim.amount,
          transaction_ref: sanitizedTxRef,
          payment_method: localClaim.payment_method as "upi" | "bank",
          receipt_path: localClaim.receipt_path,
          status: localClaim.status,
          notes: localClaim.notes
        })
        .select()
        .single();
        
      if (error) {
        console.warn(
          `[Offline Sync] Remote DB insert failed for claim ${localClaim.id}:`,
          error.message,
          error.code
        );
        continue;
      }
      
      if (data) {
        // Successfully synced! Remove the mock local claim
        const idx = updatedClaims.findIndex((x) => x.id === localClaim.id);
        if (idx !== -1) {
          updatedClaims.splice(idx, 1);
        }
        syncedCount++;
      }
    } catch (err) {
      console.warn("[Offline Sync] Exception syncing claim:", localClaim.id, err);
    } finally {
      // Release lock for this item
      syncInProgress.delete(localClaim.id);
    }
  }
  
  if (syncedCount > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedClaims));
    toast.success(`Synchronized ${syncedCount} offline payment claim(s) with the database!`);
  }
}
