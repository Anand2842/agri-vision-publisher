import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileUp, Download, Search, CalendarDays, Users, Clock, CheckCircle2 } from "lucide-react";
import { format, formatDistanceToNow, startOfDay, startOfWeek, startOfMonth } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AdminSubmissionsSkeleton, StatChipSkeleton } from "@/components/site/Skeletons";

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
type Profile = { id: string; full_name: string | null; institution: string | null };
type Payment = { user_id: string; status: string; plan: string; created_at: string };

const STATUSES = [
  "submitted",
  "under_review",
  "revision_requested",
  "approved",
  "published",
  "rejected",
];

type DateRange = "today" | "week" | "month" | "all";
type MemberFilter = "all" | "approved" | "pending" | "none";

const generateSlug = (title: string) =>
  title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function AdminSubmissions() {
  const [rows, setRows] = useState<Sub[] | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [payments, setPayments] = useState<Record<string, Payment>>({});
  const [open, setOpen] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [memberFilter, setMemberFilter] = useState<MemberFilter>("all");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [search, setSearch] = useState("");

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
      supabase.from("issues").select("id,volume,issue_number,title").order("volume", { ascending: false }),
      supabase.from("categories").select("id,name").order("name"),
    ]);

    if (subRes.error) toast.error(subRes.error.message);
    if (issueRes.error) toast.error(issueRes.error.message);
    if (catRes.error) toast.error(catRes.error.message);

    const subs = (subRes.data as Sub[]) || [];
    setRows(subs);
    setIssues((issueRes.data as Issue[]) || []);
    setCats((catRes.data as Cat[]) || []);

    const userIds = Array.from(new Set(subs.map((s) => s.user_id)));
    if (userIds.length) {
      const [profRes, payRes] = await Promise.all([
        supabase.from("profiles").select("id,full_name,institution").in("id", userIds),
        supabase
          .from("membership_payments")
          .select("user_id,status,plan,created_at")
          .in("user_id", userIds)
          .order("created_at", { ascending: false }),
      ]);
      const profMap: Record<string, Profile> = {};
      ((profRes.data as Profile[]) || []).forEach((p) => (profMap[p.id] = p));
      setProfiles(profMap);

      // Keep only the latest per user, preferring approved > pending
      const payMap: Record<string, Payment> = {};
      ((payRes.data as Payment[]) || []).forEach((p) => {
        const existing = payMap[p.user_id];
        if (!existing) payMap[p.user_id] = p;
        else if (existing.status !== "approved" && p.status === "approved") payMap[p.user_id] = p;
      });
      setPayments(payMap);
    }
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
      setSelectedIssueId(issues.length > 0 ? issues[0].id : "");
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
      if (promotingSub.manuscript_path) {
        toast.info("Transferring manuscript to public storage...");
        const { data: blob, error: downloadError } = await supabase.storage
          .from("manuscripts")
          .download(promotingSub.manuscript_path);
        if (downloadError) throw new Error(`Failed to download manuscript: ${downloadError.message}`);
        const fileExt = promotingSub.manuscript_path.slice(promotingSub.manuscript_path.lastIndexOf("."));
        const newPath = `promoted/${promotingSub.id}-${Date.now()}${fileExt}`;
        let contentType = "application/octet-stream";
        if (fileExt.toLowerCase() === ".pdf") contentType = "application/pdf";
        else if (fileExt.toLowerCase() === ".docx")
          contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        else if (fileExt.toLowerCase() === ".doc") contentType = "application/msword";
        const { error: uploadError } = await supabase.storage
          .from("article-pdfs")
          .upload(newPath, blob, { contentType, upsert: true });
        if (uploadError) throw new Error(`Failed to upload manuscript: ${uploadError.message}`);
        const { data: publicUrlData } = supabase.storage.from("article-pdfs").getPublicUrl(newPath);
        pdfUrl = publicUrlData.publicUrl;
      }
      const wordCount = (promotingSub.content || "").trim().split(/\s+/).length || 5;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));
      const { error: insertError } = await supabase.from("articles").insert({
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
      });
      if (insertError) throw insertError;
      const { error: updateError } = await supabase
        .from("submissions")
        .update({ status: "published" })
        .eq("id", promotingSub.id);
      if (updateError) throw updateError;
      toast.success("Successfully promoted submission to a published article!");
      setPromotingSub(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to promote submission");
    } finally {
      setIsPromoting(false);
    }
  };

  // Filtering
  const filtered = useMemo(() => {
    if (!rows) return [];
    const now = new Date();
    const cutoff =
      dateRange === "today"
        ? startOfDay(now)
        : dateRange === "week"
        ? startOfWeek(now, { weekStartsOn: 1 })
        : dateRange === "month"
        ? startOfMonth(now)
        : null;
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (cutoff && new Date(r.created_at) < cutoff) return false;
      const memberStatus = payments[r.user_id]?.status;
      if (memberFilter === "approved" && memberStatus !== "approved") return false;
      if (memberFilter === "pending" && memberStatus !== "pending") return false;
      if (memberFilter === "none" && memberStatus) return false;
      if (q) {
        const name = profiles[r.user_id]?.full_name?.toLowerCase() || "";
        if (!r.title.toLowerCase().includes(q) && !name.includes(q)) return false;
      }
      return true;
    });
  }, [rows, statusFilter, memberFilter, dateRange, search, payments, profiles]);

  // Group by day
  const grouped = useMemo(() => {
    const map = new Map<string, Sub[]>();
    filtered.forEach((s) => {
      const key = format(new Date(s.created_at), "EEEE, d MMMM yyyy");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return Array.from(map.entries());
  }, [filtered]);

  // Summary chips
  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = startOfWeek(now, { weekStartsOn: 1 });
    const list = rows || [];
    return {
      total: list.length,
      week: list.filter((s) => new Date(s.created_at) >= weekAgo).length,
      pending: list.filter((s) => s.status === "submitted" || s.status === "under_review").length,
      paid: list.filter((s) => payments[s.user_id]?.status === "approved").length,
    };
  }, [rows, payments]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-ink">Submissions</h2>
        <div className="text-xs text-muted-foreground">
          Showing {filtered.length} of {rows?.length ?? 0}
        </div>
      </div>

      {/* Summary chips */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {rows === null ? (
          <>
            <StatChipSkeleton />
            <StatChipSkeleton />
            <StatChipSkeleton />
            <StatChipSkeleton />
          </>
        ) : (
          <>
            <StatChip icon={<CalendarDays className="h-4 w-4" />} label="Total" value={stats.total} />
            <StatChip icon={<Clock className="h-4 w-4" />} label="This week" value={stats.week} tone="orange" />
            <StatChip icon={<Users className="h-4 w-4" />} label="Pending review" value={stats.pending} tone="amber" />
            <StatChip icon={<CheckCircle2 className="h-4 w-4" />} label="Paid members" value={stats.paid} tone="green" />
          </>
        )}
      </div>

      {/* Filter bar */}
      <div className="mt-4 border border-rule bg-paper p-4 rounded-sm space-y-3">
        <div className="grid md:grid-cols-[1fr_auto_auto] gap-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or author…"
              className="w-full h-9 pl-9 pr-3 bg-background border border-rule text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 bg-background border border-rule px-3 text-sm"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
          <select
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value as MemberFilter)}
            className="h-9 bg-background border border-rule px-3 text-sm"
          >
            <option value="all">All members</option>
            <option value="approved">Paid (approved)</option>
            <option value="pending">Payment pending</option>
            <option value="none">No payment yet</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["today", "week", "month", "all"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDateRange(r)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider border transition-colors ${
                dateRange === r
                  ? "bg-navy text-white border-navy"
                  : "bg-background border-rule hover:border-orange"
              }`}
            >
              {r === "today" ? "Today" : r === "week" ? "This week" : r === "month" ? "This month" : "All time"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 border border-rule">
        {rows === null ? (
          <div className="p-10 text-center text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">No submissions match your filters.</div>
        ) : (
          grouped.map(([day, items]) => (
            <div key={day}>
              <div className="bg-secondary/50 border-b border-rule px-5 py-2 text-xs uppercase tracking-wider text-muted-foreground flex justify-between">
                <span>{day}</span>
                <span>{items.length} submission{items.length !== 1 ? "s" : ""}</span>
              </div>
              <ul className="divide-y divide-rule">
                {items.map((s, idx) => {
                  const profile = profiles[s.user_id];
                  const payment = payments[s.user_id];
                  return (
                    <li key={s.id} className={`p-5 ${idx % 2 ? "bg-paper/50" : ""}`}>
                      <div className="grid md:grid-cols-[1.6fr_1fr_auto_auto] gap-4 items-start">
                        <div className="min-w-0">
                          <div className="font-display text-lg text-ink truncate">{s.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            #{s.id.slice(0, 8).toUpperCase()} · declared plan{" "}
                            <span className="font-medium">{s.plan}</span>
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-ink">
                            {profile?.full_name || "Unknown author"}
                          </div>
                          {profile?.institution && (
                            <div className="text-xs text-muted-foreground truncate">{profile.institution}</div>
                          )}
                        </div>
                        <div className="text-xs">
                          <MemberBadge status={payment?.status} plan={payment?.plan} />
                        </div>
                        <div className="text-xs text-right">
                          <div>{format(new Date(s.created_at), "d MMM, HH:mm")}</div>
                          <div className="text-muted-foreground">
                            {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
                          </div>
                          <span className="mt-1 inline-block text-[0.65rem] uppercase tracking-widest px-2 py-0.5 bg-muted rounded-sm">
                            {s.status.replace(/_/g, " ")}
                          </span>
                        </div>
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
                                      return toast.error(error?.message ?? "Could not generate download link");
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
                                <option key={st} value={st}>{st}</option>
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
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>

      <Dialog open={promotingSub !== null} onOpenChange={(o) => !o && setPromotingSub(null)}>
        <DialogContent className="sm:max-w-[550px] bg-paper border-rule">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-ink">Promote Submission to Article</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right eyebrow">Title</label>
              <input value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} className="col-span-3 bg-background border border-rule px-3 py-2 text-sm focus:outline-none focus:border-orange" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right eyebrow">Slug</label>
              <input value={customSlug} onChange={(e) => setCustomSlug(e.target.value)} className="col-span-3 bg-background border border-rule px-3 py-2 text-sm focus:outline-none focus:border-orange" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right eyebrow">Issue</label>
              <select value={selectedIssueId} onChange={(e) => setSelectedIssueId(e.target.value)} className="col-span-3 bg-background border border-rule px-3 py-2 text-sm focus:outline-none focus:border-orange">
                <option value="">— Select Issue —</option>
                {issues.map((i) => (
                  <option key={i.id} value={i.id}>V{i.volume}·I{i.issue_number} — {i.title}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right eyebrow">Category</label>
              <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} className="col-span-3 bg-background border border-rule px-3 py-2 text-sm focus:outline-none focus:border-orange">
                <option value="">— Select Category —</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right eyebrow mt-2">Abstract</label>
              <textarea value={customAbstract} onChange={(e) => setCustomAbstract(e.target.value)} rows={4} className="col-span-3 bg-background border border-rule px-3 py-2 text-sm focus:outline-none focus:border-orange" />
            </div>
          </div>
          <DialogFooter>
            <button type="button" disabled={isPromoting} onClick={() => setPromotingSub(null)} className="px-4 py-2 border border-rule text-xs uppercase tracking-wider hover:bg-secondary transition-colors disabled:opacity-50">Cancel</button>
            <button type="button" disabled={isPromoting} onClick={handlePromote} className="px-4 py-2 bg-navy hover:bg-orange text-white text-xs uppercase tracking-wider transition-colors disabled:opacity-50">
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

function StatChip({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "default" | "orange" | "amber" | "green";
}) {
  const toneCls =
    tone === "orange"
      ? "text-orange"
      : tone === "amber"
      ? "text-amber-600"
      : tone === "green"
      ? "text-emerald-600"
      : "text-ink";
  return (
    <div className="border border-rule bg-paper px-4 py-3 rounded-sm flex items-center gap-3">
      <div className={toneCls}>{icon}</div>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`text-xl font-display ${toneCls}`}>{value}</div>
      </div>
    </div>
  );
}

function MemberBadge({ status, plan }: { status?: string; plan?: string }) {
  if (!status) {
    return (
      <span className="inline-block px-2 py-1 rounded-sm bg-muted text-muted-foreground text-[0.65rem] uppercase tracking-widest">
        No payment
      </span>
    );
  }
  const cls =
    status === "approved"
      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
      : status === "pending"
      ? "bg-amber-100 text-amber-800 border-amber-300"
      : "bg-rose-100 text-rose-800 border-rose-300";
  return (
    <span className={`inline-block px-2 py-1 rounded-sm border text-[0.65rem] uppercase tracking-widest ${cls}`}>
      {status === "approved" ? `Paid · ${plan ?? ""}` : status}
    </span>
  );
}
