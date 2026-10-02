import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { adminKey, db, useAdminRefresh } from "@/lib/adminQuery";
import { QueryState } from "@/components/admin/QueryState";
import { toast } from "sonner";
import { Trash2, Pencil, Plus, X, Upload, FileDown, Files } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/articles")({
  component: AdminArticles,
});

type Article = {
  id: string;
  title: string;
  slug: string;
  abstract: string | null;
  content: string | null;
  cover_url: string | null;
  pdf_url: string | null;
  status: "draft" | "submitted" | "under_review" | "published" | "archived" | string;
  read_time: number | null;
  category_id: string | null;
  issue_id: string | null;
  published_at: string | null;
  page_start: number | null;
  page_end: number | null;
  authors: string | null;
  affiliation: string | null;
};
type Issue = { id: string; volume: number; issue_number: number; title: string };
type Cat = { id: string; name: string };

const STATUS = ["draft", "submitted", "under_review", "published", "archived"];

function AdminArticles() {
  const query = useQuery({
    queryKey: adminKey("articles"),
    queryFn: async () => {
      const [a, i, c] = await Promise.all([
        db(supabase.from("articles").select("*").order("created_at", { ascending: false })),
        db(
          supabase
            .from("issues")
            .select("id,volume,issue_number,title")
            .order("volume", { ascending: false }),
        ),
        db(supabase.from("categories").select("id,name").order("name")),
      ]);
      return { rows: a as unknown as Article[], issues: i as Issue[], cats: c as Cat[] };
    },
  });
  const rows = query.data?.rows ?? null;
  const issues = query.data?.issues ?? [];
  const cats = query.data?.cats ?? [];
  const refresh = useAdminRefresh();
  const [editing, setEditing] = useState<Partial<Article> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [issueFilter, setIssueFilter] = useState("");
  const [missingOnly, setMissingOnly] = useState(false);
  const [bulkFiles, setBulkFiles] = useState<File[] | null>(null);

  const visible = useMemo(
    () =>
      (rows ?? []).filter(
        (r) => (!issueFilter || r.issue_id === issueFilter) && (!missingOnly || !r.pdf_url),
      ),
    [rows, issueFilter, missingOnly],
  );
  const missingCount = (rows ?? []).filter((r) => r.status === "published" && !r.pdf_url).length;

  // Uploads a PDF and returns its public URL.
  const storePdf = async (file: File, slug: string) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      throw new Error(`${file.name} is not a PDF`);
    }
    const path = `articles/${slug}-${Date.now()}.pdf`;
    await db(
      supabase.storage
        .from("article-pdfs")
        .upload(path, file, { upsert: false, contentType: "application/pdf" }),
    );
    return supabase.storage.from("article-pdfs").getPublicUrl(path).data.publicUrl;
  };

  // Attach (or replace) the PDF of an article straight from the list.
  const attachPdf = async (article: Article, file: File) => {
    setUploading(true);
    try {
      const url = await storePdf(file, article.slug);
      await db(supabase.from("articles").update({ pdf_url: url }).eq("id", article.id));
      toast.success(`PDF attached to "${article.title}"`);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title"));
    const baseSlug = (String(fd.get("slug") || "") || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Deduplicate slug using a fast single check and random suffix fallback
    let slug = baseSlug;
    const { data: existing } = await supabase
      .from("articles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing && existing.id !== editing?.id) {
      const suffix = Math.random().toString(36).substring(2, 6);
      slug = `${baseSlug}-${suffix}`;
    }

    const status = String(fd.get("status")) as "draft" | "published" | "archived";
    const content = String(fd.get("content") || "").trim();
    const pdfUrl = String(fd.get("pdf_url") || "").trim();
    if (status === "published" && !content) {
      toast.error("Published articles need the full text.");
      return;
    }
    const payload = {
      title,
      slug,
      abstract: String(fd.get("abstract") || "") || null,
      authors: String(fd.get("authors") || "").trim() || null,
      affiliation: String(fd.get("affiliation") || "").trim() || null,
      content: content || null,
      cover_url: String(fd.get("cover_url") || "") || null,
      pdf_url: pdfUrl || null,
      status,
      read_time: Number(fd.get("read_time") || 5),
      category_id: String(fd.get("category_id") || "") || null,
      issue_id: String(fd.get("issue_id") || "") || null,
      page_start: fd.get("page_start") ? Number(fd.get("page_start")) : null,
      page_end: fd.get("page_end") ? Number(fd.get("page_end")) : null,
      published_at:
        status === "published" ? editing?.published_at || new Date().toISOString() : null,
    };
    const op = editing?.id
      ? supabase
          .from("articles")
          .update(payload as any)
          .eq("id", editing.id)
      : supabase.from("articles").insert(payload as any);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success(editing?.id ? "Article updated" : "Article created");
    if (status === "published" && !pdfUrl) {
      toast.warning("No PDF yet: readers can only print the page until you upload one.");
    }
    setEditing(null);
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refresh();
  };

  const uploadPdf = async (file: File, setVal: (v: string) => void) => {
    setUploading(true);
    try {
      const path = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage
        .from("article-pdfs")
        .upload(path, file, { upsert: false, contentType: "application/pdf" });
      if (error) throw error;
      const { data } = supabase.storage.from("article-pdfs").getPublicUrl(path);
      setVal(data.publicUrl);
      toast.success("PDF uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  };

  const uploadCover = async (file: File, setVal: (v: string) => void) => {
    setUploading(true);
    try {
      const path = `article-covers/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage
        .from("site-assets")
        .upload(path, file, { upsert: false, contentType: file.type || "image/jpeg" });
      if (error) throw error;
      const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
      setVal(data.publicUrl);
      toast.success("Cover uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-ink">Articles</h1>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/templates/article-letterhead-template.docx"
            download
            className="inline-flex items-center gap-2 border border-rule px-3 py-2 text-xs hover:border-orange"
          >
            <FileDown className="h-4 w-4" /> Word letterhead template
          </a>
          <label className="inline-flex items-center gap-2 border border-rule px-3 py-2 text-xs cursor-pointer hover:border-orange">
            <Files className="h-4 w-4" /> Upload PDFs in bulk
            <input
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = "";
                if (files.length) setBulkFiles(files);
              }}
            />
          </label>
          <button
            onClick={() => setEditing({ status: "draft", read_time: 8 })}
            className="bg-navy text-white px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> New article
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <select
          value={issueFilter}
          onChange={(e) => setIssueFilter(e.target.value)}
          className="h-9 bg-background border border-rule px-3"
          aria-label="Filter by issue"
        >
          <option value="">All issues</option>
          {issues.map((i) => (
            <option key={i.id} value={i.id}>
              Vol {i.volume}, Issue {i.issue_number}
            </option>
          ))}
        </select>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={missingOnly} onChange={(e) => setMissingOnly(e.target.checked)} />
          PDF missing only
        </label>
        {missingCount > 0 && (
          <span className="text-xs text-amber-700">
            {missingCount} published article{missingCount === 1 ? "" : "s"} without a PDF
          </span>
        )}
      </div>

      {editing && (
        <form
          key={editing.id || "new"}
          onSubmit={save}
          className="mt-6 border border-rule bg-paper p-6 grid sm:grid-cols-2 gap-4"
        >
          <div className="sm:col-span-2 flex justify-between">
            <div className="eyebrow">{editing.id ? "Edit article" : "New article"}</div>
            <button type="button" onClick={() => setEditing(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <Field
            name="title"
            label="Title"
            required
            defaultValue={editing.title}
            className="sm:col-span-2"
          />
          <Field
            name="authors"
            label="Authors (comma-separated, as printed)"
            defaultValue={editing.authors ?? ""}
          />
          <Field
            name="affiliation"
            label="Affiliation"
            defaultValue={editing.affiliation ?? ""}
          />
          <Field name="slug" label="Slug (auto from title)" defaultValue={editing.slug} />
          <SelectField
            name="status"
            label="Status"
            defaultValue={editing.status || "draft"}
            options={STATUS.map((s) => ({ v: s, l: s }))}
          />
          <SelectField
            name="category_id"
            label="Category"
            defaultValue={editing.category_id || ""}
            options={[{ v: "", l: "—" }, ...cats.map((c) => ({ v: c.id, l: c.name }))]}
          />
          <SelectField
            name="issue_id"
            label="Issue"
            defaultValue={editing.issue_id || ""}
            options={[
              { v: "", l: "—" },
              ...issues.map((i) => ({
                v: i.id,
                l: `V${i.volume}·I${i.issue_number} — ${i.title}`,
              })),
            ]}
          />
          <Field
            name="read_time"
            label="Read time (min)"
            type="number"
            defaultValue={editing.read_time ?? 8}
          />
          <Field
            name="page_start"
            label="Page Start"
            type="number"
            defaultValue={editing.page_start ?? ""}
          />
          <Field
            name="page_end"
            label="Page End"
            type="number"
            defaultValue={editing.page_end ?? ""}
          />
          <div className="sm:col-span-2">
            <label className="eyebrow block mb-2">Cover image</label>
            <CoverPicker
              initial={editing.cover_url ?? ""}
              uploading={uploading}
              onUpload={uploadCover}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="eyebrow block mb-2">PDF</label>
            <PdfPicker initial={editing.pdf_url ?? ""} uploading={uploading} onUpload={uploadPdf} />
          </div>

          <div className="sm:col-span-2">
            <label className="eyebrow block mb-2">Abstract</label>
            <textarea
              name="abstract"
              rows={3}
              defaultValue={editing.abstract ?? ""}
              className="w-full bg-background border border-rule px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="eyebrow block mb-2">Content (markdown / HTML)</label>
            <textarea
              name="content"
              rows={8}
              defaultValue={editing.content ?? ""}
              className="w-full bg-background border border-rule px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary"
            />
          </div>
          <div className="sm:col-span-2">
            <button className="bg-orange text-white px-5 py-2 text-xs uppercase tracking-wider">
              Save
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 border border-rule overflow-x-auto">
        {rows === null ? (
          <QueryState query={query} />
        ) : visible.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            {rows.length === 0 ? "No articles yet." : "No articles match these filters."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-left">
              <tr>
                <Th>Title</Th>
                <Th>Status</Th>
                <Th>Publication files</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className="border-t border-rule">
                  <Td className="font-display text-ink">
                    {r.title}
                    <div className="text-xs text-muted-foreground font-sans">/{r.slug}</div>
                  </Td>
                  <Td>
                    <span className="text-xs uppercase tracking-widest px-2 py-1 bg-muted rounded-sm">
                      {r.status}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className={r.content?.trim() ? "text-primary" : "text-destructive"}>{r.content?.trim() ? "Full text ready" : "Full text missing"}</span>
                      <span aria-hidden="true">·</span>
                      {r.pdf_url ? <a href={r.pdf_url} target="_blank" rel="noreferrer" className="text-primary underline">PDF ready</a> : <span className="text-destructive">PDF missing</span>}
                      <label className={`inline-flex items-center gap-1 cursor-pointer text-navy hover:text-orange ${uploading ? "pointer-events-none opacity-50" : ""}`}>
                        <Upload className="h-3.5 w-3.5" /> {r.pdf_url ? "Replace" : "Upload PDF"}
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            e.target.value = "";
                            if (f) attachPdf(r, f);
                          }}
                        />
                      </label>
                    </div>
                  </Td>
                  <Td className="text-right whitespace-nowrap">
                    <IconBtn onClick={() => setEditing(r)}>
                      <Pencil className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn onClick={() => remove(r.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </IconBtn>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {bulkFiles && rows && (
        <BulkPdfDialog
          files={bulkFiles}
          articles={rows}
          onClose={() => setBulkFiles(null)}
          upload={async (pairs) => {
            let ok = 0;
            for (const { file, article } of pairs) {
              try {
                const url = await storePdf(file, article.slug);
                await db(supabase.from("articles").update({ pdf_url: url }).eq("id", article.id));
                ok++;
              } catch (e) {
                toast.error(`${file.name}: ${e instanceof Error ? e.message : String(e)}`);
              }
            }
            if (ok) toast.success(`${ok} PDF${ok === 1 ? "" : "s"} attached`);
            refresh();
          }}
        />
      )}
    </div>
  );
}

const fileKey = (name: string) =>
  name
    .toLowerCase()
    .replace(/\.pdf$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Bulk upload: each PDF is matched to an article whose slug matches the file name
// (e.g. precision-farming-western-rajasthan.pdf). The editor checks or fixes every
// match before anything is uploaded.
function BulkPdfDialog({
  files,
  articles,
  onClose,
  upload,
}: {
  files: File[];
  articles: Article[];
  onClose: () => void;
  upload: (pairs: { file: File; article: Article }[]) => Promise<void>;
}) {
  const [choice, setChoice] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      files.map((f) => {
        const key = fileKey(f.name);
        const match =
          articles.find((a) => a.slug === key) ?? articles.find((a) => key.includes(a.slug));
        return [f.name, match?.id ?? ""];
      }),
    ),
  );
  const [busy, setBusy] = useState(false);
  const pairs = files
    .map((file) => ({ file, article: articles.find((a) => a.id === choice[file.name]) }))
    .filter((p): p is { file: File; article: Article } => !!p.article);

  return (
    <Dialog open onOpenChange={(o) => !o && !busy && onClose()}>
      <DialogContent className="sm:max-w-[640px] bg-paper border-rule">
        <DialogHeader>
          <DialogTitle>Attach {files.length} PDF{files.length === 1 ? "" : "s"}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Matched by file name. Check each one; files left on "Skip" are not uploaded.
        </p>
        <ul className="max-h-[50vh] overflow-y-auto divide-y divide-rule text-sm">
          {files.map((f) => (
            <li key={f.name} className="py-2 grid sm:grid-cols-2 gap-2 items-center">
              <span className="truncate" title={f.name}>
                {f.name}
              </span>
              <select
                value={choice[f.name]}
                onChange={(e) => setChoice({ ...choice, [f.name]: e.target.value })}
                className="h-9 bg-background border border-rule px-2 text-sm"
              >
                <option value="">Skip</option>
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                    {a.pdf_url ? " (replaces PDF)" : ""}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
        <DialogFooter>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="px-4 py-2 border border-rule text-xs uppercase tracking-wider disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || pairs.length === 0}
            onClick={async () => {
              setBusy(true);
              await upload(pairs);
              setBusy(false);
              onClose();
            }}
            className="px-4 py-2 bg-navy text-white text-xs uppercase tracking-wider disabled:opacity-50"
          >
            {busy ? "Uploading…" : `Upload ${pairs.length}`}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PdfPicker({
  initial,
  uploading,
  onUpload,
}: {
  initial: string;
  uploading: boolean;
  onUpload: (f: File, set: (v: string) => void) => void;
}) {
  const [val, setVal] = useState(initial);
  return (
    <div className="space-y-2">
      <input
        name="pdf_url"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="https://… or upload below"
        className="w-full bg-background border border-rule px-3 py-2 text-sm focus:outline-none focus:border-primary"
      />
      <label className="inline-flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer text-navy hover:text-orange">
        <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload PDF"}
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f, setVal);
          }}
        />
      </label>
    </div>
  );
}

function CoverPicker({
  initial,
  uploading,
  onUpload,
}: {
  initial: string;
  uploading: boolean;
  onUpload: (f: File, set: (v: string) => void) => void;
}) {
  const [val, setVal] = useState(initial);
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        {val ? (
          <img
            src={val}
            alt="cover preview"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
            }}
            className="h-28 w-40 object-cover border border-rule rounded-sm bg-stone-50"
          />
        ) : (
          <div className="h-28 w-40 border border-dashed border-rule rounded-sm flex items-center justify-center text-[0.6rem] uppercase tracking-wider text-muted-foreground">
            No cover
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            name="cover_url"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Paste image URL or upload from device"
            className="w-full bg-background border border-rule px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
          <label className="inline-flex items-center gap-2 text-xs uppercase tracking-wider cursor-pointer text-navy hover:text-orange">
            <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : "Upload from device"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUpload(f, setVal);
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
function Field({
  label,
  className = "",
  ...p
}: { label: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label className="eyebrow block mb-2">{label}</label>
      <input
        {...p}
        className="w-full bg-background border border-rule px-3 py-2 text-sm focus:outline-none focus:border-primary"
      />
    </div>
  );
}
function SelectField({
  label,
  options,
  ...p
}: {
  label: string;
  options: { v: string; l: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="eyebrow block mb-2">{label}</label>
      <select
        {...p}
        className="w-full bg-background border border-rule px-3 py-2 text-sm focus:outline-none focus:border-primary"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </div>
  );
}
function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-3 eyebrow">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}
function IconBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex p-2 hover:bg-secondary rounded-sm">
      {children}
    </button>
  );
}
