import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/submissions")({ component: AdminSubmissions });

type Sub = {
  id: string; title: string; abstract: string; keywords: string | null;
  status: string; plan: string; user_id: string; category_id: string | null;
  notes: string | null; content: string | null; created_at: string;
};

const STATUSES = ["submitted", "under_review", "revision_requested", "approved", "published", "rejected"];

function AdminSubmissions() {
  const [rows, setRows] = useState<Sub[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");

  const load = async () => {
    const { data, error } = await supabase.from("submissions").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string, notes?: string) => {
    const { error } = await supabase.from("submissions").update({ status: status as "submitted" | "under_review" | "revision_requested" | "approved" | "published" | "rejected", ...(notes != null ? { notes } : {}) }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated"); load();
  };

  const filtered = (rows || []).filter((r) => !filter || r.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-ink">Submissions</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="bg-background border border-rule px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="mt-6 border border-rule">
        {rows === null ? <div className="p-10 text-center text-muted-foreground">Loading…</div>
          : filtered.length === 0 ? <div className="p-10 text-center text-muted-foreground">No submissions.</div>
          : (
            <ul className="divide-y divide-rule">
              {filtered.map((s) => (
                <li key={s.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-display text-lg text-ink">{s.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        #{s.id.slice(0, 8).toUpperCase()} · {new Date(s.created_at).toLocaleDateString()} · plan {s.plan}
                      </div>
                    </div>
                    <span className="text-[0.65rem] uppercase tracking-widest px-2 py-1 bg-muted rounded-sm shrink-0">{s.status}</span>
                  </div>
                  <button onClick={() => setOpen(open === s.id ? null : s.id)} className="mt-3 text-xs uppercase tracking-wider text-orange">
                    {open === s.id ? "Hide details" : "Review"}
                  </button>
                  {open === s.id && (
                    <div className="mt-4 grid lg:grid-cols-[2fr_1fr] gap-6 border-t border-rule pt-4">
                      <div className="text-sm space-y-3">
                        <Section label="Abstract">{s.abstract}</Section>
                        {s.keywords && <Section label="Keywords">{s.keywords}</Section>}
                        {s.content && <Section label="Manuscript"><pre className="whitespace-pre-wrap font-sans">{s.content}</pre></Section>}
                      </div>
                      <div className="space-y-3">
                        <label className="eyebrow block">Update status</label>
                        <select defaultValue={s.status} onChange={(e) => setStatus(s.id, e.target.value)}
                          className="w-full bg-background border border-rule px-3 py-2 text-sm">
                          {STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                        </select>
                        <label className="eyebrow block">Editorial notes</label>
                        <textarea defaultValue={s.notes ?? ""} rows={5}
                          onBlur={(e) => e.target.value !== (s.notes ?? "") && setStatus(s.id, s.status, e.target.value)}
                          className="w-full bg-background border border-rule px-3 py-2 text-sm" />
                        <p className="text-xs text-muted-foreground">Notes save on blur.</p>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
      </div>
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
