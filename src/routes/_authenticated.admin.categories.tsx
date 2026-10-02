import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { adminKey, db, useAdminRefresh } from "@/lib/adminQuery";
import { QueryState } from "@/components/admin/QueryState";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: AdminCategories,
});

type Cat = { id: string; name: string; slug: string; description: string | null };

function AdminCategories() {
  const query = useQuery({
    queryKey: adminKey("categories"),
    queryFn: () => db(supabase.from("categories").select("*").order("name")),
  });
  const rows: Cat[] | null = query.data ?? null;
  const refresh = useAdminRefresh();

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    if (!name) return;
    const slug = (String(fd.get("slug") || "") || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const description = String(fd.get("description") || "") || null;
    const { error } = await supabase.from("categories").insert({ name, slug, description });
    if (error) return toast.error(error.message);
    (e.currentTarget as HTMLFormElement).reset();
    toast.success("Category added");
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Categories</h1>

      <form
        onSubmit={create}
        className="mt-6 border border-rule bg-paper p-5 grid sm:grid-cols-[1fr_1fr_2fr_auto] gap-3 items-end"
      >
        <Lbl label="Name">
          <input name="name" required className="inp" />
        </Lbl>
        <Lbl label="Slug (optional)">
          <input name="slug" placeholder="auto" className="inp" />
        </Lbl>
        <Lbl label="Description">
          <input name="description" className="inp" />
        </Lbl>
        <button className="bg-orange text-white px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>

      <div className="mt-6 border border-rule">
        {rows === null ? (
          <QueryState query={query} />
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">No categories.</div>
        ) : (
          <ul className="divide-y divide-rule">
            {rows.map((c) => (
              <li key={c.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="font-display text-ink">{c.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.slug}
                    {c.description ? ` · ${c.description}` : ""}
                  </div>
                </div>
                <button onClick={() => remove(c.id)} className="p-2 hover:bg-secondary rounded-sm">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <style>{`.inp{width:100%;background:transparent;border:1px solid var(--color-rule);padding:.5rem .75rem;font-size:.875rem}.inp:focus{outline:none;border-color:var(--primary)}`}</style>
    </div>
  );
}

function Lbl({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
