import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { friendlyZodError } from "@/lib/form-errors";
import { z } from "zod";
import { FileText, Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/submit")({
  component: Submit,
  head: () => ({
    meta: [
      { title: "Submit Article — The Agriculture Popular Article Magazine" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://agriculturemagazine.in/submit" }],
  }),
});

const schema = z.object({
  title: z.string().trim().min(5).max(200),
  abstract: z.string().trim().min(50).max(3000),
  keywords: z.string().trim().max(300),
  content: z.string().trim().max(50000).optional(),
  category_id: z.string().uuid().optional().nullable(),
  plan: z.enum(["single", "annual", "lifetime", "institute"]),
});

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXT = [".doc", ".docx"];

function Submit() {
  const nav = useNavigate();
  const [cats, setCats] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id,name")
      .order("name")
      .then(({ data }) => setCats(data || []));
  }, []);

  const onFile = (f: File | null) => {
    if (!f) {
      setFile(null);
      return;
    }
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      toast.error("Only .doc or .docx files are accepted.");
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error("File must be 10 MB or smaller.");
      return;
    }
    setFile(f);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const cat = String(fd.get("category_id") || "");
    const data = {
      title: String(fd.get("title")),
      abstract: String(fd.get("abstract")),
      keywords: String(fd.get("keywords") || ""),
      content: String(fd.get("content") || ""),
      category_id: cat || null,
      plan: String(fd.get("plan")) as "single" | "annual" | "lifetime" | "institute",
    };
    const r = schema.safeParse(data);
    if (!r.success) {
      toast.error(friendlyZodError(r.error));
      return;
    }
    if (!file) {
      toast.error("Please attach your manuscript (.doc or .docx).");
      return;
    }

    setLoading(true);
    const { data: sess } = await supabase.auth.getUser();
    if (!sess.user) {
      toast.error("Please sign in");
      setLoading(false);
      return;
    }

    const { data: row, error } = await supabase
      .from("submissions")
      .insert({ ...data, user_id: sess.user.id })
      .select()
      .single();
    if (error || !row) {
      setLoading(false);
      toast.error(error?.message || "Failed to create submission");
      return;
    }

    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    const path = `${sess.user.id}/${row.id}${ext}`;
    const { error: upErr } = await supabase.storage.from("manuscripts").upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (upErr) {
      setLoading(false);
      toast.error(`Manuscript upload failed: ${upErr.message}`);
      return;
    }
    await supabase.from("submissions").update({ manuscript_path: path }).eq("id", row.id);

    setLoading(false);
    toast.success(`Submitted! Ticket #${row.id.slice(0, 8).toUpperCase()}`);
    nav({ to: "/dashboard" });
  };

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="container-editorial py-16 max-w-3xl">
        <div className="eyebrow">Authors</div>
        <h1 className="font-display text-2xl mt-3 text-ink">Submit Your Article</h1>
        <p className="mt-4 text-foreground/70">
          Manuscripts in Microsoft Word (.doc / .docx) format only · 2–4 pages · reviewed within 21
          days.
        </p>

        <form onSubmit={onSubmit} className="mt-12 space-y-6">
          <Field label="Article title" name="title" required />
          <Field label="Abstract (50–3000 chars)" name="abstract" textarea rows={5} required />
          <Field label="Keywords (comma separated)" name="keywords" />
          <div>
            <label className="text-sm font-sans font-medium block mb-2">Category</label>
            <select
              name="category_id"
              className="w-full h-12 bg-paper border border-rule px-4 rounded-sm text-sm"
            >
              <option value="">— Select —</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-sans font-medium block mb-2">
              Manuscript file (.doc / .docx, up to 10 MB)
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border border-dashed border-rule bg-paper px-4 py-6 rounded-sm text-sm flex items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition"
            >
              {file ? (
                <>
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-display">{file.name}</span>
                  <span className="text-muted-foreground">
                    ({(file.size / 1024).toFixed(0)} KB)
                  </span>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-primary" />
                  <span>Click to upload your Word manuscript</span>
                </>
              )}
            </button>
          </div>

          <Field
            label="Manuscript text (optional — paste for quick review)"
            name="content"
            textarea
            rows={8}
          />

          <div>
            <label className="text-sm font-sans font-medium block mb-2">Membership plan</label>
            <select
              name="plan"
              required
              defaultValue="single"
              className="w-full h-12 bg-paper border border-rule px-4 rounded-sm text-sm"
            >
              <option value="single">Single Article (₹200)</option>
              <option value="annual">Annual (₹500 · 8 articles / 12 months)</option>
              <option value="lifetime">Lifetime (₹2,000 · 5 years)</option>
              <option value="institute">Institute / Library (₹5,000 · 5 years)</option>
            </select>
          </div>

          <div className="flex items-start gap-3 border border-rule bg-paper p-4 rounded-sm">
            <input
              type="checkbox"
              id="copyright_transfer"
              name="copyright_transfer"
              required
              className="mt-1 h-4 w-4 text-primary border-rule focus:ring-primary shrink-0"
            />
            <label
              htmlFor="copyright_transfer"
              className="text-sm text-foreground/80 leading-normal font-sans select-none"
            >
              I confirm this is original, unpublished work and I agree to transfer the copyright of
              the accepted article to the publisher (Ram Mangalam Agri–Rural Development Foundation)
              upon acceptance.
            </label>
          </div>

          <button
            disabled={loading}
            className="w-full h-12 flex justify-center items-center bg-primary text-primary-foreground px-6 rounded-sm hover:bg-primary/90 disabled:opacity-60 font-sans font-semibold text-sm"
          >
            {loading ? "Submitting…" : "Submit for review"}
          </button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}

function Field({
  label,
  name,
  textarea,
  rows,
  required,
}: {
  label: string;
  name: string;
  textarea?: boolean;
  rows?: number;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-sans font-medium block mb-2">{label}</label>
      {textarea ? (
        <textarea
          name={name}
          rows={rows}
          required={required}
          className="w-full bg-paper border border-rule px-4 py-3 min-h-[140px] rounded-sm text-sm focus:outline-none focus:border-primary"
        />
      ) : (
        <input
          name={name}
          required={required}
          className="w-full h-12 bg-paper border border-rule px-4 rounded-sm text-sm focus:outline-none focus:border-primary"
        />
      )}
    </div>
  );
}
