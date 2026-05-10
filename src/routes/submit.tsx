import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/submit")({
  component: Submit,
  head: () => ({ meta: [{ title: "Submit Article — Agripop" }] }),
});

const schema = z.object({
  title: z.string().trim().min(5).max(200),
  abstract: z.string().trim().min(50).max(3000),
  keywords: z.string().trim().max(300),
  content: z.string().trim().max(50000).optional(),
  category_id: z.string().uuid().optional().nullable(),
  plan: z.enum(["single", "annual", "lifetime", "institute"]),
});

function Submit() {
  const nav = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [cats, setCats] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSignedIn(!!data.session); setAuthChecked(true); });
    supabase.from("categories").select("id,name").order("name").then(({ data }) => setCats(data || []));
  }, []);

  if (authChecked && !signedIn) {
    return (
      <>
        <SiteHeader />
        <main className="container-editorial py-24 text-center">
          <h1 className="font-display text-4xl text-ink">Sign in to submit</h1>
          <p className="mt-4 text-muted-foreground">You need an author account to begin a submission.</p>
          <button onClick={() => nav({ to: "/auth" })} className="mt-6 bg-primary text-primary-foreground px-6 py-3 rounded-sm text-sm">Sign in or create account</button>
        </main>
        <SiteFooter />
      </>
    );
  }

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
    if (!r.success) { toast.error(r.error.issues[0].message); return; }
    setLoading(true);
    const { data: sess } = await supabase.auth.getUser();
    if (!sess.user) { toast.error("Please sign in"); setLoading(false); return; }
    const { error, data: row } = await supabase.from("submissions").insert({ ...data, user_id: sess.user.id }).select().single();
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Submitted! Ticket #${row.id.slice(0, 8).toUpperCase()}`);
    nav({ to: "/dashboard" });
  };

  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16 max-w-3xl">
        <div className="eyebrow">Authors</div>
        <h1 className="font-display text-5xl mt-3 text-ink">Submit Your Article</h1>
        <p className="mt-4 text-foreground/70">All submissions are reviewed within 21 days.</p>

        <form onSubmit={onSubmit} className="mt-12 space-y-6">
          <Field label="Article title" name="title" required />
          <Field label="Abstract (50–3000 chars)" name="abstract" textarea rows={5} required />
          <Field label="Keywords (comma separated)" name="keywords" />
          <div>
            <label className="eyebrow block mb-2">Category</label>
            <select name="category_id" className="w-full bg-paper border border-rule px-4 py-3 rounded-sm text-sm">
              <option value="">— Select —</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Field label="Manuscript (paste full text)" name="content" textarea rows={10} />
          <div>
            <label className="eyebrow block mb-2">Membership plan</label>
            <select name="plan" required defaultValue="single" className="w-full bg-paper border border-rule px-4 py-3 rounded-sm text-sm">
              <option value="single">Single article (₹500)</option>
              <option value="annual">Annual (₹2,500)</option>
              <option value="lifetime">Lifetime (₹15,000)</option>
              <option value="institute">Institute (₹40,000)</option>
            </select>
          </div>
          <button disabled={loading} className="w-full bg-primary text-primary-foreground px-6 py-4 rounded-sm hover:bg-primary/90 disabled:opacity-60">
            {loading ? "Submitting…" : "Submit for review"}
          </button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}

function Field({ label, name, textarea, rows, required }: { label: string; name: string; textarea?: boolean; rows?: number; required?: boolean }) {
  return (
    <div>
      <label className="eyebrow block mb-2">{label}</label>
      {textarea ? (
        <textarea name={name} rows={rows} required={required} className="w-full bg-paper border border-rule px-4 py-3 rounded-sm text-sm focus:outline-none focus:border-primary" />
      ) : (
        <input name={name} required={required} className="w-full bg-paper border border-rule px-4 py-3 rounded-sm text-sm focus:outline-none focus:border-primary" />
      )}
    </div>
  );
}
