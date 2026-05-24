import { useState, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { 
  Check, 
  Building2, 
  Smartphone, 
  Banknote, 
  Copy, 
  QrCode, 
  ShieldCheck, 
  Loader2, 
  Upload, 
  CheckCircle2, 
  AlertTriangle,
  FileText
} from "lucide-react";
import { fetchSeoMetadata, useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";
import { saveLocalStorageClaim, getLocalStorageClaims } from "@/lib/paymentStorage";
import { logSimulatedEmail } from "@/lib/notificationLogs";

export const Route = createFileRoute("/membership")({
  component: Membership,
  loader: () => fetchSeoMetadata("membership"),
  head: ({ loaderData }) => ({
    title: loaderData?.title || "Membership — The Agriculture Popular Article Magazine",
    meta: loaderData
      ? [
          { name: "description", content: loaderData.description },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.description },
        ]
      : [],
  }),
});

type PlanId = "single" | "annual" | "lifetime" | "institute";

function Membership() {
  const { get, getJson } = useSiteContent("membership");
  const plans = getJson<"plans", "items", any[]>("plans", "items");
  const [activeTab, setActiveTab] = useState<"upi" | "bank">("upi");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Authentication states
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Form states
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("annual");
  const [amountPaid, setAmountPaid] = useState<string>("500");
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [claimId, setClaimId] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch session
  useEffect(() => {
    async function initSession() {
      try {
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        setSession(activeSession);
      } catch (err) {
        console.error("Error fetching session:", err);
      } finally {
        setLoadingSession(false);
      }
    }
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, activeSession) => {
      setSession(activeSession);
      setLoadingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update amount automatically when plan changes
  useEffect(() => {
    const plan = plans.find((p) => p.id === selectedPlan);
    if (plan && plan.amount) {
      setAmountPaid(String(plan.amount));
    }
  }, [selectedPlan, plans]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setReceiptFile(null);
      return;
    }
    // Limit to images/pdf and 5MB
    const isImageOrPdf = file.type.startsWith("image/") || file.type === "application/pdf";
    if (!isImageOrPdf) {
      toast.error("Only receipt screenshot images (.png, .jpg, .jpeg) or PDFs are accepted.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be smaller than 5 MB.");
      return;
    }
    setReceiptFile(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast.error("Please sign in to submit a payment claim.");
      return;
    }
    const cleanRef = transactionRef.trim();
    if (!cleanRef || cleanRef.length < 4 || cleanRef.length > 50) {
      toast.error("Invalid Transaction Reference ID (UTR). It must be between 4 and 50 alphanumeric characters.");
      return;
    }
    if (cleanRef.includes("\n") || cleanRef.includes("[DEBUG]") || cleanRef.includes("[ERROR]")) {
      toast.error("Invalid Transaction Reference ID (UTR) format. Please enter a valid transaction reference.");
      return;
    }
    if (!receiptFile) {
      toast.error("Please upload a receipt screenshot as proof of payment.");
      return;
    }

    // Deduplication check
    const existingClaims = getLocalStorageClaims();
    const isDuplicate = existingClaims.some(
      (c) => c.transaction_ref.trim().toLowerCase() === transactionRef.trim().toLowerCase()
    );
    if (isDuplicate) {
      toast.error("This Transaction Reference (UTR) has already been submitted.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload receipt to Storage bucket 'payment-receipts'
      const fileExt = receiptFile.name.slice(receiptFile.name.lastIndexOf(".")).toLowerCase();
      const storagePath = `${session.user.id}/${Date.now()}_receipt${fileExt}`;
      
      let uploadSuccessful = false;
      try {
        const { error: uploadErr } = await supabase.storage
          .from("payment-receipts")
          .upload(storagePath, receiptFile, {
            contentType: receiptFile.type || "application/octet-stream",
            cacheControl: "3600",
            upsert: false
          });
        if (!uploadErr) {
          uploadSuccessful = true;
        }
      } catch (uploadExc) {
        console.warn("Storage bucket upload exception, will fallback:", uploadExc);
      }

      // 2. Insert payment verification record
      const numAmount = parseFloat(amountPaid);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("Invalid transaction amount.");
      }

      const { data: claimData, error: dbErr } = await supabase
        .from("membership_payments")
        .insert({
          user_id: session.user.id,
          plan: selectedPlan,
          amount: numAmount,
          transaction_ref: transactionRef.trim(),
          payment_method: activeTab,
          receipt_path: uploadSuccessful ? storagePath : null,
          status: "pending"
        })
        .select()
        .single();

      if (dbErr || !claimData) {
        throw dbErr || new Error("Failed to register claim in the database.");
      }

      setClaimId(claimData.id);
      setSubmitSuccess(true);
      toast.success("Payment verification claim registered in database!");
      
      // Dispatch simulated email notification to editors
      const { data: dbProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();
      const authorName = dbProfile?.full_name || "Agri Author";

      logSimulatedEmail(
        "New Payment Claim Submitted",
        "dkdkdangi@gmail.com",
        `Dear Editor-in-Chief,\n\nA new online payment claim has been submitted for review:\n\nAuthor Name: ${authorName}\nPlan: ${selectedPlan.toUpperCase()}\nAmount: ₹${numAmount}\nPayment Method: ${activeTab.toUpperCase()}\nTransaction UTR Ref: ${transactionRef.trim()}\nClaim ID: ${claimData.id}\n\nPlease review and approve this claim in the administrative board console.\n\nWarm regards,\nAgri Magazine Notification System`
      );

      // Clear form inputs
      setTransactionRef("");
      setReceiptFile(null);
    } catch (err: any) {
      console.warn("Remote database insertion failed. Attempting offline local storage fallback. Error details:", err);
      
      try {
        const numAmount = parseFloat(amountPaid);
        if (isNaN(numAmount) || numAmount <= 0) {
          toast.error("Invalid transaction amount.");
          setSubmitting(false);
          return;
        }

        const mockClaim = saveLocalStorageClaim({
          user_id: session.user.id,
          plan: selectedPlan,
          amount: numAmount,
          transaction_ref: transactionRef.trim(),
          payment_method: activeTab,
          receipt_path: receiptFile ? receiptFile.name : null,
          status: "pending",
          notes: null
        });

        setClaimId(mockClaim.id);
        setSubmitSuccess(true);
        toast.info("Offline Mode: Claim registered successfully in local storage!");
        
        // Log simulated email dispatch
        logSimulatedEmail(
          "New Payment Claim Submitted (Offline)",
          "dkdkdangi@gmail.com",
          `Dear Editor-in-Chief,\n\nA new payment claim has been submitted offline (Local Storage fallback):\n\nAuthor Name: Dr. Anand Kumar (Test Author)\nPlan: ${selectedPlan.toUpperCase()}\nAmount: ₹${numAmount}\nPayment Method: ${activeTab.toUpperCase()}\nTransaction UTR Ref: ${transactionRef.trim()}\nClaim ID: ${mockClaim.id}\n\nPlease review and approve this claim in the administrative board console.\n\nWarm regards,\nAgri Magazine Notification System`
        );

        // Clear form inputs
        setTransactionRef("");
        setReceiptFile(null);
      } catch (fallbackErr) {
        console.error("Local storage fallback failed:", fallbackErr);
        toast.error("Failed to save verification claim. Please check your inputs.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectPlan = (planId: PlanId) => {
    setSelectedPlan(planId);
    // Scroll smoothly to form section
    document.getElementById("verification-anchor")?.scrollIntoView({ behavior: "smooth" });
  };

  const upiQrUrl = get("payment", "upi_qr_url");
  const upiNumber = get("payment", "upi_number");
  const bankHolder = get("payment", "bank_holder");

  // Format standard UPI URL if it's an email/VPA or just phone number
  const isVpa = upiNumber.includes("@");
  const upiPayload = `upi://pay?pa=${encodeURIComponent(upiNumber)}&pn=${encodeURIComponent(bankHolder)}&cu=INR`;
  const generatedQr = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiPayload)}`;
  const qrSrc = upiQrUrl || generatedQr;

  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16">
        <div className="eyebrow text-center">Membership</div>
        <h1 className="font-display text-5xl md:text-6xl mt-3 text-ink text-center max-w-3xl mx-auto leading-[1.05]">
          {get("hero", "heading")}
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-center text-foreground/70">
          {get("hero", "subtext")}
        </p>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p: any) => (
            <div
              key={p.id}
              className={`border p-7 flex flex-col ${p.featured ? "bg-ink text-background border-ink" : "bg-paper border-rule"}`}
            >
              {p.featured && <div className="eyebrow text-background/70 mb-3">Most popular</div>}
              <h3 className="font-display text-2xl">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <div className="font-display text-4xl">{p.price}</div>
                <div
                  className={`text-xs ${p.featured ? "text-background/60" : "text-muted-foreground"}`}
                >
                  {p.period}
                </div>
              </div>
              <div
                className={`text-xs uppercase tracking-wider mt-2 ${p.featured ? "text-ochre" : "text-orange"} font-semibold`}
              >
                {p.validity}
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {p.features.map((f: string) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check
                      className={`h-4 w-4 mt-0.5 shrink-0 ${p.featured ? "text-ochre" : "text-primary"}`}
                    />{" "}
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSelectPlan(p.id as PlanId)}
                className={`mt-7 inline-flex justify-center items-center px-4 py-3 rounded-sm text-sm cursor-pointer transition ${
                  p.featured 
                    ? "bg-background text-ink hover:bg-background/90" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                Get started
              </button>
            </div>
          ))}
        </div>

        {/* Payment panel */}
        <section id="verification-anchor" className="mt-24 border-t border-rule pt-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="eyebrow">Payment Settlement</div>
            <h2 className="font-display text-3xl md:text-4xl mt-3 text-ink">
              {get("payment", "heading")}
            </h2>
            <p className="mt-4 text-foreground/70">
              {get("payment", "body")}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {/* Direct Settlement Panel */}
            <div className="lg:col-span-2 bg-paper border border-rule p-8 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
              
              <div>
                <div className="flex justify-between items-center border-b border-rule pb-5 mb-6">
                  <div>
                    <h3 className="font-display text-2xl text-ink">Offline Direct Payment</h3>
                    <p className="text-xs text-muted-foreground mt-1">Direct settlement methods</p>
                  </div>
                  <div className="flex bg-muted p-1 rounded-md text-xs font-medium">
                    <button
                      onClick={() => setActiveTab("upi")}
                      className={`px-3 py-1.5 rounded transition-all duration-200 cursor-pointer ${
                        activeTab === "upi"
                          ? "bg-background text-foreground shadow-sm font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      UPI / QR Code
                    </button>
                    <button
                      onClick={() => setActiveTab("bank")}
                      className={`px-3 py-1.5 rounded transition-all duration-200 cursor-pointer ${
                        activeTab === "bank"
                          ? "bg-background text-foreground shadow-sm font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Bank Transfer
                    </button>
                  </div>
                </div>

                {activeTab === "upi" ? (
                  <div className="grid md:grid-cols-5 gap-8 items-center">
                    {/* QR Code Graphic Container */}
                    <div className="md:col-span-2 flex flex-col items-center">
                      <div className="relative p-4 bg-background border border-rule shadow-md group overflow-hidden rounded-lg">
                        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-orange to-ochre top-0 animate-bounce pointer-events-none opacity-40" />
                        <img
                          src={qrSrc}
                          alt="UPI QR Code"
                          className="w-44 h-44 object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-3 flex items-center gap-1 font-mono uppercase tracking-wider">
                        <QrCode className="h-3 w-3" /> Scannable QR Code
                      </span>
                    </div>

                    {/* UPI details */}
                    <div className="md:col-span-3 space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange/10 text-orange rounded-full text-xs font-semibold">
                        <Smartphone className="h-3.5 w-3.5" /> Mobile Wallet Settlement
                      </div>
                      <div>
                        <h4 className="font-display text-lg text-ink font-bold">Scan & Pay securely</h4>
                        <p className="text-xs text-foreground/75 mt-1 leading-relaxed">
                          Open PhonePe, Google Pay, Paytm, or your bank's UPI scanner. Scan the code to settle the fee, or copy the merchant ID below:
                        </p>
                      </div>

                      <div className="bg-background border border-rule p-4 flex items-center justify-between rounded">
                        <div className="overflow-hidden">
                          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Merchant UPI VPA</div>
                          <div className="font-mono text-base text-ink mt-1 font-bold break-all">{upiNumber}</div>
                        </div>
                        <button
                          onClick={() => handleCopy(upiNumber, "upi")}
                          className={`ml-4 p-2.5 rounded border transition-all shrink-0 cursor-pointer ${
                            copiedText === "upi"
                              ? "bg-green-50 border-green-200 text-green-600"
                              : "bg-paper border-rule hover:bg-muted text-foreground"
                          }`}
                        >
                          {copiedText === "upi" ? (
                            <span className="text-xs font-semibold px-1">Copied!</span>
                          ) : (
                            <span className="text-xs font-semibold px-1 flex items-center gap-1">
                              <Copy className="h-3.5 w-3.5" /> Copy
                            </span>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        * merchant verification matches registered name: <strong>{bankHolder}</strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                      <Banknote className="h-3.5 w-3.5" /> Direct Bank Deposit
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { label: "Account Holder", value: bankHolder, copyKey: "holder" },
                        { label: "Account Number", value: get("payment", "bank_account"), copyKey: "acc" },
                        { label: "Bank Name", value: get("payment", "bank_name") },
                        { label: "IFSC Code", value: get("payment", "bank_ifsc"), copyKey: "ifsc" },
                        { label: "Branch", value: get("payment", "bank_branch") },
                      ].map((field) => (
                        <div
                          key={field.label}
                          className="bg-background border border-rule p-4 rounded flex justify-between items-center group relative overflow-hidden"
                        >
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                              {field.label}
                            </span>
                            <span className="font-mono text-ink text-sm font-bold block mt-1">
                              {field.value}
                            </span>
                          </div>
                          {field.copyKey && (
                            <button
                              onClick={() => handleCopy(field.value, field.copyKey!)}
                              className={`p-2 rounded border transition-all shrink-0 cursor-pointer ${
                                copiedText === field.copyKey
                                  ? "bg-green-50 border-green-200 text-green-600"
                                  : "bg-paper border-rule opacity-60 group-hover:opacity-100 hover:bg-muted text-foreground"
                              }`}
                            >
                              {copiedText === field.copyKey ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-rule flex flex-col md:flex-row gap-4 items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-green-600 animate-pulse" /> Manual Verification is 100% Secure
                </span>
                <span>Support: <a href={`mailto:${get("payment", "contact_email")}`} className="underline text-orange font-semibold">{get("payment", "contact_email")}</a></span>
              </div>
            </div>

            {/* Right: Offline Proof Form */}
            <div className="bg-ink text-background p-8 border border-ink flex flex-col justify-between shadow-lg relative overflow-hidden group">
              <div className="absolute -right-24 -bottom-24 w-64 h-64 bg-ochre/15 rounded-full blur-3xl group-hover:bg-ochre/25 transition-all duration-500 pointer-events-none" />
              
              {loadingSession ? (
                <div className="flex flex-col items-center justify-center py-20 text-background/60 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-ochre" />
                  <span className="text-xs">Checking authorization...</span>
                </div>
              ) : submitSuccess ? (
                // Submission Successful Screen
                <div className="flex flex-col h-full justify-between z-10 text-center py-6">
                  <div className="space-y-6 overflow-y-auto max-h-[380px] pr-1">
                    <div className="w-16 h-16 bg-sage/20 border border-green-400 text-green-400 rounded-full flex items-center justify-center mx-auto shadow-inner animate-pulse">
                      <CheckCircle2 className="h-8 w-8 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-display text-2xl text-background">Claim Registered!</h3>
                      <p className="text-xs text-background/60 mt-1 font-mono uppercase">Ticket ID: #{claimId.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <p className="text-xs text-background/80 leading-relaxed px-2">
                      Our editorial team has received your receipt proof and transaction reference. We will cross-examine the bank settlement and activate your plan within <strong>2 business days</strong>.
                    </p>
                    <div className="bg-ochre/15 border border-ochre/30 p-3.5 rounded-sm text-[11px] text-ochre text-left space-y-2 mt-4">
                      <p className="font-semibold flex items-center gap-1 text-ochre">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-ochre" /> Important Offline Notice
                      </p>
                      <p className="leading-relaxed text-background/90">
                        Your verification claim and status are stored <strong>locally in this browser</strong>. Please screenshot your Ticket ID: <strong className="font-mono text-background bg-ink px-1.5 py-0.5 rounded border border-background/25">#{claimId.slice(0, 8).toUpperCase()}</strong> for your records.
                      </p>
                      <p className="leading-relaxed text-background/60 text-[10px]">
                        Note: To access this claim across other devices or sync with our central systems, the backend database must be fully deployed.
                      </p>
                    </div>
                  </div>

                  <div className="mt-12 space-y-3">
                    <Link
                      to="/dashboard"
                      className="w-full inline-flex justify-center items-center py-2.5 bg-background text-ink hover:bg-background/90 text-xs font-semibold rounded-sm uppercase transition"
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={() => setSubmitSuccess(false)}
                      className="text-[10px] text-background/50 hover:text-background/80 transition underline"
                    >
                      Submit another claim
                    </button>
                  </div>
                </div>
              ) : (
                // Payment Claim Form (Accessible to Authenticated and Guest Users in Preview Mode)
                <form onSubmit={handleFormSubmit} className="flex flex-col h-full justify-between z-10">
                  <div>
                    <div className="flex justify-between items-start pb-4 border-b border-background/10">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-ochre font-semibold px-2.5 py-0.5 bg-ochre/15 rounded-full">
                          {!session ? "Preview Mode" : "Verify Transfer"}
                        </span>
                        <h3 className="font-display text-xl mt-1 text-background">Settle Claim Proof</h3>
                      </div>
                      <ShieldCheck className="h-5 w-5 text-ochre" />
                    </div>

                    {!session && (
                      <div className="mt-4 bg-orange/10 border border-orange/20 p-3 rounded text-[11px] text-background flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-ochre shrink-0 mt-0.5 animate-bounce" />
                        <div>
                          <span className="font-bold text-ochre">Authentication Required</span>
                          <p className="mt-0.5 text-background/70 leading-relaxed">
                            Sign in to upload receipt screenshots and log your claim in the verification queue.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 space-y-4 text-xs text-background/90">
                      {/* Plan Selection Dropdown */}
                      <div>
                        <label className="text-sm font-sans font-medium block mb-2 text-background/80">
                          Selected Membership Plan
                        </label>
                        <select
                          disabled={!session}
                          value={selectedPlan}
                          onChange={(e) => setSelectedPlan(e.target.value as PlanId)}
                          className="w-full h-12 bg-background/10 border border-background/20 px-4 text-background rounded-sm focus:outline-none focus:border-ochre focus:bg-ink font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option className="bg-ink text-background" value="single">Single Article (₹200)</option>
                          <option className="bg-ink text-background" value="annual">Annual Membership (₹500)</option>
                          <option className="bg-ink text-background" value="lifetime">Lifetime Membership (₹2,000)</option>
                          <option className="bg-ink text-background" value="institute">Institute / Library (₹5,000)</option>
                        </select>
                      </div>

                      {/* Amount Paid Field */}
                      <div>
                        <label className="text-sm font-sans font-medium block mb-2 text-background/80">
                          Amount Settled (INR)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-background/50 font-bold">₹</span>
                          <input
                            type="text"
                            required
                            disabled={!session}
                            value={amountPaid}
                            onChange={(e) => setAmountPaid(e.target.value)}
                            placeholder="Amount settled"
                            className="w-full h-12 bg-background/10 border border-background/20 pl-8 pr-4 text-background rounded-sm focus:outline-none focus:border-ochre font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>

                      {/* Transaction Reference Number (UTR) */}
                      <div>
                        <label className="text-sm font-sans font-medium block mb-2 text-background/80">
                          Transaction Ref ID / UTR
                        </label>
                        <input
                          type="text"
                          required
                          disabled={!session}
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          placeholder={!session ? "Log in to fill details..." : "e.g. 12-digit UTR or Txn ID"}
                          className="w-full h-12 bg-background/10 border border-background/20 px-4 text-background rounded-sm focus:outline-none focus:border-ochre font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      {/* Receipt upload screenshot */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-background/50 font-bold mb-1.5">
                          Payment Screenshot Receipt (Max 5MB)
                        </label>
                        <input
                          type="file"
                          ref={fileInputRef}
                          disabled={!session}
                          onChange={onFileChange}
                          accept="image/*,application/pdf"
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={!session}
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border border-dashed border-background/30 bg-background/5 p-4 rounded hover:bg-background/10 hover:border-background/60 transition flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
                        >
                          {receiptFile ? (
                            <>
                              <FileText className="h-5 w-5 text-ochre" />
                              <span className="font-semibold block truncate max-w-xs">{receiptFile.name}</span>
                              <span className="text-[10px] text-background/50">({(receiptFile.size / 1024).toFixed(0)} KB)</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-5 w-5 text-ochre/80" />
                              <span className="font-medium text-xs">Attach Receipt Screenshot</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    {!session ? (
                      <Link
                        to="/auth"
                        search={{ redirect: "/membership" }}
                        className="w-full h-12 bg-ochre hover:bg-ochre/90 text-ink text-sm text-center font-semibold rounded-sm tracking-wide transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        Sign In & Submit Claim
                      </Link>
                    ) : (
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-12 bg-ochre hover:bg-ochre/90 disabled:opacity-60 text-ink text-sm text-center font-semibold rounded-sm tracking-wide transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading Proof...
                          </>
                        ) : (
                          "Submit Verification Claim"
                        )}
                      </button>
                    )}
                    <div className="text-[9px] text-center text-background/50 leading-normal">
                      {!session
                        ? "Requires active author or organization account to settle payment verification claims."
                        : "By submitting, you declare that you have initiated this transaction and that the details match your bank settlement. Settle responsibly."
                      }
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>

          <p className="mt-12 text-center text-sm text-foreground/60 max-w-2xl mx-auto bg-muted/30 border border-rule/50 p-4 rounded-lg leading-relaxed">
            <strong>Next Steps:</strong>Settle your membership fee via the scannable UPI code or direct bank deposit details on the left. Once paid, fill out the <strong>Settle Claim Proof</strong> form on the right. After verification, your profile will be updated immediately.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
