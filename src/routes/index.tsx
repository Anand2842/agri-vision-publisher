import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { fetchPublishedArticles, type DBArticle } from "@/lib/data";
import { useEffect, useState } from "react";
import { useSiteContent, fetchSeoMetadata } from "@/hooks/useSiteContent";
import { ArticleGridSkeleton } from "@/components/site/Skeletons";

export const Route = createFileRoute("/")({
  component: Home,
  loader: () => fetchSeoMetadata("home"),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: loaderData.title },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.description },
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
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return `25th ${monthNames[monthIndex]}, ${year}`;
}

function Home() {
  const { get } = useSiteContent("home");
  const cmsDeadline = get("banner", "deadline_date");
  const deadlineText = cmsDeadline || getDeadlineText();

  return (
    <>
      <SiteHeader />
      <main>
        <HeroSlider />
        
        {/* Submission Deadline Banner */}
        <section className="bg-primary/5 border-b border-rule py-4">
          <div className="container-editorial flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="inline-flex items-center justify-center bg-orange text-white text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-sm font-sans shrink-0">
                Next Deadline
              </span>
              <p className="text-sm font-sans text-foreground/80 leading-normal">
                Submissions for the upcoming monthly issue close on{" "}
                <span className="text-primary font-bold font-display">{deadlineText}</span>.
              </p>
            </div>
            <div className="flex gap-4 items-center shrink-0">
              <Link to="/submit" className="text-xs uppercase tracking-wider font-semibold text-primary hover:text-orange transition-colors font-sans">
                Submit Online →
              </Link>
              <span className="h-3 w-px bg-rule hidden sm:inline" />
              <Link to="/submission-guidelines" className="text-xs uppercase tracking-wider font-semibold text-foreground/60 hover:text-ink transition-colors font-sans">
                Author Guidelines
              </Link>
            </div>
          </div>
        </section>

        <Intro />
        <RecentBlogs />
        <VisionMission />
        <Testimonials />
        <Readership />
        <Partners />
      </main>
      <SiteFooter />
    </>
  );
}

function HeroSlider() {
  const { get, getJson } = useSiteContent("home");
  const slides = getJson<"hero", "slide_images", { img: string; alt: string }[]>("hero", "slide_images");
  const [i, setI] = useState(0);

  useEffect(() => {
    if (slides.length === 0) return;
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <section className="relative w-full overflow-hidden bg-navy aspect-[16/9]">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/90 to-primary/30 animate-pulse" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-white/60 font-display text-sm uppercase tracking-widest">Loading featured stories…</div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden bg-navy aspect-[16/9]">
      {slides.map((s, idx) => (
        <img
          key={idx}
          src={s.img}
          alt={s.alt}
          width={1920}
          height={1080}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1400ms] ${idx === i ? "opacity-100" : "opacity-0"}`}
          loading={idx === 0 ? "eager" : "lazy"}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
      ))}
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-x-0 bottom-12 md:bottom-16 flex flex-col items-center justify-end px-4">
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        <h1 className="relative font-display text-white text-xl sm:text-2xl md:text-4xl text-center leading-tight drop-shadow-lg">
          The Agriculture Popular Article Magazine
        </h1>
        <p className="relative mt-2 text-white/80 text-xs sm:text-sm md:text-base text-center font-sans max-w-2xl drop-shadow">
          Bridging research and practice in agriculture through peer-reviewed popular articles
        </p>
      </div>
      <button
        onClick={() => setI((p) => (p - 1 + slides.length) % slides.length)}
        aria-label="Previous slide"
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 h-10 w-10 grid place-items-center bg-white/15 hover:bg-white/30 text-white backdrop-blur"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => setI((p) => (p + 1) % slides.length)}
        aria-label="Next slide"
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 h-10 w-10 grid place-items-center bg-white/15 hover:bg-white/30 text-white backdrop-blur"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all ${idx === i ? "w-8 bg-white" : "w-2 bg-white/50"}`}
          />
        ))}
      </div>
    </section>
  );
}

function Intro() {
  const { get } = useSiteContent("home");
  return (
    <section className="container-editorial py-16 md:py-24">
      <div className="hr-divider mb-8">
        <h2 className="section-title text-2xl md:text-4xl text-center">
          {get("intro", "heading")}
        </h2>
      </div>
      <p className="max-w-4xl mx-auto text-center text-foreground/75 leading-[1.9] text-[0.97rem]">
        {get("intro", "body")}
      </p>

      {/* ISSN Required Journal Particulars Table */}
      <div className="max-w-3xl mx-auto mt-12 bg-paper border border-rule overflow-hidden">
        <div className="bg-primary/5 py-3 border-b border-rule px-6">
          <h3 className="font-display text-lg text-primary uppercase tracking-wider text-center">
            Journal Particulars
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left font-sans">
            <tbody className="divide-y divide-rule/50">
              <tr className="hover:bg-primary/5 transition-colors">
                <th className="py-3 px-6 font-semibold text-ink w-1/3">Title</th>
                <td className="py-3 px-6 text-foreground/80">The Agriculture Popular Article Magazine</td>
              </tr>
              <tr className="hover:bg-primary/5 transition-colors">
                <th className="py-3 px-6 font-semibold text-ink">Frequency</th>
                <td className="py-3 px-6 text-foreground/80">Monthly</td>
              </tr>
              <tr className="hover:bg-primary/5 transition-colors">
                <th className="py-3 px-6 font-semibold text-ink">ISSN</th>
                <td className="py-3 px-6 text-foreground/80">Applied for</td>
              </tr>
              <tr className="hover:bg-primary/5 transition-colors">
                <th className="py-3 px-6 font-semibold text-ink">Publisher name</th>
                <td className="py-3 px-6 text-foreground/80">Ram Mangalam Agri – Rural Development Foundation</td>
              </tr>
              <tr className="hover:bg-primary/5 transition-colors">
                <th className="py-3 px-6 font-semibold text-ink">Publisher address</th>
                <td className="py-3 px-6 text-foreground/80">ICAR–RRS–CAZRI, Jaisalmer 345001, Rajasthan, India</td>
              </tr>
              <tr className="hover:bg-primary/5 transition-colors">
                <th className="py-3 px-6 font-semibold text-ink">Starting Year</th>
                <td className="py-3 px-6 text-foreground/80">2026</td>
              </tr>
              <tr className="hover:bg-primary/5 transition-colors">
                <th className="py-3 px-6 font-semibold text-ink">Subject</th>
                <td className="py-3 px-6 text-foreground/80">Agriculture and Allied Sciences</td>
              </tr>
              <tr className="hover:bg-primary/5 transition-colors">
                <th className="py-3 px-6 font-semibold text-ink">Language</th>
                <td className="py-3 px-6 text-foreground/80">English</td>
              </tr>
              <tr className="hover:bg-primary/5 transition-colors">
                <th className="py-3 px-6 font-semibold text-ink">Publication Format</th>
                <td className="py-3 px-6 text-foreground/80">Online</td>
              </tr>
              <tr className="hover:bg-primary/5 transition-colors">
                <th className="py-3 px-6 font-semibold text-ink">Email Id</th>
                <td className="py-3 px-6 text-foreground/80">
                  <a href="mailto:dkdkdangi@gmail.com" className="text-primary hover:underline">
                    dkdkdangi@gmail.com
                  </a>
                </td>
              </tr>
              <tr className="hover:bg-primary/5 transition-colors">
                <th className="py-3 px-6 font-semibold text-ink">Mobile No.</th>
                <td className="py-3 px-6 text-foreground/80">+91 9509164410</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10 flex justify-center">
        <Link to="/about" className="btn-orange">
          Know more
        </Link>
      </div>
    </section>
  );
}

function RecentBlogs() {
  const [articles, setArticles] = useState<DBArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
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
  }, []);

  return (
    <section className="bg-paper border-y border-rule py-16 md:py-24">
      <div className="container-editorial">
        <div className="hr-divider mb-12">
          <h2 className="section-title text-2xl md:text-4xl text-center">Recent Blogs</h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground text-sm">
            Loading recent articles...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-muted-foreground text-sm border border-dashed border-rule bg-white max-w-lg mx-auto">
            Articles are temporarily unavailable. Please try again later.
          </div>
        ) : articles.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-sm border border-dashed border-rule bg-white max-w-lg mx-auto">
            No published articles found.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {articles.slice(0, 4).map((a) => (
              <article key={a.slug} className="bg-white border border-rule hover-lift flex flex-col">
                <Link
                  to="/articles/$slug"
                  params={{ slug: a.slug }}
                  className="block aspect-video overflow-hidden"
                >
                  <img
                    src={a.cover || "/placeholder.svg"}
                    alt={a.title}
                    className="w-full h-full object-contain bg-stone-50/50 p-1 border-b border-rule hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    onError={(e) => {
                      const t = e.currentTarget as HTMLImageElement;
                      if (!t.src.endsWith("/placeholder.svg")) t.src = "/placeholder.svg";
                    }}
                  />

                </Link>
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-xs text-orange font-semibold uppercase tracking-wider">{a.category}</div>
                  <h3 className="font-display text-2xl md:text-[28px] mt-2 leading-tight text-navy">
                    <Link
                      to="/articles/$slug"
                      params={{ slug: a.slug }}
                      className="hover:text-orange transition-colors"
                    >
                      {a.title}
                    </Link>
                  </h3>
                  <div className="mt-2 text-xs text-foreground/60 font-sans leading-relaxed">
                    <span className="font-medium text-foreground/80">{a.author}</span>
                    <br />
                    <span className="inline-flex items-center gap-1 mt-0.5">
                      Vol. {a.volume} · Issue {a.issueNumber}
                      {(a.pageStart || a.pageEnd) && (
                        <span>· pp. {a.pageStart ?? "—"}{a.pageEnd ? `–${a.pageEnd}` : ""}</span>
                      )}
                    </span>
                  </div>
                  <p className="mt-3 text-[15px] text-foreground/70 leading-relaxed line-clamp-3 flex-1">
                    {a.abstract}
                  </p>
                  <Link
                    to="/articles/$slug"
                    params={{ slug: a.slug }}
                    className="mt-5 inline-flex items-center text-xs uppercase font-condensed tracking-widest text-orange hover:text-navy"
                  >
                    Read More →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function VisionMission() {
  const { get } = useSiteContent("home");
  return (
    <section className="container-editorial py-16 md:py-24">
      <div className="hr-divider mb-10">
        <h2 className="section-title text-2xl md:text-4xl text-center">{get("vision_mission", "heading")}</h2>
      </div>
      <p className="max-w-4xl mx-auto text-center text-foreground/75 leading-[1.9] text-[0.97rem]">
        {get("vision_mission", "body")}
      </p>
    </section>
  );
}

function Testimonials() {
  const { get, getJson } = useSiteContent("home");
  const testimonials = getJson<"testimonials", "items", { quote: string; name: string; role: string }[]>("testimonials", "items");
  return (
    <section className="bg-navy text-white py-16 md:py-24">
      <div className="container-editorial">
        <div className="hr-divider mb-14">
          <h2 className="section-title text-2xl md:text-4xl text-center text-white">
            {get("testimonials", "heading")}
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          {testimonials.map((t) => (
            <blockquote
              key={t.name}
              className="relative bg-white/[0.04] border border-white/10 p-8 md:p-10"
            >
              <Quote className="absolute -top-4 left-6 h-10 w-10 text-orange bg-navy px-1.5" />
              <p className="text-white/85 leading-relaxed text-[0.98rem] italic">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-orange/30 grid place-items-center font-display text-orange">
                  {t.name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <div className="font-display text-lg">{t.name}</div>
                  <div className="text-xs text-white/60 uppercase tracking-widest font-condensed">
                    {t.role}
                  </div>
                </div>
              </div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function Readership() {
  const { get, getJson } = useSiteContent("home");
  const readership = getJson<"readership", "items", { label: string; value: number }[]>("readership", "items");
  return (
    <section className="container-editorial py-16 md:py-24">
      <div className="hr-divider mb-14">
        <h2 className="section-title text-2xl md:text-4xl text-center">{get("readership", "heading")}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
        {readership.map((s) => (
          <Counter key={s.label} value={s.value} label={s.label} />
        ))}
      </div>
    </section>
  );
}

function Counter({ value, label }: { value: number; label: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1500;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.floor(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return (
    <div>
      <div className="font-display font-bold text-4xl md:text-5xl text-orange tabular-nums">
        {n.toLocaleString()}+
      </div>
      <div className="mt-2 text-xs uppercase tracking-widest font-condensed text-navy">{label}</div>
    </div>
  );
}

function Partners() {
  const { get, getJson } = useSiteContent("home");
  const partners = getJson<"partners", "items", { name: string; logo_url?: string }[]>("partners", "items");
  return (
    <section className="bg-paper border-t border-rule py-16">
      <div className="container-editorial">
        <div className="hr-divider mb-12">
          <h2 className="section-title text-xl md:text-3xl text-center">{get("partners", "heading")}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 items-center">
          {partners.map((p, idx) => (
            <div
              key={p.name + "-" + idx}
              className="aspect-square bg-white border border-rule grid place-items-center text-center p-2 hover-lift overflow-hidden"
            >
              {p.logo_url ? (
                <img src={p.logo_url} alt={p.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="font-display text-navy text-sm md:text-base leading-tight font-semibold">{p.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
