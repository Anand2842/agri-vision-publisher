import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { fetchIssues, fetchPublishedArticles, articlePdf, type IssueRow, type DBArticle } from "@/lib/data";
import { useMemo, useState, useEffect } from "react";
import { fetchSeoMetadata, useSiteContent } from "@/hooks/useSiteContent";
import { Download, ChevronDown, ChevronUp, FileText } from "lucide-react";


const escapeJsonLd = (json: string) => json.replace(/<\/script/gi, "<\\/script");

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
    links: [{ rel: "canonical", href: "https://agriculturemagazine.in/archives" }],
  }),
});

function Archives() {
  const { issues } = Route.useLoaderData() as { seo: { title: string; description: string }; issues: IssueRow[] };
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

  const collectionSchema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Archives",
    description: "Browse all issues of The Agriculture Popular Article Magazine.",
    url: "https://agriculturemagazine.in/archives",
    hasPart: issues.map((i: IssueRow) => ({
      "@type": "CreativeWork",
      name: i.title,
      description: i.desc,
      url: "https://agriculturemagazine.in/current-issue",
      datePublished: i.publishedAt,
      image: i.cover,
    })),
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escapeJsonLd(collectionSchema) }} />
      <SiteHeader />
      <main id="main-content">
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

        <div className="mt-14 space-y-10">
          {filtered.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </main>
      </main>
      <SiteFooter />
    </>
  );
}

/** Lazily loaded expandable issue card with per-article PDF Table of Contents */
function IssueCard({ issue }: { issue: IssueRow }) {
  const [open, setOpen] = useState(false);
  const [articles, setArticles] = useState<DBArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const handleToggle = async () => {
    setOpen((prev) => !prev);
    if (!fetched) {
      setLoading(true);
      try {
        // Fetch articles that belong to this issue's volume/number
        const all = await fetchPublishedArticles();
        const filtered = all.filter(
          (a) => a.volume === issue.volume && a.issueNumber === issue.number
        );
        setArticles(filtered);
      } catch {
        setArticles([]);
      } finally {
        setLoading(false);
        setFetched(true);
      }
    }
  };

  return (
    <div className="border border-rule bg-white">
      {/* Issue header row */}
      <div className="grid sm:grid-cols-[auto_1fr] gap-6 p-6">
        <div className="bg-paper border border-rule w-28 sm:w-36 aspect-[3/4] overflow-hidden flex items-center justify-center shrink-0">
          <img
            src={issue.cover || undefined}
            alt={issue.title}
            width={288}
            height={384}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="flex flex-col justify-between gap-4">
          <div>
            <div className="text-xs text-foreground/55 uppercase font-semibold tracking-wider">
              Vol {issue.volume} · Issue {issue.number} · {issue.date}
            </div>
            <h2 className="font-display text-2xl md:text-3xl leading-tight mt-2">{issue.title}</h2>
            <p className="text-[14px] text-muted-foreground mt-2 leading-relaxed line-clamp-2">{issue.desc}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {issue.pdfUrl && (
              <a
                href={issue.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[oklch(var(--navy))] border border-[oklch(var(--navy))]/25 px-3 py-1.5 hover:bg-[oklch(var(--navy))]/5 transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Full Issue PDF
              </a>
            )}
            <button
              onClick={handleToggle}
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-primary border border-primary/25 px-3 py-1.5 hover:bg-primary/5 transition-colors"
            >
              {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {open ? "Hide" : "View"} Table of Contents
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Table of Contents */}
      {open && (
        <div className="border-t border-rule bg-paper px-6 py-5">
          <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[oklch(var(--orange))] mb-4">
            Table of Contents — Vol {issue.volume}, Issue {issue.number}
          </div>
          {loading ? (
            <ol className="divide-y divide-rule">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="flex items-start gap-4 py-3">
                  <div className="h-4 w-6 rounded-sm bg-foreground/8 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 rounded-sm bg-orange/15 animate-pulse" />
                    <div className="h-5 w-[80%] rounded-sm bg-foreground/10 animate-pulse" />
                    <div className="h-3 w-52 rounded-sm bg-foreground/8 animate-pulse" />
                  </div>
                </li>
              ))}
            </ol>
          ) : articles.length === 0 ? (
            <div className="py-3 text-sm text-muted-foreground">
              No articles indexed for this issue yet.
            </div>
          ) : (
            <ol className="divide-y divide-rule">
              {articles.map((a, idx) => {
                const pdf = articlePdf(a.pdfPath);
                return (
                  <li key={a.slug} className="flex items-start gap-4 py-3">
                    <span className="font-display text-base text-[oklch(var(--orange))] tabular-nums shrink-0 w-6 text-right">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-foreground/50 font-semibold">{a.category}</div>
                      <Link
                        to="/articles/$slug"
                        params={{ slug: a.slug }}
                        className="font-display text-[oklch(var(--navy))] hover:text-[oklch(var(--orange))] transition-colors leading-snug block mt-0.5"
                      >
                        {a.title}
                      </Link>
                      <div className="text-xs text-foreground/55 mt-1 font-sans">
                        <span className="font-medium text-foreground/80">{a.author}</span>
                        {a.affiliation && <span className="italic"> · {a.affiliation}</span>}
                        <div className="mt-0.5">
                          Vol. {issue.volume} · Issue {issue.number}
                          {(a.pageStart || a.pageEnd) && (
                            <span className="ml-1 text-foreground/40">
                              · pp. {a.pageStart ?? "—"}{a.pageEnd ? `–${a.pageEnd}` : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2 ml-2">
                      <Link
                        to="/articles/$slug"
                        params={{ slug: a.slug }}
                        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-[oklch(var(--navy))]/60 hover:text-[oklch(var(--navy))] transition-colors"
                      >
                        <FileText className="h-3 w-3" /> Read
                      </Link>
                      {pdf ? (
                        <a
                          href={pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-[oklch(var(--orange))] hover:text-[oklch(var(--orange))]/80 transition-colors"
                        >
                          <Download className="h-3 w-3" /> PDF
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-foreground/25 cursor-not-allowed">
                          <Download className="h-3 w-3" /> PDF
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
