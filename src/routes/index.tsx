import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ArrowRight, BadgeCheck, BookOpenCheck, CalendarClock, Globe2 } from "lucide-react";
import { fetchPublishedArticles, type DBArticle } from "@/lib/data";
import { useEffect, useState } from "react";
import { useSiteContent, fetchSeoMetadata } from "@/hooks/useSiteContent";
import { ArticleGridSkeleton } from "@/components/site/Skeletons";
import heroPaddyWebp from "@/assets/hero-paddy.webp";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => {
    const [seo, articles] = await Promise.all([
      fetchSeoMetadata("home"),
      fetchPublishedArticles(4).catch((err) => {
        console.error("Failed to SSR-load published articles:", err);
        return [] as DBArticle[];
      }),
    ]);
    return { seo, articles };
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.seo
      ? [
          { title: loaderData.seo.title },
          { name: "description", content: loaderData.seo.description },
          { property: "og:title", content: loaderData.seo.title },
          { property: "og:description", content: loaderData.seo.description },
        ]
      : [{ title: "The Agriculture Popular Article Magazine" }],
    links: [{ rel: "canonical", href: "https://agriculturemagazine.in/" }],
  }),
});

function getDeadlineText() {
  const now = new Date();
  const day = now.getDate();
  let monthIndex = now.getMonth();
  let year = now.getFullYear();

  if (day > 25) {
    monthIndex = (monthIndex + 1) % 12;
    if (monthIndex === 0) {
      year += 1;
    }
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `25th ${monthNames[monthIndex]}, ${year}`;
}

function Home() {
  const loaderData = Route.useLoaderData();
  const { get } = useSiteContent("home");
  const cmsDeadline = get("banner", "deadline_date");
  const deadlineText = cmsDeadline || getDeadlineText();

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <Hero deadline={deadlineText} latest={loaderData?.articles ?? []} />

        <Intro />
        <RecentBlogs initialArticles={loaderData?.articles} />
        <VisionMission />
      </main>
      <SiteFooter />
    </>
  );
}

const BENEFITS = [
  { icon: Globe2, text: "Open access: farmers, students and scientists read your work free, with no paywall" },
  { icon: BookOpenCheck, text: "Peer-reviewed by our editorial board, published monthly" },
  { icon: BadgeCheck, text: "A citable article page and a certificate of publication for you" },
];

// Home hero: tells authors why to publish here and gives one clear next step.
function Hero({ deadline, latest }: { deadline: string; latest: DBArticle[] }) {
  const { getJson } = useSiteContent("home");
  // Admin → Site Content → hero slide images: the first one is used as the photo.
  const photo = getJson<"hero", "slide_images", { img: string; alt: string }[]>("hero", "slide_images")[0];
  const issue = latest[0];

  return (
    <section className="border-b border-rule bg-paper">
      <div className="container-editorial grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center py-10 md:py-14">
        <div>
          <div className="eyebrow text-primary">Monthly · Peer-reviewed · Open access</div>
          <h1 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] text-ink leading-[1.1] mt-3">
            Turn your agricultural research into an article people actually read
          </h1>
          <p className="mt-4 text-base md:text-lg text-foreground/75 leading-relaxed max-w-xl">
            Publish a popular article in The Agriculture Popular Article Magazine and take your
            work from the lab to the field.
          </p>
          <ul className="mt-6 space-y-3">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm md:text-base text-foreground/85">
                <Icon className="h-5 w-5 shrink-0 text-primary mt-0.5" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 bg-orange text-navy font-semibold px-6 py-3 rounded-sm hover:bg-primary hover:text-white transition-colors"
            >
              Submit your article <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/current-issue"
              className="inline-flex items-center gap-2 border border-ink/20 px-6 py-3 rounded-sm text-ink hover:border-primary hover:text-primary transition-colors"
            >
              Read the current issue
            </Link>
          </div>
          <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-foreground/70">
            <CalendarClock className="h-4 w-4 text-orange" aria-hidden="true" />
            Next issue: submissions close <strong className="text-ink">{deadline}</strong>
            <span aria-hidden="true">·</span>
            <Link to="/submission-guidelines" className="text-primary hover:text-orange underline-offset-2 hover:underline">
              Author guidelines
            </Link>
          </p>
        </div>

        <div className="relative lg:pb-6">
          <img
            src={photo?.img || heroPaddyWebp}
            alt={photo?.alt || "Paddy field"}
            width={1200}
            height={900}
            fetchPriority="high"
            className="hidden sm:block w-full aspect-[4/3] object-cover rounded-sm border border-rule"
          />
          {issue && (
            <div className="sm:absolute sm:left-6 sm:right-6 sm:-bottom-6 lg:-left-8 lg:right-10 bg-background border border-rule rounded-sm shadow-lg p-5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="eyebrow">Latest issue</div>
                {issue.volume ? (
                  <div className="text-xs text-muted-foreground">
                    Vol. {issue.volume}, No. {issue.issueNumber}
                    {issue.date ? ` · ${issue.date}` : ""}
                  </div>
                ) : null}
              </div>
              <ul className="mt-3 space-y-2">
                {latest.slice(0, 3).map((a) => (
                  <li key={a.slug}>
                    <Link
                      to="/articles/$slug"
                      params={{ slug: a.slug }}
                      className="font-display text-ink leading-snug hover:text-primary line-clamp-1"
                    >
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to="/current-issue"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-orange"
              >
                See all articles <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Intro() {
  const { get } = useSiteContent("home");
  return (
    <section className="container-editorial py-12 md:py-16">
      <div className="hr-divider mb-8">
        <h2 className="section-title text-xl md:text-2xl text-center">{get("intro", "heading")}</h2>
      </div>
      <p className="max-w-3xl mx-auto text-center text-foreground/75 leading-relaxed text-base md:text-lg">
        {get("intro", "body")}
      </p>

      {/* Magazine Highlights Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10 max-w-5xl mx-auto">
        <div className="bg-paper border border-rule p-5 text-center hover-lift flex flex-col items-center">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center mb-3 font-display font-bold text-base">
            01
          </div>
          <h3 className="font-display text-navy font-bold text-base">Monthly Edition</h3>
          <p className="text-xs text-foreground/70 mt-1.5 leading-relaxed">
            Timely monthly publications bringing latest agricultural innovations and research to light.
          </p>
        </div>

        <div className="bg-paper border border-rule p-5 text-center hover-lift flex flex-col items-center">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center mb-3 font-display font-bold text-base">
            02
          </div>
          <h3 className="font-display text-navy font-bold text-base">Peer-Reviewed</h3>
          <p className="text-xs text-foreground/70 mt-1.5 leading-relaxed">
            Rigorous editorial review ensuring scientific accuracy and popular readership appeal.
          </p>
        </div>

        <div className="bg-paper border border-rule p-5 text-center hover-lift flex flex-col items-center">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center mb-3 font-display font-bold text-base">
            03
          </div>
          <h3 className="font-display text-navy font-bold text-base">Open Access</h3>
          <p className="text-xs text-foreground/70 mt-1.5 leading-relaxed">
            Free and unrestricted access under CC BY-NC 4.0 for scientists, students, and farmers.
          </p>
        </div>

        <div className="bg-paper border border-rule p-5 text-center hover-lift flex flex-col items-center">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary grid place-items-center mb-3 font-display font-bold text-base">
            04
          </div>
          <h3 className="font-display text-navy font-bold text-base">Digital Certificates</h3>
          <p className="text-xs text-foreground/70 mt-1.5 leading-relaxed">
            Verifiable e-certificates issued for published authors and registered members.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
        <Link to="/about" className="btn-orange">
          About The Magazine
        </Link>
        <Link
          to="/about"
          className="text-xs uppercase tracking-wider font-semibold text-primary hover:text-orange transition-colors font-sans py-2 px-4 border border-rule hover:border-orange bg-white"
        >
          View Journal Particulars →
        </Link>
      </div>
    </section>
  );
}

function RecentBlogs({ initialArticles }: { initialArticles?: DBArticle[] }) {
  const [articles, setArticles] = useState<DBArticle[]>(initialArticles ?? []);
  const [loading, setLoading] = useState(!initialArticles || initialArticles.length === 0);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (initialArticles && initialArticles.length > 0) {
      setArticles(initialArticles);
      setLoading(false);
      return;
    }
    fetchPublishedArticles(4)
      .then((data) => {
        setArticles(data);
        setError(false);
      })
      .catch((err) => {
        console.error("Failed to fetch published articles:", err);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [initialArticles]);

  return (
    <section className="bg-paper border-y border-rule py-12 md:py-16">
      <div className="container-editorial">
        <div className="hr-divider mb-10">
          <h2 className="section-title text-xl md:text-2xl text-center">Recent Articles</h2>
        </div>

        {loading ? (
          <ArticleGridSkeleton count={4} />
        ) : error ? (
          <div className="py-12 text-center text-muted-foreground text-sm border border-dashed border-rule bg-white max-w-lg mx-auto">
            Articles are temporarily unavailable. Please try again later.
          </div>
        ) : articles.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm border border-dashed border-rule bg-white max-w-lg mx-auto">
            No published articles found.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {articles.slice(0, 4).map((a) => (
              <article
                key={a.slug}
                className="bg-white border border-rule hover-lift flex flex-col group overflow-hidden"
              >
                <Link
                  to="/articles/$slug"
                  params={{ slug: a.slug }}
                  className="block aspect-[16/10] overflow-hidden bg-muted"
                >
                  <img
                    src={a.cover || "/placeholder.svg"}
                    alt={a.title}
                    width={800}
                    height={500}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      const t = e.currentTarget as HTMLImageElement;
                      if (!t.src.endsWith("/placeholder.svg")) t.src = "/placeholder.svg";
                    }}
                  />
                </Link>
                <div className="p-5 flex flex-col flex-1">
                  <div className="text-[11px] text-orange font-semibold uppercase tracking-wider">
                    {a.category}
                  </div>
                  <h3 className="font-display text-base md:text-lg mt-1.5 font-bold leading-snug text-navy">
                    <Link
                      to="/articles/$slug"
                      params={{ slug: a.slug }}
                      className="hover:text-orange transition-colors line-clamp-2"
                    >
                      {a.title}
                    </Link>
                  </h3>
                  <div className="mt-2 text-xs text-muted-foreground font-sans leading-relaxed">
                    <span className="font-medium text-foreground/85">{a.author}</span>
                    <br />
                    <span className="inline-flex items-center gap-1 text-[11px] text-foreground/60 mt-0.5">
                      Vol. {a.volume} · Issue {a.issueNumber}
                      {(a.pageStart || a.pageEnd) && (
                        <span>
                          · pp. {a.pageStart ?? "—"}
                          {a.pageEnd ? `–${a.pageEnd}` : ""}
                        </span>
                      )}
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs text-foreground/70 leading-relaxed line-clamp-3">
                    {a.abstract}
                  </p>
                  <Link
                    to="/articles/$slug"
                    params={{ slug: a.slug }}
                    className="mt-auto pt-4 inline-flex items-center text-xs uppercase font-condensed tracking-wider font-semibold text-orange hover:text-navy transition-colors"
                  >
                    Read Article →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <Link to="/current-issue" className="btn-orange">
            View All Articles in the Current Issue
          </Link>
        </div>
      </div>
    </section>
  );
}

function VisionMission() {
  const { get } = useSiteContent("home");
  return (
    <section className="container-editorial py-12 md:py-16">
      <div className="hr-divider mb-8">
        <h2 className="section-title text-xl md:text-2xl text-center">
          {get("vision_mission", "heading")}
        </h2>
      </div>
      <p className="max-w-3xl mx-auto text-center text-foreground/75 leading-relaxed text-base">
        {get("vision_mission", "body")}
      </p>
    </section>
  );
}
