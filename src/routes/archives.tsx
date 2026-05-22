import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { fetchIssues, type IssueRow } from "@/lib/data";
import { useEffect, useMemo, useState } from "react";
import { fetchSeoMetadata, useSiteContent } from "@/hooks/useSiteContent";

export const Route = createFileRoute("/archives")({
  component: Archives,
  loader: () => fetchSeoMetadata("archives"),
  head: ({ loaderData }) => ({
    title: loaderData?.title || "Archives — The Agriculture Popular Article Magazine",
    meta: loaderData
      ? [
          { name: "description", content: loaderData.description },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.description },
        ]
      : [],
  }),
});

function Archives() {
  const [issues, setIssues] = useState<IssueRow[]>([]);
  const [year, setYear] = useState<string>("all");
  const { get } = useSiteContent("archives");

  useEffect(() => {
    fetchIssues().then(setIssues);
  }, []);

  const years = useMemo(() => {
    const set = new Set<string>();
    issues.forEach((i) => {
      const m = i.date.match(/\d{4}/);
      if (m) set.add(m[0]);
    });
    return ["all", ...Array.from(set).sort().reverse()];
  }, [issues]);

  const filtered = issues.filter((i) => year === "all" || i.date.includes(year));

  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16">
        <div className="eyebrow">Archives</div>
        <h1 className="font-display text-5xl md:text-6xl mt-3 text-ink">{get("hero", "headline")}</h1>
        <p className="mt-5 max-w-2xl text-foreground/70">
          {get("hero", "subtitle")}
        </p>

        <div className="mt-10 flex gap-2 flex-wrap">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`text-xs px-4 py-2 rounded-sm border ${year === y ? "bg-foreground text-background border-foreground" : "border-rule hover:border-primary"}`}
            >
              {y === "all" ? "All Years" : y}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 text-center text-muted-foreground">No issues to show yet.</div>
        )}

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {filtered.map((i) => (
            <div key={i.id} className="hover-lift">
              <div className="bg-muted aspect-[3/4] overflow-hidden">
                <img
                  src={i.cover}
                  alt={i.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="eyebrow mt-5">
                Vol {i.volume} · Issue {i.number} · {i.date}
              </div>
              <h3 className="font-display text-2xl mt-2">{i.title}</h3>
              <p className="text-sm text-foreground/70 mt-3 leading-relaxed">{i.desc}</p>
              <Link
                to="/current-issue"
                className="text-xs text-primary mt-4 inline-block hover:underline"
              >
                Open issue →
              </Link>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
