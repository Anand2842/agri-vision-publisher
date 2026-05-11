import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import heroTractor from "@/assets/hero-tractor.jpg";
import heroPaddy from "@/assets/hero-paddy.jpg";
import heroWheat from "@/assets/hero-wheat.jpg";
import { stats } from "@/lib/mock-data";
import { fetchPublishedArticles, type DBArticle } from "@/lib/data";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "The Agriculture Magazine — Peer-Reviewed Open Access Monthly" },
      { name: "description", content: "A peer-reviewed, open access monthly magazine on agriculture, allied sciences and the environment. Innovations, research and start-up stories." },
    ],
  }),
});

function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSlider />
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

const slides = [
  { img: heroTractor, alt: "Tractor plowing a field" },
  { img: heroPaddy, alt: "Terraced rice paddies" },
  { img: heroWheat, alt: "Golden wheat at sunset" },
];

function HeroSlider() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="relative h-[68vh] min-h-[480px] max-h-[760px] w-full overflow-hidden bg-navy">
      {slides.map((s, idx) => (
        <img
          key={idx}
          src={s.img}
          alt={s.alt}
          width={1920}
          height={1080}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1400ms] ${idx === i ? "opacity-100" : "opacity-0"}`}
          loading={idx === 0 ? "eager" : "lazy"}
        />
      ))}
      <div className="absolute inset-0 bg-black/35" />
      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        <h1 className="font-script text-white text-5xl sm:text-6xl md:text-8xl drop-shadow-lg">
          Welcome to The Agriculture Magazine
        </h1>
        <Link to="/about" className="btn-outline-white mt-10">
          About Us
        </Link>
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
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
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
  return (
    <section className="container-editorial py-16 md:py-24">
      <div className="hr-divider mb-8">
        <h2 className="section-title text-2xl md:text-4xl text-center">The Agriculture Magazine</h2>
      </div>
      <p className="max-w-4xl mx-auto text-center text-foreground/75 leading-[1.9] text-[0.97rem]">
        The Agriculture Magazine is a peer-reviewed, open access monthly magazine, initiated for the
        purpose of providing information about novel innovations and techniques developed in
        agriculture and its allied sectors. Other than agriculture, it also focuses on the environmental
        aspects as it is of greater concern in the present scenario and needs to be addressed by
        agriculturists. This magazine gives a platform to researchers, scientists, students, innovative
        and progressive farmers and any other members of the scientific community to share their
        innovative ideas and to spread awareness in the agriculture sector by publishing articles
        addressing current and future needs. The Agriculture Magazine also aims at providing a
        platform to different agri and agri-tech start-ups to showcase their success stories, business
        ideas and plans, thereby enticing a sense of innovativeness among brilliant minds throughout
        the world.
      </p>
      <div className="mt-10 flex justify-center">
        <Link to="/about" className="btn-orange">Know more</Link>
      </div>
    </section>
  );
}

function RecentBlogs() {
  const [articles, setArticles] = useState<DBArticle[]>([]);
  useEffect(() => {
    fetchPublishedArticles(4).then(setArticles);
  }, []);
  return (
    <section className="bg-paper border-y border-rule py-16 md:py-24">
      <div className="container-editorial">
        <div className="hr-divider mb-12">
          <h2 className="section-title text-2xl md:text-4xl text-center">Recent Blogs</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {articles.slice(0, 4).map((a) => (
            <article key={a.slug} className="bg-white border border-rule hover-lift flex flex-col">
              <Link to="/articles/$slug" params={{ slug: a.slug }} className="block aspect-[4/3] overflow-hidden">
                <img src={a.cover} alt={a.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
              </Link>
              <div className="p-5 flex flex-col flex-1">
                <div className="eyebrow text-orange">{a.category}</div>
                <h3 className="font-display text-lg md:text-xl mt-2 leading-snug text-navy">
                  <Link to="/articles/$slug" params={{ slug: a.slug }} className="hover:text-orange transition-colors">
                    {a.title}
                  </Link>
                </h3>
                <p className="mt-3 text-sm text-foreground/70 leading-relaxed line-clamp-3 flex-1">{a.abstract}</p>
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
      </div>
    </section>
  );
}

function VisionMission() {
  return (
    <section className="container-editorial py-16 md:py-24">
      <div className="hr-divider mb-10">
        <h2 className="section-title text-2xl md:text-4xl text-center">Vision and Mission</h2>
      </div>
      <p className="max-w-4xl mx-auto text-center text-foreground/75 leading-[1.9] text-[0.97rem]">
        Informative, innovative and content-rich communication of information is most needed and is
        of great priority. A broad spectrum of advancement of technologies and other possibilities in
        the farming sector has become very important; consequently, The Agriculture Magazine helps
        in disseminating such information to the farming community as well as other agencies,
        institutes and organisations to provide them with the latest developments in the field of
        agriculture and environmental studies. The magazine is appealing due to its unique way of
        presenting information, which further helps in providing a platform for comprehensive data
        sharing regarding different aspects of agriculture including its policies, technologies,
        economics and other scientific advances.
      </p>
    </section>
  );
}

const testimonials = [
  {
    quote:
      "A genuinely indispensable monthly read — the kind of magazine that bridges the lab and the field with rare clarity. I look forward to every issue.",
    name: "Andy Guscott",
    role: "Researcher, IRRI",
  },
  {
    quote:
      "The Agriculture Magazine has become required reading in our extension office. Practical, peer-reviewed, beautifully produced.",
    name: "Kirstin W. Everton",
    role: "Extension Officer, Cornell",
  },
];

function Testimonials() {
  return (
    <section className="bg-navy text-white py-16 md:py-24">
      <div className="container-editorial">
        <div className="hr-divider mb-14">
          <h2 className="section-title text-2xl md:text-4xl text-center text-white">Our Testimonials</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-10">
          {testimonials.map((t) => (
            <blockquote key={t.name} className="relative bg-white/[0.04] border border-white/10 p-8 md:p-10">
              <Quote className="absolute -top-4 left-6 h-10 w-10 text-orange bg-navy px-1.5" />
              <p className="text-white/85 leading-relaxed text-[0.98rem] italic">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-orange/30 grid place-items-center font-display text-orange">
                  {t.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="font-display text-lg">{t.name}</div>
                  <div className="text-xs text-white/60 uppercase tracking-widest font-condensed">{t.role}</div>
                </div>
              </div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

const readership = [
  { label: "Readers", value: 50000 },
  { label: "Farmers", value: 30000 },
  { label: "Academicians", value: 55000 },
  { label: "Faculty", value: 3700 },
  { label: "International Visitors", value: 2500 },
];

function Readership() {
  return (
    <section className="container-editorial py-16 md:py-24">
      <div className="hr-divider mb-14">
        <h2 className="section-title text-2xl md:text-4xl text-center">Readership</h2>
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

const partners = [
  "AgriNext", "FAO", "ICAR", "CGIAR", "Wageningen UR", "Indus Agritech", "EMBRAPA", "TNAU",
];

function Partners() {
  void stats;
  return (
    <section className="bg-paper border-t border-rule py-16">
      <div className="container-editorial">
        <div className="hr-divider mb-12">
          <h2 className="section-title text-xl md:text-3xl text-center">Our Partners</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 items-center">
          {partners.map((p) => (
            <div
              key={p}
              className="aspect-square bg-white border border-rule grid place-items-center text-center px-3 hover-lift"
            >
              <span className="font-display text-navy text-sm md:text-base leading-tight">{p}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
