import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Pencil, Plus, X, Upload } from "lucide-react";

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
};
type Issue = { id: string; volume: number; issue_number: number; title: string };
type Cat = { id: string; name: string };

const STATUS = ["draft", "submitted", "under_review", "published", "archived"];

function AdminArticles() {
  const [rows, setRows] = useState<Article[] | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [editing, setEditing] = useState<Partial<Article> | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const [a, i, c] = await Promise.all([
      supabase.from("articles").select("*").order("created_at", { ascending: false }),
      supabase
        .from("issues")
        .select("id,volume,issue_number,title")
        .order("volume", { ascending: false }),
      supabase.from("categories").select("id,name").order("name"),
    ]);
    if (a.error) toast.error(a.error.message);
    setRows(a.data || []);
    setIssues(i.data || []);
    setCats(c.data || []);
  };
  useEffect(() => {
    load();
  }, []);

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
    const payload = {
      title,
      slug,
      abstract: String(fd.get("abstract") || "") || null,
      content: String(fd.get("content") || "") || null,
      cover_url: String(fd.get("cover_url") || "") || null,
      pdf_url: String(fd.get("pdf_url") || "") || null,
      status,
      read_time: Number(fd.get("read_time") || 5),
      category_id: String(fd.get("category_id") || "") || null,
      issue_id: String(fd.get("issue_id") || "") || null,
      published_at:
        status === "published" ? editing?.published_at || new Date().toISOString() : null,
    };
    const op = editing?.id
      ? supabase.from("articles").update(payload).eq("id", editing.id)
      : supabase.from("articles").insert(payload);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success(editing?.id ? "Article updated" : "Article created");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
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
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-ink">Articles</h2>
        <button
          onClick={() => setEditing({ status: "draft", read_time: 8 })}
          className="bg-navy text-white px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> New article
        </button>
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
          <div className="p-10 text-center text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">No articles yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-left">
              <tr>
                <Th>Title</Th>
                <Th>Status</Th>
                <Th>PDF</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-rule">
                  <Td className="font-display text-ink">
                    {r.title}
                    <div className="text-xs text-muted-foreground font-sans">/{r.slug}</div>
                  </Td>
                  <Td>
                    <span className="text-[0.65rem] uppercase tracking-widest px-2 py-1 bg-muted rounded-sm">
                      {r.status}
                    </span>
                  </Td>
                  <Td>
                    {r.pdf_url ? (
                      <a
                        href={r.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline"
                      >
                        Open
                      </a>
                    ) : (
                      "—"
                    )}
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
    </div>
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
            className="h-20 w-32 object-cover border border-rule rounded-sm bg-stone-50"
          />
        ) : (
          <div className="h-20 w-32 border border-dashed border-rule rounded-sm flex items-center justify-center text-[0.6rem] uppercase tracking-wider text-muted-foreground">
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
