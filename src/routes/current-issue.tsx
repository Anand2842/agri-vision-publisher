import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { fetchIssues, fetchPublishedArticles, articlePdf, type IssueRow, type DBArticle } from "@/lib/data";
import { useEffect, useState } from "react";
import { Download, FileText, BookOpen, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/current-issue")({
  component: CurrentIssue,
  head: () => ({
    meta: [
      { title: "Current Issue — The Agriculture Magazine" },
      {
        name: "description",
        content:
          "Read or download the latest peer-reviewed issue of The Agriculture Magazine.",
      },
    ],
  }),
});

function CurrentIssue() {
  const [issue, setIssue] = useState<IssueRow | null>(null);
  const [articles, setArticles] = useState<DBArticle[]>([]);

  useEffect(() => {
    fetchIssues().then((rows) => setIssue(rows[0] ?? null));
    fetchPublishedArticles().then(setArticles);
  }, []);

  if (!issue) {
    return (
      <>
        <SiteHeader />
        <main className="container-editorial py-32 text-center text-muted-foreground">Loading…</main>
        <SiteFooter />
      </>
    );
  }

  const pdfHref = issue.pdfUrl;

  return (
    <>
      <SiteHeader />
      <main>
        {/* Masthead band */}
        <section className="border-b border-[oklch(var(--navy))]/15 bg-[oklch(var(--navy))]/[0.02]">
          <div className="container-editorial py-12 md:py-16">
            <div className="text-xs uppercase tracking-[0.2em] text-[oklch(var(--orange))] font-semibold">
              Current Issue
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl mt-3 text-[oklch(var(--navy))] leading-[1.05] max-w-4xl">
              Volume {issue.volume}, Issue {issue.number} — {issue.date}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground/70">
              <span className="font-display italic text-[oklch(var(--navy))] text-base">
                {issue.title}
              </span>
              <span className="text-[oklch(var(--navy))]/30">·</span>
              <span>{articles.length} articles</span>
              <span className="text-[oklch(var(--navy))]/30">·</span>
              <span>ISSN 2583-XXXX</span>
            </div>
          </div>
        </section>

        <section className="container-editorial py-16">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Cover + download rail */}
            <aside className="lg:col-span-5 lg:sticky lg:top-28">
              <div className="relative">
                <img
                  src={issue.cover}
                  alt={`Cover of Volume ${issue.volume}, Issue ${issue.number} — ${issue.title}`}
                  className="w-full max-w-md mx-auto shadow-2xl ring-1 ring-[oklch(var(--navy))]/10"
                />
                <div className="absolute -top-3 -left-3 bg-[oklch(var(--orange))] text-white text-[0.65rem] uppercase tracking-[0.2em] font-semibold px-3 py-1.5">
                  Just Released
                </div>
              </div>

              {/* Download / Read CTAs */}
              <div className="mt-8 max-w-md mx-auto space-y-3">
                {pdfHref ? (
                  <a
                    href={pdfHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 bg-[oklch(var(--navy))] text-white px-5 py-4 hover:bg-[oklch(var(--navy))]/90 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Download className="h-5 w-5" />
                      <span>
                        <span className="block text-sm font-semibold">View / Download Full Issue</span>
                        <span className="block text-[0.7rem] uppercase tracking-wider opacity-70">PDF</span>
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                  </a>
                ) : (
                  <div className="flex items-center justify-between gap-4 bg-[oklch(var(--navy))]/30 text-white/80 px-5 py-4 cursor-not-allowed">
                    <span className="flex items-center gap-3">
                      <FileText className="h-5 w-5" />
                      <span className="text-sm font-semibold">Issue PDF coming soon</span>
                    </span>
                  </div>
                )}
                <Link
                  to="/archives"
                  className="group flex items-center justify-between gap-4 border border-[oklch(var(--navy))]/25 text-[oklch(var(--navy))] px-5 py-4 hover:bg-[oklch(var(--navy))]/5 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-[oklch(var(--orange))]" />
                    <span className="text-sm font-semibold">Browse all back issues</span>
                  </span>
                  <ArrowRight className="h-4 w-4 opacity-50 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Citation block */}
              <div className="mt-8 max-w-md mx-auto border-t border-[oklch(var(--navy))]/15 pt-6">
                <div className="text-[0.65rem] uppercase tracking-[0.2em] text-[oklch(var(--orange))] font-semibold">
                  How to cite
                </div>
                <p className="mt-2 text-xs text-foreground/65 font-mono leading-relaxed">
                  The Agriculture Popular Article Magazine, Vol. {issue.volume}, Iss. {issue.number}{" "}
                  ({issue.date}). Online ISSN 2583-XXXX.
                </p>
              </div>
            </aside>

            {/* Editorial + ToC */}
            <div className="lg:col-span-7">
              <div className="text-xs uppercase tracking-[0.2em] text-[oklch(var(--orange))] font-semibold">
                In This Issue
              </div>
              <h2 className="font-display text-3xl md:text-4xl mt-3 text-[oklch(var(--navy))] leading-[1.1]">
                {issue.title}
              </h2>
              <p className="mt-6 text-lg text-foreground/75 leading-relaxed font-display">
                {issue.desc}
              </p>
              <p className="mt-4 text-foreground/70 leading-relaxed">
                A peer-reviewed selection of original research and field reports curated by the
                editorial board — covering agronomy, plant protection, horticulture, soil science
                and rural extension across the Indian sub-continent and beyond.
              </p>

              {/* Read articles */}
              <div className="mt-14">
                <div className="flex items-baseline justify-between border-b-2 border-[oklch(var(--navy))] pb-3">
                  <h3 className="font-display text-2xl text-[oklch(var(--navy))]">
                    Read the articles
                  </h3>
                  <span className="text-xs uppercase tracking-wider text-foreground/60">
                    {articles.length} papers
                  </span>
                </div>
                <ol className="divide-y divide-[oklch(var(--navy))]/10">
                  {articles.map((a, i) => (
                    <li key={a.slug}>
                      <div className="group grid grid-cols-12 gap-4 py-6 items-start">
                        <div className="col-span-2 sm:col-span-1 font-display text-2xl text-[oklch(var(--orange))] tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div className="col-span-10 sm:col-span-8">
                          <div className="text-[0.65rem] uppercase tracking-[0.2em] text-[oklch(var(--orange))] font-semibold">
                            {a.category}
                          </div>
                          <Link
                            to="/articles/$slug"
                            params={{ slug: a.slug }}
                            className="block"
                          >
                            <h4 className="font-display text-xl md:text-2xl mt-1.5 text-[oklch(var(--navy))] hover:text-[oklch(var(--orange))] transition-colors leading-snug">
                              {a.title}
                            </h4>
                            <p className="mt-2 text-sm text-foreground/65 leading-relaxed line-clamp-2">
                              {a.abstract}
                            </p>
                          </Link>
                          <div className="mt-3 text-xs text-foreground/60">
                            <span className="text-[oklch(var(--navy))] font-medium">{a.author}</span>
                            <span className="mx-2 text-[oklch(var(--navy))]/30">·</span>
                            <span className="italic">{a.affiliation}</span>
                          </div>
                        </div>
                        <div className="hidden sm:flex col-span-3 flex-col items-end gap-2 text-xs text-foreground/55">
                          <span>{a.readTime} min read</span>
                          <span>{a.views} views</span>
                          {articlePdf(a.pdfPath) ? (
                            <a
                              href={articlePdf(a.pdfPath)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-1 text-[oklch(var(--navy))] hover:text-[oklch(var(--orange))] uppercase tracking-wider font-semibold"
                            >
                              <Download className="h-3 w-3" /> PDF
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 mt-1 text-foreground/30 uppercase tracking-wider font-semibold cursor-not-allowed">
                              <Download className="h-3 w-3" /> PDF
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Submit CTA */}
              <div className="mt-16 border border-[oklch(var(--navy))]/15 bg-[oklch(var(--navy))]/[0.03] p-8 flex flex-col md:flex-row md:items-center gap-6 justify-between">
                <div>
                  <div className="text-[0.65rem] uppercase tracking-[0.2em] text-[oklch(var(--orange))] font-semibold">
                    Call for Papers
                  </div>
                  <h4 className="font-display text-2xl mt-2 text-[oklch(var(--navy))]">
                    Submit to the next issue
                  </h4>
                  <p className="mt-2 text-sm text-foreground/70 max-w-md">
                    Original research, field reports and short reviews from agricultural scientists,
                    extension officers and research scholars are welcome year-round.
                  </p>
                </div>
                <Link
                  to="/submit"
                  className="inline-flex items-center gap-2 bg-[oklch(var(--orange))] text-white px-6 py-3 text-sm font-semibold uppercase tracking-wider hover:bg-[oklch(var(--orange))]/90 transition-colors whitespace-nowrap"
                >
                  Submit Article <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
