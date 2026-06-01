import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { fetchIssues, type IssueRow } from "@/lib/data";
import { useMemo, useState } from "react";
import { fetchSeoMetadata, useSiteContent } from "@/hooks/useSiteContent";

export const Route = createFileRoute("/archives")({
  component: Archives,
  loader: async () => {
    const [seo, issues] = await Promise.all([
      fetchSeoMetadata("archives"),
      fetchIssues(),
    ]);
    return { seo, issues };
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.seo
      ? [
          { title: loaderData.seo.title },
          { name: "description", content: loaderData.seo.description },
          { property: "og:title", content: loaderData.seo.title },
          { property: "og:description", content: loaderData.seo.description },
        ]
      : [{ title: "Archives — The Agriculture Popular Article Magazine" }],
    links: [{ rel: "canonical", href: "/archives" }],
  }),
});

function Archives() {
  const { issues } = Route.useLoaderData();
  const [year, setYear] = useState<string>("all");
  const [month, setMonth] = useState<string>("all");
  const { get } = useSiteContent("archives");

  const years = useMemo(() => {
    const set = new Set<string>();
    issues.forEach((i) => {
      const m = i.date.match(/\d{4}/);
      if (m) set.add(m[0]);
    });
    return ["all", ...Array.from(set).sort().reverse()];
  }, [issues]);

  const months = useMemo(() => {
    const set = new Set<string>();
    issues.forEach((i) => {
      const parts = i.date.split(" ");
      if (parts.length > 0 && parts[0]) {
        if (isNaN(Number(parts[0]))) {
          set.add(parts[0]);
        }
      }
    });
    const monthOrder = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const list = Array.from(set).sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
    return ["all", ...list];
  }, [issues]);

  const filtered = issues.filter((i) => {
    const yearMatch = year === "all" || i.date.includes(year);
    const monthMatch = month === "all" || i.date.includes(month);
    return yearMatch && monthMatch;
  });

  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16">
        <div className="eyebrow">Archives</div>
        <h1 className="font-display text-5xl md:text-6xl mt-3 text-ink">{get("hero", "headline")}</h1>
        <p className="mt-5 max-w-2xl text-foreground/70">
          {get("hero", "subtitle")}
        </p>

        <div className="mt-10 space-y-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-foreground/50 font-bold block mb-2 font-sans">Filter by Year</span>
            <div className="flex gap-2 flex-wrap">
              {years.map((y) => (
                <button
                  key={y}
                  onClick={() => {
                    setYear(y);
                    setMonth("all"); // Reset month when year changes to prevent zero-result states
                  }}
                  className={`text-xs px-4 py-2 rounded-sm border font-sans ${year === y ? "bg-primary text-white border-primary" : "border-rule bg-paper hover:border-primary text-foreground/80"}`}
                >
                  {y === "all" ? "All Years" : y}
                </button>
              ))}
            </div>
          </div>

          {months.length > 1 && (
            <div>
              <span className="text-xs uppercase tracking-wider text-foreground/50 font-bold block mb-2 font-sans">Filter by Month</span>
              <div className="flex gap-2 flex-wrap">
                {months.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMonth(m)}
                    className={`text-xs px-4 py-2 rounded-sm border font-sans ${month === m ? "bg-primary text-white border-primary" : "border-rule bg-paper hover:border-primary text-foreground/80"}`}
                  >
                    {m === "all" ? "All Months" : m}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 text-center text-muted-foreground">No issues to show yet.</div>
        )}

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {filtered.map((i) => (
            <div key={i.id} className="hover-lift">
              <div className="bg-paper border border-rule aspect-[3/4] overflow-hidden flex items-center justify-center">
                <img
                  src={i.cover || undefined}
                  alt={i.title}
                  className="w-full h-full object-contain bg-stone-50/50 p-2"
                  loading="lazy"
                />
              </div>
              <div className="text-xs text-foreground/60 uppercase font-semibold tracking-wider mt-5">
                Vol {i.volume} · Issue {i.number} · {i.date}
              </div>
              <h3 className="font-display text-2xl md:text-[28px] leading-tight mt-2">{i.title}</h3>
              <p className="text-[15px] text-foreground/70 mt-3 leading-relaxed">{i.desc}</p>
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
