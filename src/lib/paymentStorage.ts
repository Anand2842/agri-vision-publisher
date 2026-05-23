export interface PaymentClaim {
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
  notes: string
): PaymentClaim | null {
  const claims = getLocalStorageClaims();
  const index = claims.findIndex(c => c.id === claimId);
  if (index === -1) return null;
  
  const updatedClaim: PaymentClaim = {
    ...claims[index],
    status,
    notes: notes || null,
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
