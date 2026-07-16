import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { searchArticles, type DBArticle } from "@/lib/data";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Search as SearchIcon } from "lucide-react";

import { fetchSeoMetadata, useSiteContent } from "@/hooks/useSiteContent";
import { ListSkeleton } from "@/components/site/Skeletons";

const searchSchema = z.object({ q: z.string().optional().catch("") });

export const Route = createFileRoute("/search")({
  component: SearchPage,
  validateSearch: searchSchema,
  loader: () => fetchSeoMetadata("search"),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: loaderData.title },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.description },
        ]
      : [{ title: "Search Articles — The Agriculture Popular Article Magazine" }],
    links: [{ rel: "canonical", href: "https://agriculturemagazine.in/search" }],
  }),
});

function SearchPage() {
  const { q: initialQ } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(initialQ ?? "");
  const [results, setResults] = useState<DBArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const { get } = useSiteContent("search_page");

  useEffect(() => {
    let active = true;
    const term = q.trim();

    async function performSearch() {
      setLoading(true);
      try {
        const data = await searchArticles(term, 50);
        if (active) {
          setResults(data);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    const t = setTimeout(() => {
      // keep URL in sync
      navigate({ search: term ? { q: term } : {}, replace: true });
      performSearch();
    }, 250);

    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [q, navigate]);

  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16">
        <div className="eyebrow">Search</div>
        <h1 className="font-display text-5xl md:text-6xl mt-3 text-ink">
          {get("hero", "headline")}
        </h1>
        <div className="mt-10">
          <label htmlFor="search-input" className="sr-only">
            Search published articles
          </label>
          <div className="flex items-center gap-3 border-b-2 border-foreground pb-3">
            <SearchIcon className="h-5 w-5 text-muted-foreground" />
            <input
              id="search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. soil carbon, paddy, vertical farming"
              className="flex-1 bg-transparent text-2xl font-display outline-none placeholder:text-muted-foreground/60"
            />
            {loading && (
              <span className="text-xs text-muted-foreground animate-pulse font-mono shrink-0">
                Searching...
              </span>
            )}
          </div>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          {loading ? "Refreshing..." : `${results.length} result${results.length !== 1 ? "s" : ""}`}
        </div>
        <ul className="mt-10 divide-y divide-[var(--color-rule)]">
          {!loading && results.length === 0 && (
            <li className="py-12 text-center text-muted-foreground text-sm font-sans">
              No matching articles found. Try different keywords.
            </li>
          )}
          {results.map((a) => (
            <li key={a.slug} className="py-7">
              <Link to="/articles/$slug" params={{ slug: a.slug }} className="group block">
                <div className="eyebrow">{a.category}</div>
                <div className="font-display text-2xl mt-1 group-hover:text-primary">{a.title}</div>
                <div className="text-sm text-foreground/70 mt-2 max-w-2xl">{a.abstract}</div>
                <div className="text-xs text-muted-foreground mt-3">
                  {a.author} · {a.affiliation} · {a.date}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
