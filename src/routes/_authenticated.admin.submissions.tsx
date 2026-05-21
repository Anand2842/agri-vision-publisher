import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileUp, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/submissions")({
  component: AdminSubmissions,
});

type Sub = {
  id: string;
  title: string;
  abstract: string;
  keywords: string | null;
  status: string;
  plan: string;
  user_id: string;
  category_id: string | null;
  notes: string | null;
  content: string | null;
  manuscript_path: string | null;
  created_at: string;
};

type Issue = { id: string; volume: number; issue_number: number; title: string };
type Cat = { id: string; name: string };

const STATUSES = [
  "submitted",
  "under_review",
  "revision_requested",
  "approved",
  "published",
  "rejected",
];

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

function AdminSubmissions() {
  const [rows, setRows] = useState<Sub[] | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");

  // Promote flow state
  const [promotingSub, setPromotingSub] = useState<Sub | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customAbstract, setCustomAbstract] = useState("");

  const load = async () => {
    const [subRes, issueRes, catRes] = await Promise.all([
      supabase.from("submissions").select("*").order("created_at", { ascending: false }),
      supabase
        .from("issues")
        .select("id,volume,issue_number,title")
        .order("volume", { ascending: false }),
      supabase.from("categories").select("id,name").order("name"),
    ]);

    if (subRes.error) toast.error(subRes.error.message);
    if (issueRes.error) toast.error(issueRes.error.message);
    if (catRes.error) toast.error(catRes.error.message);

    setRows((subRes.data as Sub[]) || []);
    setIssues((issueRes.data as Issue[]) || []);
    setCats((catRes.data as Cat[]) || []);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (promotingSub) {
      setCustomTitle(promotingSub.title);
      setCustomSlug(generateSlug(promotingSub.title));
      setSelectedCategoryId(promotingSub.category_id || "");
      setCustomAbstract(promotingSub.abstract || "");
      if (issues.length > 0) {
        setSelectedIssueId(issues[0].id);
      } else {
        setSelectedIssueId("");
      }
    }
  }, [promotingSub, issues]);

  const setStatus = async (id: string, status: string, notes?: string) => {
    const { error } = await supabase
      .from("submissions")
      .update({
        status: status as
          | "submitted"
          | "under_review"
          | "revision_requested"
          | "approved"
          | "published"
          | "rejected",
        ...(notes != null ? { notes } : {}),
      })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    load();
  };

  const handlePromote = async () => {
    if (!promotingSub) return;
    setIsPromoting(true);

    try {
      let pdfUrl: string | null = null;

      // Transfer file from manuscripts (private) to article-pdfs (public)
      if (promotingSub.manuscript_path) {
        toast.info("Transferring manuscript to public storage...");
        const { data: blob, error: downloadError } = await supabase.storage
          .from("manuscripts")
          .download(promotingSub.manuscript_path);

        if (downloadError)
          throw new Error(`Failed to download manuscript: ${downloadError.message}`);

        const fileExt = promotingSub.manuscript_path.slice(
          promotingSub.manuscript_path.lastIndexOf("."),
        );
        const newPath = `promoted/${promotingSub.id}-${Date.now()}${fileExt}`;

        let contentType = "application/octet-stream";
        if (fileExt.toLowerCase() === ".pdf") contentType = "application/pdf";
        else if (fileExt.toLowerCase() === ".docx") {
          contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else if (fileExt.toLowerCase() === ".doc") {
          contentType = "application/msword";
        }

        const { error: uploadError } = await supabase.storage
          .from("article-pdfs")
          .upload(newPath, blob, { contentType, upsert: true });

        if (uploadError) throw new Error(`Failed to upload manuscript: ${uploadError.message}`);

        const { data: publicUrlData } = supabase.storage.from("article-pdfs").getPublicUrl(newPath);

        pdfUrl = publicUrlData.publicUrl;
      }

      // Estimate read time
      const wordCount = (promotingSub.content || "").trim().split(/\s+/).length || 5;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));

      // Insert article
      const articlePayload = {
        title: customTitle,
        slug: customSlug || generateSlug(customTitle),
        abstract: customAbstract || null,
        content: promotingSub.content || "",
        author_id: promotingSub.user_id,
        category_id: selectedCategoryId || null,
        issue_id: selectedIssueId || null,
        status: "published" as const,
        pdf_url: pdfUrl,
        published_at: new Date().toISOString(),
        read_time: readTime,
      };

      const { error: insertError } = await supabase.from("articles").insert(articlePayload);

      if (insertError) throw insertError;

      // Update submission status to 'published'
      const { error: updateError } = await supabase
        .from("submissions")
        .update({ status: "published" })
        .eq("id", promotingSub.id);

      if (updateError) throw updateError;

      toast.success("Successfully promoted submission to a published article!");
      setPromotingSub(null);
      load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to promote submission";
      toast.error(message);
    } finally {
      setIsPromoting(false);
    }
  };

  const filtered = (rows || []).filter((r) => !filter || r.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-ink">Submissions</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-background border border-rule px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 border border-rule">
        {rows === null ? (
          <div className="p-10 text-center text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">No submissions.</div>
        ) : (
          <ul className="divide-y divide-rule">
            {filtered.map((s) => (
              <li key={s.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-display text-lg text-ink">{s.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      #{s.id.slice(0, 8).toUpperCase()} ·{" "}
                      {new Date(s.created_at).toLocaleDateString()} · plan {s.plan}
                    </div>
                  </div>
                  <span className="text-[0.65rem] uppercase tracking-widest px-2 py-1 bg-muted rounded-sm shrink-0">
                    {s.status}
                  </span>
                </div>
                <button
                  onClick={() => setOpen(open === s.id ? null : s.id)}
                  className="mt-3 text-xs uppercase tracking-wider text-orange"
                >
                  {open === s.id ? "Hide details" : "Review"}
                </button>
                {open === s.id && (
                  <div className="mt-4 grid lg:grid-cols-[2fr_1fr] gap-6 border-t border-rule pt-4">
                    <div className="text-sm space-y-3">
                      <Section label="Abstract">{s.abstract}</Section>
                      {s.keywords && <Section label="Keywords">{s.keywords}</Section>}
                      {s.content && (
                        <Section label="Manuscript body">
                          <pre className="whitespace-pre-wrap font-sans">{s.content}</pre>
                        </Section>
                      )}
                      {s.manuscript_path && (
                        <div className="mt-2">
                          <button
                            onClick={async () => {
                              const { data, error } = await supabase.storage
                                .from("manuscripts")
                                .createSignedUrl(s.manuscript_path!, 300);
                              if (error || !data) {
                                return toast.error(
                                  error?.message ?? "Could not generate download link",
                                );
                              }
                              window.open(data.signedUrl, "_blank", "noopener");
                            }}
                            className="inline-flex items-center gap-2 border border-rule px-3 py-2 text-xs uppercase tracking-wider hover:border-orange transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" /> Download Manuscript File
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <label className="eyebrow block">Update status</label>
                      <select
                        defaultValue={s.status}
                        onChange={(e) => setStatus(s.id, e.target.value)}
                        className="w-full bg-background border border-rule px-3 py-2 text-sm"
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <label className="eyebrow block">Editorial notes</label>
                      <textarea
                        defaultValue={s.notes ?? ""}
                        rows={5}
                        onBlur={(e) =>
                          e.target.value !== (s.notes ?? "") &&
                          setStatus(s.id, s.status, e.target.value)
                        }
                        className="w-full bg-background border border-rule px-3 py-2 text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Notes save on blur.</p>
                    </div>

                    {s.status === "approved" && (
                      <div className="lg:col-span-2 border-t border-rule pt-4 mt-2 flex justify-end">
                        <button
                          onClick={() => setPromotingSub(s)}
                          className="bg-navy hover:bg-orange text-white px-4 py-2.5 text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
                        >
                          <FileUp className="h-4 w-4" /> Promote to Published Article
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={promotingSub !== null} onOpenChange={(open) => !open && setPromotingSub(null)}>
        <DialogContent className="sm:max-w-[550px] bg-paper border-rule">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-ink">
              Promote Submission to Article
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right eyebrow">Title</label>
              <input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="col-span-3 bg-background border border-rule px-3 py-2 text-sm focus:outline-none focus:border-orange"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right eyebrow">Slug</label>
              <input
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                className="col-span-3 bg-background border border-rule px-3 py-2 text-sm focus:outline-none focus:border-orange"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right eyebrow">Issue</label>
              <select
                value={selectedIssueId}
                onChange={(e) => setSelectedIssueId(e.target.value)}
                className="col-span-3 bg-background border border-rule px-3 py-2 text-sm focus:outline-none focus:border-orange"
              >
                <option value="">— Select Issue —</option>
                {issues.map((i) => (
                  <option key={i.id} value={i.id}>
                    V{i.volume}·I{i.issue_number} — {i.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right eyebrow">Category</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="col-span-3 bg-background border border-rule px-3 py-2 text-sm focus:outline-none focus:border-orange"
              >
                <option value="">— Select Category —</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right eyebrow mt-2">Abstract</label>
              <textarea
                value={customAbstract}
                onChange={(e) => setCustomAbstract(e.target.value)}
                rows={4}
                className="col-span-3 bg-background border border-rule px-3 py-2 text-sm focus:outline-none focus:border-orange"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              disabled={isPromoting}
              onClick={() => setPromotingSub(null)}
              className="px-4 py-2 border border-rule text-xs uppercase tracking-wider hover:bg-secondary transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPromoting}
              onClick={handlePromote}
              className="px-4 py-2 bg-navy hover:bg-orange text-white text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              {isPromoting ? "Promoting…" : "Confirm & Publish"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow mb-1">{label}</div>
      <div className="text-foreground/85">{children}</div>
    </div>
  );
}
