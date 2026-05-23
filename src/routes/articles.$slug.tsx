import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { fetchArticleBySlug, fetchPublishedArticles, articlePdf } from "@/lib/data";
import { Bookmark, Share2, Download, Quote, Clock, Eye } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

export const Route = createFileRoute("/articles/$slug")({
  component: Article,
  notFoundComponent: () => (
    <>
      <SiteHeader />
      <main className="container-editorial py-32 text-center">
        <h1 className="font-display text-4xl">Article not found</h1>
        <Link to="/archives" className="text-primary mt-4 inline-block">
          Browse archives →
        </Link>
      </main>
      <SiteFooter />
    </>
  ),
  loader: async ({ params }) => {
    const a = await fetchArticleBySlug(params.slug);
    if (!a) throw notFound();
    const pool = await fetchPublishedArticles();
    const related = pool.filter((x) => x.slug !== a.slug).slice(0, 3);
    return { a, related };
  },
  head: ({ loaderData }) => ({
    title: loaderData ? `${loaderData.a.title} — The Agriculture Popular Article Magazine` : "Article — The Agriculture Popular Article Magazine",
    meta: loaderData
      ? [
          { name: "description", content: loaderData.a.abstract },
          { property: "og:title", content: loaderData.a.title },
          { property: "og:description", content: loaderData.a.abstract },
          { property: "og:image", content: loaderData.a.cover },
        ]
      : [],
  }),
});

function Article() {
  const { a, related } = Route.useLoaderData();
  const { get: getHeader } = useSiteContent("header");
  const siteTitle = (getHeader("branding", "title_line1") || "The Agriculture") + " " + (getHeader("branding", "title_line2") || "Popular Article Magazine");
  const pdfHref = articlePdf(a.pdfPath);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const onShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: a.title, text: a.abstract, url: shareUrl });
      } catch {
        // Ignore share failure/cancellation
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
    }
  };
  return (
    <>
      <SiteHeader />
      <main>
        <header className="container-editorial pt-16 pb-12">
          <div className="max-w-3xl mx-auto text-center">
            <div className="eyebrow">{a.category}</div>
            <h1 className="font-display text-4xl md:text-6xl mt-5 text-ink leading-[1.05]">
              {a.title}
            </h1>
            <div className="mt-7 text-sm text-muted-foreground flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <span>{a.author}</span>
              <span>·</span>
              <span>{a.affiliation}</span>
              <span>·</span>
              <span>{a.date}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {a.readTime} min
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3 w-3" /> {a.views}
              </span>
            </div>
          </div>
        </header>

        <div className="container-editorial">
          <img
            src={a.cover}
            alt={a.title}
            className="w-full aspect-[16/9] object-contain bg-stone-50/50 p-2 border border-rule rounded-sm"
          />
        </div>

        <div className="container-editorial grid md:grid-cols-12 gap-12 mt-14">
          <aside className="md:col-span-1 md:sticky md:top-28 self-start hidden md:flex flex-col gap-3 text-muted-foreground">
            <button
              onClick={onShare}
              className="p-2 hover:text-primary"
              aria-label="Share / Copy link"
            >
              <Share2 className="h-4 w-4" />
            </button>
            {pdfHref ? (
              <a
                href={pdfHref}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:text-primary"
                aria-label="Download PDF"
              >
                <Download className="h-4 w-4" />
              </a>
            ) : (
              <span className="p-2 opacity-30" aria-label="PDF unavailable">
                <Download className="h-4 w-4" />
              </span>
            )}
            <button
              onClick={() =>
                navigator.clipboard?.writeText(
                  `${a.author} (${a.date}). ${a.title}. ${siteTitle}.`,
                )
              }
              className="p-2 hover:text-primary"
              aria-label="Copy citation"
            >
              <Quote className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigator.clipboard?.writeText(shareUrl)}
              className="p-2 hover:text-primary"
              aria-label="Copy link"
            >
              <Bookmark className="h-4 w-4" />
            </button>
          </aside>
          <article className="md:col-span-7 max-w-2xl mx-auto">
            <div className="bg-paper border-l-4 border-primary p-6 mb-10">
              <div className="eyebrow mb-3">Key Insights</div>
              <ul className="space-y-2 text-sm text-foreground/85 list-disc pl-5">
                <li>
                  A multi-season trial across six agro-ecological zones reveals a 22% yield
                  advantage.
                </li>
                <li>Resistance traits cluster around three known QTL loci on chromosome 2B.</li>
                <li>Smallholder adoption depends critically on seed-system access, not biology.</li>
              </ul>
            </div>

            <p className="drop-cap text-lg leading-[1.75] text-foreground/85">
              {a.abstract} The findings reported here emerge from a four-year multi-institutional
              collaboration spanning research stations in three countries. Across thirty-two field
              plots, our team measured agronomic, physiological, and socio-economic indicators in
              tandem — an integrated approach increasingly necessary as farming systems collide with
              climate volatility.
            </p>
            <p className="mt-6 text-foreground/85 leading-[1.75]">
              The opening section reviews methodology in detail. Readers familiar with classical
              breeding trials may skim the first three pages; novel material begins with the
              molecular-marker analysis on page seven, where we describe a previously unreported
              allelic combination associated with durable resistance under elevated daytime
              temperatures.
            </p>
            <h2 className="font-display text-2xl md:text-3xl mt-12 text-ink">Methodology</h2>
            <p className="mt-4 text-foreground/85 leading-[1.75]">
              Field trials followed an alpha-lattice design with four replications per location.
              Phenotyping covered 18 traits at three growth stages. Genotyping used the 35K Axiom
              Wheat Breeders' Array. Statistical models accounted for genotype × environment
              interactions using mixed-effects regression.
            </p>
            <blockquote className="my-12 border-l-2 border-primary pl-6 font-display text-2xl md:text-3xl text-ink leading-snug">
              "The biological gains are real — but the bottleneck remains seed access. Without a
              working seed system, durable resistance is a paper victory."
            </blockquote>
            <h2 className="font-display text-2xl md:text-3xl mt-12 text-ink">
              Results &amp; Discussion
            </h2>
            <p className="mt-4 text-foreground/85 leading-[1.75]">
              Across all locations, the candidate lines outperformed local checks by a mean of 22%
              under inoculated conditions and held a 9% advantage under non-inoculated controls.
              Heritability estimates remained stable across years, suggesting reliable transmission
              of resistance to subsequent generations.
            </p>
            <p className="mt-6 text-foreground/85 leading-[1.75]">
              These outcomes echo earlier reports from East African trials, but extend the work by
              integrating socio-economic survey data: farmer willingness-to-adopt was strongly
              predicted by perceived seed quality, not yield differential alone.
            </p>

            <div className="rule-thin mt-16 pt-8">
              <div className="eyebrow">About the author</div>
              <div className="flex items-start gap-4 mt-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center font-display text-primary text-lg">
                  {a.author
                    .split(" ")
                    .map((p: string) => p[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <div className="font-display text-lg">{a.author}</div>
                  <div className="text-sm text-muted-foreground">{a.affiliation}</div>
                  <p className="text-sm mt-2 text-foreground/75 max-w-md">
                    Senior researcher with two decades of experience in cereal genetics and breeding
                    for stress-prone environments.
                  </p>
                </div>
              </div>
            </div>
          </article>
          <aside className="md:col-span-4">
            <div className="md:sticky md:top-28">
              <div className="eyebrow">Related</div>
              <div className="rule-thick mt-3" />
              <ul className="mt-5 space-y-7">
                {related.map((r: typeof a) => (
                  <li key={r.slug}>
                    <Link to="/articles/$slug" params={{ slug: r.slug }} className="group block">
                      <div className="eyebrow text-[0.6rem]">{r.category}</div>
                      <div className="font-display text-lg mt-1 group-hover:text-primary leading-snug">
                        {r.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{r.author}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
