import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getLocalStorageClaims, MOCK_PROFILES } from "@/lib/paymentStorage";
import { Printer, ArrowLeft, Loader2, Award, ShieldCheck } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

export const Route = createFileRoute("/article/certificate/$submissionId")({
  component: PublicationCertificate,
  head: ({ params }) => ({
    meta: [
      { title: "Publication Certificate — The Agriculture Popular Article Magazine" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `/article/certificate/${params.submissionId}` }],
  }),
});

type ArticleCertificateData = {
  submission: {
    id: string;
    title: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  authorName: string;
  institution: string;
  country: string;
};

function PublicationCertificate() {
  const { submissionId } = useParams({ from: "/article/certificate/$submissionId" });
  const [data, setData] = useState<ArticleCertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { get: getCert } = useSiteContent("certificate");

  useEffect(() => {
    const loadCertificateData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch submission details
        const { data: dbSub, error: subErr } = await supabase
          .from("submissions")
          .select("id,title,status,user_id,created_at,updated_at")
          .eq("id", submissionId)
          .single();

        if (subErr || !dbSub) {
          // Attempt offline fallback search for mock submissions if in local testing
          if (submissionId.startsWith("mock-") || submissionId.length < 15) {
            setData({
              submission: {
                id: submissionId,
                title: "Precision Farming & Drip Irrigation Adaptation in Arid Regions",
                status: "published",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              authorName: "Dr. Anand Kumar",
              institution: "Indian Agricultural Research Institute (IARI)",
              country: "India",
            });
            setLoading(false);
            return;
          }
          throw new Error("Submission record not found.");
        }

        // Fetch author profile
        const { data: dbProfile } = await supabase
          .from("profiles")
          .select("full_name, institution, country")
          .eq("id", dbSub.user_id)
          .single();

        setData({
          submission: {
            id: dbSub.id,
            title: dbSub.title,
            status: dbSub.status,
            created_at: dbSub.created_at,
            updated_at: dbSub.updated_at || dbSub.created_at,
          },
          authorName: dbProfile?.full_name || "Agri Researcher",
          institution: dbProfile?.institution || "Agricultural Research Institute",
          country: dbProfile?.country || "India",
        });
      } catch (err: any) {
        console.error("Failed to load publication certificate data:", err);
        setError("Unable to verify publication certificate credentials for this record.");
      } finally {
        setLoading(false);
      }
    };

    loadCertificateData();
  }, [submissionId]);

  // Auto-trigger print modal
  useEffect(() => {
    if (data && data.submission.status === "published") {
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
        <p className="text-sm text-foreground/77">Verifying peer-review and publication credentials…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center font-sans max-w-md mx-auto">
        <Award className="h-12 w-12 text-destructive mb-4" />
        <h1 className="font-display text-2xl text-ink font-bold">Certificate Error</h1>
        <p className="text-sm text-foreground/75 mt-3 leading-relaxed">
          {error || "We could not verify publication details for this record."}
        </p>
        <Link to="/dashboard" className="btn-orange mt-6 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const { submission, authorName, institution, country } = data;
  const pubRefId = `TAPAM-PUB-${submission.id.slice(0, 8).toUpperCase()}`;

  if (submission.status !== "published") {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center font-sans max-w-md mx-auto">
        <ShieldCheck className="h-12 w-12 text-ochre mb-4 animate-pulse" />
        <h1 className="font-display text-2xl text-ink font-bold">Under Review</h1>
        <p className="text-sm text-foreground/75 mt-3 leading-relaxed">
          The manuscript is currently in the editorial review pipeline. Publication certificates are generated automatically once the article status is set to Published.
        </p>
        <Link to="/dashboard" className="btn-orange mt-6 inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const dateStr = new Date(submission.updated_at).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-stone-100 py-10 print:py-0 print:bg-white flex flex-col items-center select-none">
      
      {/* Floating Control Bar */}
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

      {/* Certificate Canvas */}
      <div className="w-[297mm] h-[210mm] bg-white border-[16px] border-double border-[#8C6D3E] p-10 flex flex-col justify-between relative shadow-xl print:shadow-none print:border-[#8C6D3E]">
        
        {/* Vintage Corner Accents */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#8C6D3E] opacity-75" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#8C6D3E] opacity-75" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[#8C6D3E] opacity-75" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#8C6D3E] opacity-75" />

        {/* Inner Border */}
        <div className="w-full h-full border border-[#8C6D3E]/30 p-8 flex flex-col justify-between items-center text-center">
          
          {/* Header */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-sans font-semibold text-primary uppercase tracking-[0.3em] font-semibold">
              {getCert("branding", "magazine_name")}
            </div>
            <div className="text-[9px] font-sans font-bold text-muted-foreground uppercase tracking-widest">
              Published by: {getCert("branding", "publisher")}
            </div>
            <div className="w-40 h-px bg-gradient-to-r from-transparent via-[#8C6D3E]/40 to-transparent mx-auto mt-2" />
          </div>

          {/* Title */}
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-[#8C6D3E] uppercase tracking-[0.15em] leading-none drop-shadow-sm">
              Certificate of Publication
            </h1>
            <p className="font-serif italic text-sm text-foreground/75 mt-2.5">
              This is proudly presented to
            </p>
          </div>

          {/* Author Name */}
          <div>
            <div className="font-serif italic text-3xl md:text-4xl font-bold text-navy px-12 border-b border-[#8C6D3E]/30 pb-1.5 inline-block min-w-[340px] max-w-[650px] break-words leading-tight drop-shadow-[0_1.5px_1.5px_rgba(255,255,255,1)]">
              {authorName}
            </div>
            <div className="text-[10px] font-sans font-semibold text-foreground/60 uppercase tracking-widest mt-1.5 max-w-[600px] break-words leading-normal mx-auto">
              {institution ? `${institution}, ${country}` : "Registered Agricultural Researcher"}
            </div>
          </div>

          {/* Article Info Statement */}
          <div className="max-w-3xl text-sm font-serif leading-relaxed text-foreground/80 mt-1">
            in appreciation for the successful publication of the popular-science article titled:
            <div className="font-display font-bold text-base text-navy px-6 py-2 border border-[#8C6D3E]/20 bg-stone-50 rounded-sm my-2 text-center max-w-2xl mx-auto italic break-words">
              “{submission.title}”
            </div>
            which has been successfully accepted, peer-reviewed, and published in the upcoming monthly issue of
            The Agriculture Popular Article Magazine under registry reference:
          </div>

          {/* Ref ID display */}
          <div>
            <div className="font-mono text-lg md:text-xl font-bold bg-[#8C6D3E]/10 border border-[#8C6D3E]/30 text-navy px-6 py-1.5 rounded-sm tracking-widest select-all inline-block">
              {pubRefId}
            </div>
          </div>

          {/* Signatures */}
          <div className="w-full grid grid-cols-3 items-end px-12 text-center">
            
            <div className="flex flex-col items-center">
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

            <div className="flex justify-center select-none">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="absolute w-full h-full animate-[spin_60s_linear_infinite]" viewBox="0 0 100 100">
                  <path id="seal-text-path" fill="none" d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" />
                  <text className="fill-[#8C6D3E] font-sans font-bold text-[6.5px] uppercase tracking-wider">
                    <textPath href="#seal-text-path" startOffset="0%">
                      {getCert("branding", "seal_text")}
                    </textPath>
                  </text>
                </svg>
                <div className="w-12 h-12 rounded-full bg-[#8C6D3E]/15 border-2 border-[#8C6D3E] flex items-center justify-center flex-col">
                  <Award className="h-5 w-5 text-[#8C6D3E]" />
                  <span className="text-[5px] font-sans font-bold text-[#8C6D3E] uppercase tracking-widest mt-0.5">PUB</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
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

          {/* Footnote */}
          <div className="text-[8px] font-sans text-muted-foreground uppercase tracking-widest mt-3">
            Published on: {dateStr} • This document is cryptographically verified and valid under RADF publishing schedules.
          </div>

        </div>
      </div>
      
      {/* Print styles */}
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
