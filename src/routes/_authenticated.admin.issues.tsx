import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, Pencil, Plus, X, Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/issues")({ component: AdminIssues });

type Issue = {
  id: string;
  title: string;
  volume: number;
  issue_number: number;
  description: string | null;
  cover_url: string | null;
  pdf_url: string | null;
  published_at: string | null;
};

function AdminIssues() {
  const [rows, setRows] = useState<Issue[] | null>(null);
  const [editing, setEditing] = useState<Partial<Issue> | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, kind: "cover" | "pdf") => {
    setUploading(true);
    try {
      const bucket = kind === "cover" ? "site-assets" : "article-pdfs";
      const path = `issues/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      const key = kind === "cover" ? "cover_url" : "pdf_url";
      setEditing((current) => current ? { ...current, [key]: data.publicUrl } : current);
      toast.success(kind === "cover" ? "Cover uploaded" : "Issue PDF uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const load = async () => {
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .order("volume", { ascending: false })
      .order("issue_number", { ascending: false });
    if (error) toast.error(error.message);
    setRows(data || []);
  };
  useEffect(() => {
    load();
  }, []);

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: String(fd.get("title")),
      volume: Number(fd.get("volume")),
      issue_number: Number(fd.get("issue_number")),
      description: String(fd.get("description") || "") || null,
      cover_url: String(fd.get("cover_url") || "") || null,
      pdf_url: String(fd.get("pdf_url") || "") || null,
      published_at: String(fd.get("published_at") || "") || null,
    };
    const op = editing?.id
      ? supabase.from("issues").update(payload).eq("id", editing.id)
      : supabase.from("issues").insert(payload);
    const { error } = await op;
    if (error) return toast.error(error.message);
    toast.success(editing?.id ? "Issue updated" : "Issue created");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this issue?")) return;
    const { error } = await supabase.from("issues").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-ink">Issues</h2>
        <button
          onClick={() => setEditing({})}
          className="bg-navy text-white px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> New issue
        </button>
      </div>

      {editing && (
        <form
          onSubmit={save}
          className="mt-6 border border-rule bg-paper p-6 grid sm:grid-cols-2 gap-4"
        >
          <div className="sm:col-span-2 flex justify-between">
            <div className="eyebrow">{editing.id ? "Edit issue" : "New issue"}</div>
            <button type="button" onClick={() => setEditing(null)} aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <Field name="title" label="Title" required defaultValue={editing.title} />
          <Field
            name="published_at"
            label="Published date"
            type="date"
            defaultValue={editing.published_at?.slice(0, 10)}
          />
          <Field
            name="volume"
            label="Volume"
            type="number"
            required
            defaultValue={editing.volume}
          />
          <Field
            name="issue_number"
            label="Issue number"
            type="number"
            required
            defaultValue={editing.issue_number}
          />
          <UploadField name="cover_url" label="Cover image" value={editing.cover_url ?? ""} accept="image/*" uploading={uploading} onChange={(cover_url) => setEditing({ ...editing, cover_url })} onUpload={(file) => uploadFile(file, "cover")} />
          <UploadField name="pdf_url" label="Complete issue PDF" value={editing.pdf_url ?? ""} accept="application/pdf" uploading={uploading} onChange={(pdf_url) => setEditing({ ...editing, pdf_url })} onUpload={(file) => uploadFile(file, "pdf")} />
          <div className="sm:col-span-2">
            <label className="eyebrow block mb-2">Description</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={editing.description ?? ""}
              className="w-full bg-background border border-rule px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="sm:col-span-2">
            <button className="bg-orange text-white px-5 py-2 text-xs uppercase tracking-wider">
              Save
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 border border-rule">
        {rows === null ? (
          <div className="p-10 text-center text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">No issues yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-left">
                <tr>
                  <Th>Vol/Issue</Th>
                  <Th>Title</Th>
                  <Th>Published</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-rule">
                    <Td>
                      V{r.volume} · I{r.issue_number}
                    </Td>
                    <Td className="font-display text-ink">{r.title}</Td>
                    <Td>{r.published_at ? new Date(r.published_at).toLocaleDateString() : "—"}</Td>
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
          </div>
        )}
      </div>
    </div>
  );
}

function UploadField({ name, label, value, accept, uploading, onChange, onUpload }: { name: string; label: string; value: string; accept: string; uploading: boolean; onChange: (value: string) => void; onUpload: (file: File) => void }) {
  return (
    <div>
      <label className="eyebrow block mb-2">{label}</label>
      <input name={name} value={value} onChange={(event) => onChange(event.target.value)} placeholder="Upload or paste URL" className="w-full bg-background border border-rule px-3 py-2 text-sm focus:outline-none focus:border-primary" />
      <label className="mt-2 inline-flex min-h-11 cursor-pointer items-center gap-2 text-xs uppercase tracking-wider text-navy hover:text-orange">
        <Upload className="h-4 w-4" />{uploading ? "Uploading…" : "Upload from device"}
        <input type="file" accept={accept} className="hidden" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); }} />
      </label>
    </div>
  );
}

function Field({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="eyebrow block mb-2">{label}</label>
      <input
        {...p}
        className="w-full bg-background border border-rule px-3 py-2 text-sm focus:outline-none focus:border-primary"
      />
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
