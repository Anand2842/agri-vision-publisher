import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { friendlyZodError } from "@/lib/form-errors";
import { z } from "zod";
import { FileText, Upload } from "lucide-react";

export const Route = createFileRoute("/submit")({
  component: Submit,
  head: () => ({
    meta: [
      { title: "Submit Article — The Agriculture Popular Article Magazine" },
      {
        name: "description",
        content:
          "Submit your agricultural article directly — no account required. Manuscripts reviewed within 21 days.",
      },
    ],
    links: [{ rel: "canonical", href: "https://agriculturemagazine.in/submit" }],
  }),
});

const SALUTATIONS = ["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."] as const;
const phoneRegex = /^[+\d][\d\s\-()]{7,19}$/;

const submitSchema = z.object({
  salutation: z.enum(SALUTATIONS, { message: "Please select a salutation" }),
  author_name: z.string().trim().min(2, "Please enter your full name").max(120),
  author_email: z.string().trim().email("Please enter a valid email").max(255),
  contact_number: z
    .string()
    .trim()
    .regex(phoneRegex, "Please enter a valid contact number"),
  co_authors: z.string().trim().max(500).optional(),
  title: z.string().trim().min(5, "Article title is too short").max(200),
  abstract: z.string().trim().min(50, "Abstract must be at least 50 characters").max(3000),
  keywords: z.string().trim().max(300).optional(),
  content: z.string().trim().max(50000).optional(),
  category_id: z.string().uuid().optional().nullable(),
  plan: z.enum(["single", "annual", "lifetime", "institute"]),
});

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXT = [".doc", ".docx"];

function Submit() {
  const nav = useNavigate();
  const [cats, setCats] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [prefill, setPrefill] = useState<{ name: string; email: string }>({ name: "", email: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from("categories")
      .select("id,name")
      .order("name")
      .then(({ data }) => setCats(data || []));
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      setCheckedAuth(true);
      if (uid) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", uid)
          .maybeSingle();
        setPrefill({ name: prof?.full_name || "", email: data.user?.email || "" });
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setUserId(s?.user?.id ?? null);
      setCheckedAuth(true);
    });
    return () => sub.subscription.unsubscribe();
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
    const form = e.currentTarget;
    const fd = new FormData(form);

    const parsed = submitSchema.safeParse({
      salutation: String(fd.get("salutation") || ""),
      author_name: String(fd.get("author_name") || ""),
      author_email: String(fd.get("author_email") || ""),
      contact_number: String(fd.get("contact_number") || ""),
      co_authors: String(fd.get("co_authors") || ""),
      title: String(fd.get("title") || ""),
      abstract: String(fd.get("abstract") || ""),
      keywords: String(fd.get("keywords") || ""),
      content: String(fd.get("content") || ""),
      category_id: String(fd.get("category_id") || "") || null,
      plan: String(fd.get("plan") || "single") as "single" | "annual" | "lifetime" | "institute",
    });

    if (!parsed.success) {
      toast.error(friendlyZodError(parsed.error));
      return;
    }
    if (!file) {
      toast.error("Please attach your manuscript (.doc or .docx).");
      return;
    }

    // Re-check session at submit time
    const { data: freshUser } = await supabase.auth.getUser();
    const currentUid = freshUser.user?.id ?? null;
    const guestNow = !currentUid;

    const d = parsed.data;
    const common = {
      salutation: d.salutation,
      author_name: d.author_name,
      author_email: d.author_email,
      contact_number: d.contact_number,
      co_authors: d.co_authors || null,
      title: d.title,
      abstract: d.abstract,
      keywords: d.keywords || null,
      content: d.content || null,
      category_id: d.category_id,
      plan: d.plan,
      status: "submitted" as const,
    };

    // Precompute the row id so the manuscript path can be stored at insert time.
    // Guests cannot UPDATE the row afterwards under RLS, so the path must be part
    // of the initial insert or reviewers never see a download link.
    const newId = crypto.randomUUID();
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    const folder = guestNow ? "guest" : currentUid;
    const path = `${folder}/${newId}${ext}`;

    const insertPayload: Record<string, unknown> = guestNow
      ? {
          ...common,
          id: newId,
          manuscript_path: path,
          user_id: null,
          guest_name: d.author_name,
          guest_email: d.author_email,
        }
      : {
          ...common,
          id: newId,
          manuscript_path: path,
          user_id: currentUid,
          guest_name: null,
          guest_email: null,
        };

    setLoading(true);
    const { data: row, error } = await supabase
      .from("submissions")
      .insert(insertPayload as never)
      .select()
      .single();
    if (error || !row) {
      setLoading(false);
      toast.error(error?.message || "Failed to create submission");
      return;
    }

    const { error: upErr } = await supabase.storage.from("manuscripts").upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (upErr) {
      setLoading(false);
      toast.error(`Manuscript upload failed: ${upErr.message}`);
      return;
    }


    setLoading(false);
    toast.success(`Submitted! Ticket #${row.id.slice(0, 8).toUpperCase()}`);
    if (guestNow) {
      form.reset();
      setPrefill({ name: "", email: "" });

      setFile(null);
    } else {
      nav({ to: "/dashboard" });
    }
  };

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="container-editorial py-16 max-w-3xl">
        <div className="eyebrow">Authors</div>
        <h1 className="font-display text-2xl mt-3 text-ink">Submit Your Article</h1>
        <p className="mt-4 text-foreground/70">
          Manuscripts in Microsoft Word (.doc / .docx) format only · 2–4 pages · reviewed within 21
          days. No account required — {" "}
          <a href="/auth" className="underline hover:text-primary">
            sign in
          </a>{" "}
          to track your submissions in a personal dashboard.
        </p>

        <form onSubmit={onSubmit} className="mt-12 space-y-6">
          <div className="border border-rule bg-paper p-4 rounded-sm space-y-6">
            <div className="eyebrow">Author details</div>
            <div>
              <label className="text-sm font-sans font-medium block mb-2">
                Salutation<span className="text-destructive"> *</span>
              </label>
              <select
                name="salutation"
                required
                defaultValue=""
                className="w-full h-12 bg-paper border border-rule px-4 rounded-sm text-sm"
              >
                <option value="" disabled>
                  — Select —
                </option>
                {SALUTATIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <Field
              label="Full Name"
              name="author_name"
              required
              value={prefill.name}
              onChange={(v) => setPrefill((p) => ({ ...p, name: v }))}
            />
            <Field
              label="Email"
              name="author_email"
              type="email"
              required
              value={prefill.email}
              onChange={(v) => setPrefill((p) => ({ ...p, email: v }))}
            />

            <Field
              label="Contact number"
              name="contact_number"
              type="tel"
              required
              placeholder="+91 98765 43210"
            />
            <Field
              label="Co-authors' names (comma separated)"
              name="co_authors"
              placeholder="Optional"
            />
          </div>

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
            disabled={loading || !checkedAuth}
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
  type,
  defaultValue,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  name: string;
  textarea?: boolean;
  rows?: number;
  required?: boolean;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const controlled = value !== undefined && onChange !== undefined;
  return (
    <div>
      <label className="text-sm font-sans font-medium block mb-2">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      {textarea ? (
        <textarea
          name={name}
          rows={rows}
          required={required}
          {...(controlled
            ? { value, onChange: (e) => onChange!(e.target.value) }
            : { defaultValue })}
          placeholder={placeholder}
          className="w-full bg-paper border border-rule px-4 py-3 min-h-[140px] rounded-sm text-sm focus:outline-none focus:border-primary"
        />
      ) : (
        <input
          name={name}
          type={type || "text"}
          required={required}
          {...(controlled
            ? { value, onChange: (e) => onChange!(e.target.value) }
            : { defaultValue })}
          placeholder={placeholder}
          className="w-full h-12 bg-paper border border-rule px-4 rounded-sm text-sm focus:outline-none focus:border-primary"
        />
      )}

    </div>
  );
}
