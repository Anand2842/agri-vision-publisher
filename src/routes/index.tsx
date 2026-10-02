import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { fetchPublishedArticles, type DBArticle } from "@/lib/data";
import { useEffect, useState } from "react";
import { useSiteContent, fetchSeoMetadata } from "@/hooks/useSiteContent";
import { ArticleGridSkeleton } from "@/components/site/Skeletons";
import heroPaddyWebp from "@/assets/hero-paddy.webp";
import heroTractorWebp from "@/assets/hero-tractor.webp";
import heroWheatWebp from "@/assets/hero-wheat.webp";
import heroFieldsWebp from "@/assets/hero-fields.webp";

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
        <HeroSlider />

        {/* Submission Deadline Banner */}
        <section className="bg-primary/5 border-b border-rule py-4">
          <div className="container-editorial flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="inline-flex items-center justify-center bg-orange text-navy text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded-sm font-sans shrink-0">
                Next Deadline
              </span>
              <p className="text-sm font-sans text-foreground/80 leading-normal">
                Submissions for the upcoming monthly issue close on{" "}
                <span className="text-primary font-bold font-display">{deadlineText}</span>.
              </p>
            </div>
            <div className="flex gap-4 items-center shrink-0">
              <Link
                to="/submit"
                className="text-xs uppercase tracking-wider font-semibold text-primary hover:text-orange transition-colors font-sans"
              >
                Submit Online →
              </Link>
              <span className="h-3 w-px bg-rule hidden sm:inline" />
              <Link
                to="/submission-guidelines"
                className="text-xs uppercase tracking-wider font-semibold text-muted-foreground hover:text-ink transition-colors font-sans"
              >
                Author Guidelines
              </Link>
            </div>
          </div>
        </section>

        <Intro />
        <RecentBlogs initialArticles={loaderData?.articles} />
        <VisionMission />
      </main>
      <SiteFooter />
    </>
  );
}

function HeroSlider() {
  const { get, getJson } = useSiteContent("home");
  const slides = getJson<"hero", "slide_images", { img: string; alt: string }[]>(
    "hero",
    "slide_images",
  );
  const webpMap: Record<string, string> = {
    ["/hero-tractor"]: heroTractorWebp,
    ["/hero-paddy"]: heroPaddyWebp,
    ["/hero-wheat"]: heroWheatWebp,
    ["/hero-fields"]: heroFieldsWebp,
  };
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setPrefersReducedMotion(true);
    }
  }, []);

  useEffect(() => {
    if (slides.length === 0 || paused || prefersReducedMotion) return;
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [slides.length, paused, prefersReducedMotion]);

  if (slides.length === 0) {
    return (
      <section className="relative w-full overflow-hidden bg-navy aspect-[16/9] sm:aspect-[21/9] md:aspect-[2.4/1] max-h-[420px]">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/90 to-primary/30 animate-pulse" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-white/60 font-display text-sm uppercase tracking-widest">
            Loading featured stories…
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden bg-navy aspect-[16/9] sm:aspect-[21/9] md:aspect-[2.4/1] max-h-[420px]">
      {slides.map((s, idx) => {
        const isCurrent = idx === i;
        const isAdjacent =
          idx === (i - 1 + slides.length) % slides.length || idx === (i + 1) % slides.length;
        if (!isCurrent && !isAdjacent) return null;
        const webpSrc = Object.entries(webpMap).find(([key]) => s.img.includes(key))?.[1];
        return (
          <picture key={idx}>
            {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
            <img
              src={s.img}
              alt={s.alt}
              width={1920}
              height={1080}
              loading={isCurrent ? "eager" : "lazy"}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1400ms] ${isCurrent ? "opacity-100" : "opacity-0"}`}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </picture>
        );
      })}
      <div className="absolute inset-0 bg-black/15" />
      <div className="absolute inset-x-0 bottom-10 md:bottom-14 flex flex-col items-center justify-end px-4">
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/60 to-transparent pointer-events-none hidden sm:block" />
        <h1 className="sr-only sm:not-sr-only sm:relative font-display text-white text-lg sm:text-xl md:text-2xl text-center leading-tight drop-shadow-lg">
          The Agriculture Popular Article Magazine
        </h1>
        <p className="relative mt-2 text-white/80 text-xs sm:text-sm md:text-base text-center font-sans max-w-2xl drop-shadow hidden sm:block">
          Bridging research and practice in agriculture through peer-reviewed popular articles
        </p>
      </div>

      <button
        onClick={() => setI((p) => (p - 1 + slides.length) % slides.length)}
        aria-label="Previous slide"
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 h-11 w-11 grid place-items-center bg-white/15 hover:bg-white/30 text-white backdrop-blur rounded-sm"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => setI((p) => (p + 1) % slides.length)}
        aria-label="Next slide"
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 h-11 w-11 grid place-items-center bg-white/15 hover:bg-white/30 text-white backdrop-blur rounded-sm"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <button
        onClick={() => setPaused(!paused)}
        className="absolute bottom-4 right-4 z-20 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
        aria-label={paused ? "Resume slideshow" : "Pause slideshow"}
      >
        {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
      </button>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            aria-current={idx === i ? "true" : undefined}
            className={`min-h-11 min-w-11 grid place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange rounded-full`}
          >
            <span
              className={`block h-2 rounded-full transition-all ${idx === i ? "w-8 bg-white" : "w-2 bg-white/50"}`}
            />
          </button>
        ))}
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
