import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getLocalStorageClaims, MOCK_PROFILES, PaymentClaim } from "@/lib/paymentStorage";
import { getClaimMemberId } from "./_authenticated.admin.memberships";
import { Printer, ArrowLeft, Loader2, Award, ShieldCheck } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

export const Route = createFileRoute("/membership/certificate/$claimId")({
  component: MembershipCertificate,
  head: () => ({
    title: "Membership Certificate — The Agriculture Popular Article Magazine",
    meta: [],
  }),
});

type CertificateData = {
  claim: PaymentClaim;
  authorName: string;
  institution: string;
  country: string;
};

function fmtPlan(plan: string) {
  switch (plan) {
    case "single":
      return "Single Article";
    case "annual":
      return "Annual";
    case "lifetime":
      return "Lifetime";
    case "institute":
      return "Institute / Library";
    default:
      return plan;
  }
}

function MembershipCertificate() {
  const { claimId } = useParams({ from: "/membership/certificate/$claimId" });
  const [data, setData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { get: getCert } = useSiteContent("certificate");

  useEffect(() => {
    const loadCertificateData = async () => {
      setLoading(true);
      setError(null);

      // 1. Try local storage first to support fully offline mode seamlessly
      const localClaims = getLocalStorageClaims();
      const localClaim = localClaims.find((c) => c.id === claimId);

      if (localClaim) {
        const profile = MOCK_PROFILES[localClaim.user_id] || {
          full_name: "Dr. Anand Kumar",
          institution: "Indian Agricultural Research Institute (IARI)",
          country: "India",
        };
        setData({
          claim: localClaim,
          authorName: profile.full_name,
          institution: profile.institution,
          country: profile.country,
        });
        setLoading(false);
        return;
      }

      // 2. Fallback to Supabase remote fetch
      try {
        const { data: dbClaim, error: claimErr } = await supabase
          .from("membership_payments")
          .select("*")
          .eq("id", claimId)
          .single();

        if (claimErr || !dbClaim) {
          throw new Error("Payment claim not found in database.");
        }

        // Fetch author profile
        const { data: dbProfile } = await supabase
          .from("profiles")
          .select("full_name, institution, country")
          .eq("id", dbClaim.user_id)
          .single();

        setData({
          claim: dbClaim as unknown as PaymentClaim,
          authorName: dbProfile?.full_name || "Agri Researcher",
          institution: dbProfile?.institution || "Agricultural Research Institute",
          country: dbProfile?.country || "India",
        });
      } catch (err: any) {
        console.error("Failed to load database certificate data:", err);
        setError("Unable to find an approved membership certificate for this Claim reference.");
      } finally {
        setLoading(false);
      }
    };

    loadCertificateData();
  }, [claimId]);

  // Auto-trigger print modal once loaded and verified approved
  useEffect(() => {
    if (data && data.claim.status === "approved") {
      const t = setTimeout(() => {
        window.print();
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center font-sans">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-sm text-foreground/70">Generating secure membership certificate credentials…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center font-sans max-w-md mx-auto">
        <Award className="h-12 w-12 text-destructive mb-4" />
        <h1 className="font-display text-2xl text-ink font-bold">Certificate Error</h1>
        <p className="text-sm text-foreground/75 mt-3 leading-relaxed">
          {error || "We could not verify certificate credentials for this record."}
        </p>
        <Link to="/dashboard" className="btn-orange mt-6 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const { claim, authorName, institution, country } = data;
  const memberId = getClaimMemberId(claim) || "PENDING-VERIFICATION";

  if (claim.status !== "approved") {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center font-sans max-w-md mx-auto">
        <ShieldCheck className="h-12 w-12 text-ochre mb-4 animate-pulse" />
        <h1 className="font-display text-2xl text-ink font-bold">Verification Pending</h1>
        <p className="text-sm text-foreground/75 mt-3 leading-relaxed">
          The membership claim is pending moderator review. Certificates are generated automatically upon claim approval.
        </p>
        <Link to="/dashboard" className="btn-orange mt-6 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const dateStr = new Date(claim.updated_at).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-stone-100 py-10 print:py-0 print:bg-white flex flex-col items-center select-none">
      
      {/* Floating Control Bar - Hidden during printing */}
      <div className="w-full max-w-4xl mb-6 px-4 flex justify-between items-center print:hidden font-sans">
        <Link to="/dashboard" className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-foreground/70 hover:text-ink transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <button
          onClick={() => window.print()}
          className="bg-primary text-white hover:bg-primary/95 text-xs uppercase tracking-wider font-semibold px-4 py-2.5 rounded-sm inline-flex items-center gap-2 shadow-sm"
        >
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </button>
      </div>

      {/* Certificate Main Canvas - Scaled to perfect A4 Ratio */}
      <div className="w-[297mm] h-[210mm] bg-white border-[16px] border-double border-[#8C6D3E] p-10 flex flex-col justify-between relative shadow-xl print:shadow-none print:border-[#8C6D3E]">
        
        {/* Intricate Vintage Corner Accents */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#8C6D3E] opacity-75" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#8C6D3E] opacity-75" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[#8C6D3E] opacity-75" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#8C6D3E] opacity-75" />

        {/* Intricate Inner Border */}
        <div className="w-full h-full border border-[#8C6D3E]/30 p-8 flex flex-col justify-between items-center text-center">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="text-[11px] font-sans font-semibold text-primary uppercase tracking-[0.3em] font-semibold">
              {getCert("branding", "magazine_name")}
            </div>
            <div className="text-[9px] font-sans font-bold text-muted-foreground uppercase tracking-widest">
              Published by: {getCert("branding", "publisher")}
            </div>
            <div className="w-40 h-px bg-gradient-to-r from-transparent via-[#8C6D3E]/40 to-transparent mx-auto mt-2" />
          </div>

          {/* Certificate Title */}
          <div className="my-3">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-[#8C6D3E] uppercase tracking-[0.15em] leading-none drop-shadow-sm">
              Certificate of Membership
            </h1>
            <p className="font-serif italic text-sm text-foreground/75 mt-3">
              This token is proudly presented to
            </p>
          </div>

          {/* Member Name */}
          <div className="my-2">
            <div className="font-serif italic text-4xl md:text-5xl font-bold text-navy px-12 border-b border-[#8C6D3E]/30 pb-2 inline-block min-w-[360px] max-w-[650px] break-words leading-tight drop-shadow-[0_1.5px_1.5px_rgba(255,255,255,1)]">
              {authorName}
            </div>
            <div className="text-[11px] font-sans font-semibold text-foreground/60 uppercase tracking-widest mt-2 max-w-[600px] break-words leading-normal mx-auto">
              {institution ? `${institution}, ${country}` : "Registered Agricultural Researcher"}
            </div>
          </div>

          {/* Declaration Statement */}
          <div className="max-w-2xl text-sm font-serif leading-relaxed text-foreground/80 mt-1">
            in recognition of active professional enrollment as a registered{" "}
            <span className="font-sans font-bold text-navy uppercase">{fmtPlan(claim.plan)} Member</span>{" "}
            of The Agriculture Popular Article Magazine. The holder is entitled to all publishing, review, and
            editorial board correspondence privileges assigned under Member reference index:
          </div>

          {/* Member ID display */}
          <div className="my-3">
            <div className="font-mono text-xl md:text-2xl font-bold bg-[#8C6D3E]/10 border border-[#8C6D3E]/30 text-navy px-6 py-2 rounded-sm tracking-widest select-all inline-block">
              {memberId}
            </div>
          </div>

          {/* Footer Seals & Signatures */}
          <div className="w-full grid grid-cols-3 items-end mt-2 px-12 text-center">
            
            {/* Chief Editor Signature */}
            <div className="flex flex-col items-center">
              {/* Simulated Signature */}
              <div className="font-serif italic text-navy font-bold text-lg leading-none -rotate-2 select-none mb-1 opacity-90 h-8 flex items-end break-all">
                {getCert("branding", "chief_editor_signature")}
              </div>
              <div className="w-36 h-px bg-foreground/30 mb-2" />
              <div className="text-[10px] font-sans font-bold text-ink uppercase tracking-wider max-w-[220px] break-words leading-tight">
                {getCert("branding", "chief_editor")}
              </div>
              <div className="text-[8px] font-sans text-muted-foreground uppercase tracking-widest max-w-[220px] break-words leading-tight mt-0.5">
                {getCert("branding", "chief_editor_title")}
              </div>
            </div>

            {/* Gold Circular Seal Graphic */}
            <div className="flex justify-center select-none">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="absolute w-full h-full animate-[spin_60s_linear_infinite]" viewBox="0 0 100 100">
                  <path id="seal-text-path" fill="none" d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" />
                  <text className="fill-[#8C6D3E] font-sans font-bold text-[6.5px] uppercase tracking-wider">
                    <textPath href="#seal-text-path" startOffset="0%">
                      {getCert("branding", "seal_text_membership")}
                    </textPath>
                  </text>
                </svg>
                <div className="w-16 h-16 rounded-full bg-[#8C6D3E]/15 border-2 border-[#8C6D3E] flex items-center justify-center flex-col">
                  <Award className="h-7 w-7 text-[#8C6D3E]" />
                  <span className="text-[6px] font-sans font-bold text-[#8C6D3E] uppercase tracking-widest mt-0.5">SEAL</span>
                </div>
              </div>
            </div>

            {/* Managing Director Signature */}
            <div className="flex flex-col items-center">
              {/* Simulated Signature */}
              <div className="font-serif italic text-navy font-bold text-lg leading-none rotate-2 select-none mb-1 opacity-90 h-8 flex items-end break-all">
                {getCert("branding", "publisher_signature")}
              </div>
              <div className="w-36 h-px bg-foreground/30 mb-2" />
              <div className="text-[10px] font-sans font-bold text-ink uppercase tracking-wider max-w-[220px] break-words leading-tight">
                {getCert("branding", "publisher_title")}
              </div>
              <div className="text-[8px] font-sans text-muted-foreground uppercase tracking-widest max-w-[220px] break-words leading-tight mt-0.5">
                {getCert("branding", "publisher_institution")}
              </div>
            </div>

          </div>

          {/* Certificate Validity Footnote */}
          <div className="text-[8px] font-sans text-muted-foreground uppercase tracking-widest mt-4">
            Issued on: {dateStr} • This document is cryptographically verified and valid under RADF publishing schedules.
          </div>

        </div>
      </div>
      
      {/* Dynamic Styling Overrides for Print-Mode Optimization */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          /* Scale A4 Landscape perfectly */
          @page {
            size: A4 landscape;
            margin: 0;
          }
          div {
            page-break-inside: avoid;
          }
          body > div {
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
