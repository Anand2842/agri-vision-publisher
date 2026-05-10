import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { articles } from "@/lib/mock-data";
import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  head: () => ({ meta: [{ title: "Search — Agripop" }] }),
});

function SearchPage() {
  const [q, setQ] = useState("");
  const results = q.trim().length === 0 ? articles : articles.filter((a) =>
    [a.title, a.author, a.category, a.abstract].join(" ").toLowerCase().includes(q.toLowerCase())
  );
  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16">
        <div className="eyebrow">Search</div>
        <h1 className="font-display text-5xl md:text-6xl mt-3 text-ink">Find articles, authors, issues.</h1>
        <div className="mt-10 flex items-center gap-3 border-b-2 border-foreground pb-3">
          <SearchIcon className="h-5 w-5" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. soil carbon, paddy, vertical farming" className="flex-1 bg-transparent text-2xl font-display outline-none placeholder:text-muted-foreground/60" />
        </div>
        <div className="mt-3 text-xs text-muted-foreground">{results.length} result{results.length !== 1 && "s"}</div>
        <ul className="mt-10 divide-y divide-[var(--color-rule)]">
          {results.map((a) => (
            <li key={a.slug} className="py-7">
              <Link to="/articles/$slug" params={{ slug: a.slug }} className="group block">
                <div className="eyebrow">{a.category}</div>
                <div className="font-display text-2xl mt-1 group-hover:text-primary">{a.title}</div>
                <div className="text-sm text-foreground/70 mt-2 max-w-2xl">{a.abstract}</div>
                <div className="text-xs text-muted-foreground mt-3">{a.author} · {a.affiliation} · {a.date}</div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
