import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  head: ({ params, loaderData }) => {
    const baseMeta = loaderData
      ? [
          { title: `${loaderData.a.title} — The Agriculture Popular Article Magazine` },
          { name: "description", content: loaderData.a.abstract },
          { property: "og:title", content: loaderData.a.title },
          { property: "og:description", content: loaderData.a.abstract },
          { property: "og:image", content: loaderData.a.cover },
          { property: "og:type", content: "article" },
        ]
      : [{ title: "Article — The Agriculture Popular Article Magazine" }];
    const scripts = loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: loaderData.a.title,
              description: loaderData.a.abstract,
              image: loaderData.a.cover,
              author: {
                "@type": "Person",
                name: loaderData.a.author,
                ...(loaderData.a.affiliation
                  ? { affiliation: { "@type": "Organization", name: loaderData.a.affiliation } }
                  : {}),
              },
              datePublished: loaderData.a.publishedAt,
              publisher: {
                "@type": "Organization",
                name: "The Agriculture Popular Article Magazine",
                url: "https://theagriculturepopulararticlemagazine.lovable.app",
                logo: "https://storage.googleapis.com/gpt-engineer-file-uploads/slAjYeeuQ8SRuPj17PjsNhvrcv43/social-images/social-1779385100705-logo.webp",
              },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `https://theagriculturepopulararticlemagazine.lovable.app/articles/${params.slug}`,
              },
            }),
          },
        ]
      : [];
    return {
      meta: baseMeta,
      links: [{ rel: "canonical", href: `/articles/${params.slug}` }],
      scripts,
    };
  }),
});

function Article() {
  const { a, related } = Route.useLoaderData();
  const { get: getHeader } = useSiteContent("header");

  useEffect(() => {
    if (a?.id) {
      try {
        const sessionKey = "tapam_viewed_articles";
        const raw = sessionStorage.getItem(sessionKey);
        const viewedIds: string[] = raw ? JSON.parse(raw) : [];
        
        if (!viewedIds.includes(a.id)) {
          viewedIds.push(a.id);
          sessionStorage.setItem(sessionKey, JSON.stringify(viewedIds));
          
          (supabase as any).rpc("increment_article_views", { article_id: a.id }).then(({ error }: { error: any }) => {
            if (error) console.error("Error incrementing views:", error);
          });
        }
      } catch (err) {
        (supabase as any).rpc("increment_article_views", { article_id: a.id }).then(({ error }: { error: any }) => {
          if (error) console.error("Error incrementing views:", error);
        });
      }
    }
  }, [a?.id]);

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
            src={a.cover || "/placeholder.svg"}
            alt={a.title}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
            }}
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
            {a.content ? (
              <div 
                className="article-content prose prose-stone max-w-none prose-p:text-foreground/85 prose-p:leading-[1.75] prose-headings:font-display prose-headings:text-ink prose-a:text-primary hover:prose-a:text-orange"
                dangerouslySetInnerHTML={{ __html: a.content }} 
              />
            ) : (
              <p className="drop-cap text-lg leading-[1.75] text-foreground/85">
                {a.abstract}
              </p>
            )}

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
                    {a.authorBio || "Contributor to The Agriculture Popular Article Magazine."}
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
