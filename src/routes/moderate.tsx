import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Eye, RotateCcw, FileText, Download, History, User, ArrowRight, Plus, Pencil, FilePlus2 } from "lucide-react";

export const Route = createFileRoute("/moderate")({
  component: ModerateLayout,
  head: () => ({ meta: [{ title: "Moderator Console — Editorial Queue" }, { name: "robots", content: "noindex" }] }),
});

type SubmissionStatus =
  | "draft" | "submitted" | "under_review" | "revision_requested"
  | "approved" | "rejected" | "published";

type Sub = {
  id: string; title: string; abstract: string; keywords: string | null;
  status: SubmissionStatus; plan: string; user_id: string; category_id: string | null;
  notes: string | null; content: string | null; manuscript_path: string | null;
  created_at: string; updated_at: string;
};

type EventRow = {
  id: string; submission_id: string; actor_id: string | null;
  from_status: string | null; to_status: string | null;
  note: string | null; created_at: string;
};

const FILTERS: { value: SubmissionStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "submitted", label: "New" },
  { value: "under_review", label: "Under review" },
  { value: "revision_requested", label: "Revision requested" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "published", label: "Published" },
];

const STATUS_TONE: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-900",
  under_review: "bg-amber-100 text-amber-900",
  revision_requested: "bg-purple-100 text-purple-900",
  approved: "bg-emerald-100 text-emerald-900",
  rejected: "bg-rose-100 text-rose-900",
  published: "bg-navy text-white",
  draft: "bg-muted text-foreground/70",
};

function ModerateLayout() {
  const nav = useNavigate();
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading");
  const [role, setRole] = useState<"admin" | "moderator" | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { nav({ to: "/auth" }); return; }
      const { data: roles } = await supabase
        .from("user_roles").select("role").eq("user_id", data.session.user.id);
      const list = (roles || []).map((r) => r.role);
      if (list.includes("admin")) { setRole("admin"); setState("ok"); }
      else if (list.includes("moderator")) { setRole("moderator"); setState("ok"); }
      else setState("denied");
    })();
  }, [nav]);

  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-10">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="eyebrow">Editorial Console</div>
            <h1 className="font-display text-4xl mt-2 text-ink">Moderator Queue</h1>
            {role && <p className="text-xs uppercase tracking-widest text-orange mt-2">Signed in as {role}</p>}
          </div>
          <div className="flex gap-3 text-xs uppercase tracking-wider">
            {role === "admin" && (
              <Link to="/admin" className="text-foreground/60 hover:text-orange">Admin console →</Link>
            )}
            <Link to="/dashboard" className="text-foreground/60 hover:text-orange">My dashboard →</Link>
          </div>
        </div>
        <div className="rule-thick mt-4" />

        {state === "loading" && <div className="py-20 text-center text-muted-foreground">Checking access…</div>}
        {state === "denied" && (
          <div className="py-20 max-w-xl">
            <h2 className="font-display text-2xl text-ink">Access restricted</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Only Associate Editors (moderators) and Admins can access the editorial queue.
              If you should have access, contact the Chief Editor to grant your account a moderator role.
            </p>
          </div>
        )}
        {state === "ok" && <Queue />}
      </main>
      <SiteFooter />
    </>
  );
}

function Queue() {
  const [rows, setRows] = useState<Sub[] | null>(null);
  const [filter, setFilter] = useState<SubmissionStatus | "">("submitted");
  const [open, setOpen] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("submissions").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data || []) as Sub[]);
  };
  useEffect(() => { load(); }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    (rows || []).forEach((r) => { c[r.status] = (c[r.status] || 0) + 1; });
    return c;
  }, [rows]);

  const filtered = (rows || []).filter((r) => !filter || r.status === filter);

  return (
    <div className="mt-8">
      {/* Status tabs */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const n = f.value ? (counts[f.value] || 0) : (rows?.length || 0);
          const active = filter === f.value;
          return (
            <button
              key={f.value || "all"}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider font-condensed border transition-colors ${
                active ? "bg-navy text-white border-navy" : "bg-background border-rule hover:border-orange text-foreground/70"
              }`}
            >
              {f.label} <span className="opacity-70 ml-1">({n})</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 border border-rule">
        {rows === null && <div className="p-10 text-center text-muted-foreground">Loading submissions…</div>}
        {rows !== null && filtered.length === 0 && (
          <div className="p-10 text-center text-muted-foreground">No submissions in this status.</div>
        )}
        {rows !== null && filtered.length > 0 && (
          <ul className="divide-y divide-rule">
            {filtered.map((s) => (
              <Row key={s.id} s={s} open={open === s.id} onToggle={() => setOpen(open === s.id ? null : s.id)} onChanged={load} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

type ActorProfile = { id: string; full_name: string | null };

function Row({ s, open, onToggle, onChanged }: { s: Sub; open: boolean; onToggle: () => void; onChanged: () => void }) {
  const [notes, setNotes] = useState(s.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState<EventRow[] | null>(null);
  const [actors, setActors] = useState<Record<string, ActorProfile>>({});
  const [downloading, setDownloading] = useState(false);
  const [auditFilter, setAuditFilter] = useState<"all" | "status" | "notes">("all");



  useEffect(() => { if (open && events === null) loadEvents(); /* eslint-disable-next-line */ }, [open]);

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from("submission_events").select("*")
      .eq("submission_id", s.id).order("created_at", { ascending: true });
    if (error) toast.error(error.message);
    const list = (data || []) as EventRow[];
    setEvents(list);
    const ids = Array.from(new Set(list.map((e) => e.actor_id).filter(Boolean))) as string[];
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      const map: Record<string, ActorProfile> = {};
      (profs || []).forEach((p: ActorProfile) => { map[p.id] = p; });
      setActors(map);
    }
  };

  const transition = async (status: SubmissionStatus, requireNote = false) => {
    if (requireNote && !notes.trim()) {
      toast.error("Add an editorial note explaining the decision first.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("submissions")
      .update({ status, notes: notes.trim() ? notes.trim() : null })
      .eq("id", s.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(`Moved to ${status.replace("_", " ")}`);
    onChanged();
    if (open) loadEvents();
  };

  const saveNotesOnly = async () => {
    if ((notes ?? "") === (s.notes ?? "")) return;
    setSaving(true);
    const { error } = await supabase.from("submissions").update({ notes: notes.trim() || null }).eq("id", s.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Note saved");
    onChanged();
    if (open) loadEvents();
  };

  const downloadManuscript = async () => {
    if (!s.manuscript_path) return;
    setDownloading(true);
    const { data, error } = await supabase.storage.from("manuscripts").createSignedUrl(s.manuscript_path, 300);
    setDownloading(false);
    if (error || !data) return toast.error(error?.message ?? "Could not generate download link");
    window.open(data.signedUrl, "_blank", "noopener");
  };

  return (
    <li className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-display text-lg text-ink truncate">{s.title}</div>
          <div className="text-xs text-muted-foreground mt-1">
            #{s.id.slice(0, 8).toUpperCase()} · submitted {new Date(s.created_at).toLocaleDateString()} · plan {s.plan}
          </div>
        </div>
        <span className={`text-[0.65rem] uppercase tracking-widest px-2 py-1 rounded-sm shrink-0 ${STATUS_TONE[s.status] || "bg-muted"}`}>
          {s.status.replace("_", " ")}
        </span>
      </div>

      <button onClick={onToggle} className="mt-3 text-xs uppercase tracking-wider text-orange inline-flex items-center gap-1.5">
        <Eye className="h-3.5 w-3.5" /> {open ? "Close" : "Open for review"}
      </button>

      {open && (
        <div className="mt-5 grid lg:grid-cols-[2fr_1fr] gap-6 border-t border-rule pt-5">
          <div className="space-y-4 text-sm">
            <Block label="Abstract">{s.abstract}</Block>
            {s.keywords && <Block label="Keywords">{s.keywords}</Block>}
            {s.content && (
              <Block label="Manuscript body">
                <pre className="whitespace-pre-wrap font-sans text-foreground/85">{s.content}</pre>
              </Block>
            )}
            {s.manuscript_path && (
              <div>
                <button
                  onClick={downloadManuscript}
                  disabled={downloading}
                  className="inline-flex items-center gap-2 border border-rule px-3 py-2 text-xs uppercase tracking-wider hover:border-orange disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  {downloading ? "Generating…" : "Download manuscript"}
                </button>
                <span className="ml-3 text-xs text-muted-foreground inline-flex items-center gap-1"><FileText className="h-3 w-3" /> {s.manuscript_path.split("/").pop()}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="eyebrow block mb-1.5">Editorial note</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={saveNotesOnly}
                rows={5}
                placeholder="Visible to the author. Required for revision/rejection."
                className="w-full bg-background border border-rule px-3 py-2 text-sm focus:outline-none focus:border-orange"
              />
            </div>

            <div className="space-y-2">
              <div className="eyebrow">Decisions</div>
              <div className="grid grid-cols-2 gap-2">
                <ActionButton onClick={() => transition("under_review")} disabled={saving} icon={Eye} tone="default">Mark reviewing</ActionButton>
                <ActionButton onClick={() => transition("revision_requested", true)} disabled={saving} icon={RotateCcw} tone="warn">Request revision</ActionButton>
                <ActionButton onClick={() => transition("approved")} disabled={saving} icon={CheckCircle2} tone="ok">Approve</ActionButton>
                <ActionButton onClick={() => transition("rejected", true)} disabled={saving} icon={XCircle} tone="danger">Reject</ActionButton>
              </div>
              <p className="text-[11px] text-muted-foreground">Approval keeps the article in queue. An admin then promotes it to a published article in an issue.</p>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="eyebrow flex items-center gap-1.5"><History className="h-3 w-3" /> Audit history</div>
                {events && events.length > 0 && (
                  <div className="inline-flex border border-rule rounded-sm overflow-hidden text-[10px] uppercase tracking-wider">
                    {(["all", "status", "notes"] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setAuditFilter(f)}
                        className={`px-2 py-1 transition-colors ${auditFilter === f ? "bg-orange text-white" : "text-foreground/60 hover:text-orange"}`}
                      >
                        {f === "all" ? "All" : f === "status" ? "Status" : "Notes"}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {events === null && <p className="text-xs text-muted-foreground mt-2">Loading…</p>}
              {events && events.length === 0 && <p className="text-xs text-muted-foreground mt-2">No activity recorded.</p>}
              {events && events.length > 0 && (() => {
                const reversed = [...events].reverse();
                const decorated = reversed.map((e, idx) => {
                  const parsed = parseEventNote(e.note);
                  const prevParsed = parsed.kind === "created" ? { note: null } : parseEventNote(reversed[idx + 1]?.note ?? null);
                  const statusChanged = !!e.from_status && e.from_status !== e.to_status;
                  const noteChanged = parsed.kind === "notes" || parsed.kind === "both" || parsed.kind === "created";
                  return { e, parsed, prevParsed, statusChanged, noteChanged };
                });
                const visible = decorated.filter((d) => {
                  if (auditFilter === "status") return d.statusChanged;
                  if (auditFilter === "notes") return d.noteChanged && d.parsed.kind !== "created";
                  return true;
                });
                if (visible.length === 0) {
                  return <p className="text-xs text-muted-foreground mt-2">No {auditFilter === "status" ? "status changes" : "note edits"} recorded.</p>;
                }
                return (
                  <ol className="mt-2 border-l-2 border-rule pl-4 space-y-3">
                    {visible.map(({ e, parsed, prevParsed, statusChanged, noteChanged }) => {
                      const actor = e.actor_id ? actors[e.actor_id] : null;
                      const actorLabel = actor?.full_name?.trim() || (e.actor_id ? `${e.actor_id.slice(0, 8)}…` : "System");
                      const KindIcon = parsed.kind === "created" ? FilePlus2 : parsed.kind === "notes" ? Pencil : Plus;
                      const showStatus = statusChanged && auditFilter !== "notes";
                      const showNote = noteChanged && auditFilter !== "status";
                      return (
                        <li key={e.id} className="relative text-xs">
                          <span className="absolute -left-[1.4rem] top-1 h-2.5 w-2.5 rounded-full bg-orange ring-2 ring-background" />
                          <div className="flex flex-wrap items-center gap-2 text-foreground/85">
                            <KindIcon className="h-3 w-3 text-orange" />
                            <span className="inline-flex items-center gap-1 text-foreground/70">
                              <User className="h-3 w-3" /> <span className="font-medium text-ink">{actorLabel}</span>
                            </span>
                            <span className="text-muted-foreground/70">·</span>
                            <time className="text-muted-foreground/80" dateTime={e.created_at}>
                              {new Date(e.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                            </time>
                          </div>

                          {showStatus && (
                            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                              <StatusChip value={e.from_status!} />
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <StatusChip value={e.to_status!} />
                            </div>
                          )}
                          {!statusChanged && parsed.kind === "created" && e.to_status && auditFilter !== "notes" && (
                            <div className="mt-1.5"><StatusChip value={e.to_status} /></div>
                          )}

                          {showNote && (
                            <div className="mt-1.5 space-y-1">
                              {prevParsed.note && (
                                <div className="line-through text-rose-700/80 bg-rose-50 border border-rose-100 px-2 py-1 rounded-sm">
                                  {prevParsed.note}
                                </div>
                              )}
                              {parsed.note ? (
                                <div className="text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-sm whitespace-pre-wrap">
                                  {parsed.note}
                                </div>
                              ) : (
                                <div className="italic text-muted-foreground">Note cleared</div>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                );
              })()}
            </div>

          </div>
        </div>
      )}
    </li>
  );
}

function parseEventNote(raw: string | null): { kind: "created" | "status" | "notes" | "both" | "unknown"; note: string | null } {
  if (!raw) return { kind: "unknown", note: null };
  if (raw === "Submission created") return { kind: "created", note: null };
  if (raw === "Status changed") return { kind: "status", note: null };
  const both = raw.match(/^Status \+ notes updated: ([\s\S]*)$/);
  if (both) return { kind: "both", note: both[1] || null };
  const notes = raw.match(/^Notes updated: ([\s\S]*)$/);
  if (notes) return { kind: "notes", note: notes[1] || null };
  return { kind: "unknown", note: raw };
}

function StatusChip({ value }: { value: string }) {
  return (
    <span className={`text-[0.6rem] uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${STATUS_TONE[value] || "bg-muted"}`}>
      {value.replace("_", " ")}
    </span>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow mb-1">{label}</div>
      <div className="text-foreground/85">{children}</div>
    </div>
  );
}

function ActionButton({
  onClick, disabled, icon: Icon, tone, children,
}: {
  onClick: () => void; disabled?: boolean; icon: React.ComponentType<{ className?: string }>;
  tone: "default" | "ok" | "warn" | "danger"; children: React.ReactNode;
}) {
  const toneCls =
    tone === "ok" ? "border-emerald-600 text-emerald-700 hover:bg-emerald-50"
    : tone === "warn" ? "border-amber-600 text-amber-700 hover:bg-amber-50"
    : tone === "danger" ? "border-rose-600 text-rose-700 hover:bg-rose-50"
    : "border-rule text-foreground/80 hover:border-orange hover:text-orange";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 border px-3 py-2 text-xs uppercase tracking-wider transition-colors disabled:opacity-50 ${toneCls}`}
    >
      <Icon className="h-3.5 w-3.5" /> {children}
    </button>
  );
}
