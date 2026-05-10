import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ArrowRight, BookOpen, Download, Eye, Clock } from "lucide-react";
import heroImg from "@/assets/hero-fields.jpg";
import { articles, cover, editorialBoard, startups, stats } from "@/lib/mock-data";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Agripop — Advancing Agriculture Through Knowledge" },
      { name: "description", content: "Peer-reviewed monthly magazine of agricultural science, innovation and research from around the world." },
    ],
  }),
});

function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <FeaturedIssue />
        <Trending />
        <ResearchHighlight />
        <StartupSpotlight />
        <BoardSection />
        <GlobalImpact />
        <Newsletter />
      </main>
      <SiteFooter />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-rule">
      <img
        src={heroImg}
        alt="Aerial view of cultivated fields at golden hour"
        className="absolute inset-0 w-full h-full object-cover opacity-25"
        width={1920}
        height={1280}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-paper/40 via-paper/85 to-paper" />
      <div className="container-editorial relative pt-20 pb-28 md:pt-28 md:pb-36 grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-7">
          <div className="eyebrow flex items-center gap-3">
            <span className="h-px w-8 bg-foreground/40" /> Volume 4 · Issue 5 · May 2026
          </div>
          <h1 className="font-display text-[2.6rem] sm:text-6xl md:text-7xl leading-[1.02] mt-6 text-ink">
            Advancing Agriculture<br />
            Through <em className="text-sage not-italic">Knowledge</em>,<br />
            Innovation &amp; Research.
          </h1>
          <p className="mt-8 max-w-xl text-base md:text-lg text-foreground/75 leading-relaxed">
            A global monthly peer-reviewed magazine for agriculture and allied sciences —
            connecting researchers, practitioners and policy-makers across 64 countries.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/current-issue" className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-sm text-sm hover:bg-primary/90 transition">
              Read Current Issue
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/submit" className="inline-flex items-center gap-2 border border-foreground/30 px-6 py-3.5 rounded-sm text-sm hover:border-primary hover:text-primary transition">
              Submit Your Article
            </Link>
          </div>
        </div>
        <div className="md:col-span-5 flex justify-center md:justify-end">
          <div className="relative animate-[float_6s_ease-in-out_infinite]">
            <div className="absolute -inset-8 bg-gradient-to-tr from-sage/20 via-transparent to-ochre/20 blur-3xl" />
            <img
              src={cover}
              alt="Current issue cover"
              width={420}
              height={560}
              className="relative w-[260px] md:w-[340px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.4)] rounded-sm rotate-[-2deg]"
            />
          </div>
        </div>
      </div>
      <style>{`@keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }`}</style>
    </section>
  );
}

function FeaturedIssue() {
  return (
    <section className="container-editorial py-24">
      <SectionHead eyebrow="Featured Issue" title="The May Edition" />
      <div className="mt-12 grid md:grid-cols-12 gap-10 items-center bg-paper border border-rule p-8 md:p-12">
        <img src={cover} alt="Issue cover" width={400} height={530} className="md:col-span-4 w-full max-w-[300px] mx-auto shadow-xl rounded-sm" loading="lazy" />
        <div className="md:col-span-8">
          <div className="eyebrow">Volume 4 · Issue 5 · May 2026</div>
          <h3 className="font-display text-3xl md:text-4xl mt-4 text-ink">Adapting to a Warming Climate</h3>
          <p className="mt-5 text-foreground/75 leading-relaxed max-w-2xl">
            Twelve original studies from researchers in fourteen countries: heat-tolerant cereal breeding,
            agroforestry on the Sahel margins, water-smart paddy systems, and a cover essay from the FAO
            on what 2030 yields will demand of us.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/current-issue" className="inline-flex items-center gap-2 text-sm bg-foreground text-background px-5 py-3 rounded-sm hover:bg-foreground/85">
              <BookOpen className="h-4 w-4" /> Read Articles
            </Link>
            <button className="inline-flex items-center gap-2 text-sm border border-foreground/30 px-5 py-3 rounded-sm hover:border-primary hover:text-primary">
              <Download className="h-4 w-4" /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Trending() {
  return (
    <section className="container-editorial py-24 border-t border-rule">
      <div className="flex items-end justify-between">
        <SectionHead eyebrow="Trending" title="Most Read This Month" />
        <Link to="/archives" className="hidden md:inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-primary">
          All articles <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
        {articles.map((a) => (
          <Link
            key={a.slug}
            to="/articles/$slug"
            params={{ slug: a.slug }}
            className="group block hover-lift"
          >
            <div className="overflow-hidden bg-muted aspect-[4/3]">
              <img src={a.cover} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
            </div>
            <div className="eyebrow mt-5">{a.category}</div>
            <h3 className="font-display text-xl md:text-2xl mt-2 leading-snug text-ink group-hover:text-primary transition-colors">
              {a.title}
            </h3>
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span>{a.author}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {a.readTime} min</span>
              <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {a.views}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ResearchHighlight() {
  const a = articles[2];
  return (
    <section className="bg-ink text-background mt-24">
      <div className="container-editorial py-24 grid md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-5">
          <img src={a.cover} alt={a.title} className="w-full aspect-[4/5] object-cover rounded-sm" loading="lazy" />
        </div>
        <div className="md:col-span-7">
          <div className="eyebrow text-background/60">Research Highlight</div>
          <h3 className="font-display text-3xl md:text-5xl mt-5 leading-[1.05]">{a.title}</h3>
          <p className="mt-6 text-background/75 leading-relaxed max-w-2xl">{a.abstract}</p>
          <div className="mt-8 flex items-center gap-6 text-xs text-background/60">
            <span>{a.author} · {a.affiliation}</span>
          </div>
          <Link to="/articles/$slug" params={{ slug: a.slug }} className="mt-8 inline-flex items-center gap-2 text-sm border border-background/40 px-5 py-3 rounded-sm hover:bg-background hover:text-ink transition">
            Read the full study <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function StartupSpotlight() {
  return (
    <section className="container-editorial py-24">
      <SectionHead eyebrow="Startup Spotlight" title="Innovators We're Watching" />
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {startups.map((s) => (
          <div key={s.name} className="border border-rule bg-paper p-7 hover-lift">
            <div className="h-10 w-10 rounded-sm bg-primary/10 flex items-center justify-center font-display text-primary text-lg">
              {s.name.charAt(0)}
            </div>
            <h4 className="font-display text-xl mt-5">{s.name}</h4>
            <div className="text-xs text-muted-foreground mt-1">Founded by {s.founder}</div>
            <p className="text-sm text-foreground/75 mt-4 leading-relaxed">{s.innovation}</p>
            <Link to="/startup-spotlight" className="text-xs text-primary mt-5 inline-flex items-center gap-1 hover:underline">
              Visit profile <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function BoardSection() {
  return (
    <section className="container-editorial py-24 border-t border-rule">
      <SectionHead eyebrow="Editorial Board" title="A Globally Distinguished Panel" />
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {editorialBoard.slice(0, 8).map((m) => (
          <div key={m.name}>
            <div className="aspect-square bg-muted rounded-sm flex items-center justify-center font-display text-4xl text-primary/40">
              {m.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </div>
            <h4 className="font-display text-lg mt-4">{m.name}</h4>
            <div className="text-xs text-muted-foreground">{m.role}</div>
            <div className="text-xs mt-1">{m.inst} · {m.country}</div>
          </div>
        ))}
      </div>
      <div className="mt-10">
        <Link to="/editorial-board" className="text-sm text-primary hover:underline inline-flex items-center gap-2">
          View full editorial board <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function GlobalImpact() {
  return (
    <section className="bg-paper border-y border-rule">
      <div className="container-editorial py-24">
        <SectionHead eyebrow="Global Impact" title="Numbers That Speak" />
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-10 text-center md:text-left">
          {stats.map((s) => (
            <Counter key={s.label} value={s.value} label={s.label} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Counter({ value, label }: { value: number; label: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.floor(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return (
    <div>
      <div className="font-display text-5xl md:text-6xl text-ink tabular-nums">{n.toLocaleString()}</div>
      <div className="eyebrow mt-3">{label}</div>
    </div>
  );
}

function Newsletter() {
  return (
    <section className="container-editorial py-28">
      <div className="max-w-3xl mx-auto text-center">
        <div className="eyebrow">Newsletter</div>
        <h2 className="font-display text-3xl md:text-5xl mt-4 text-ink leading-tight">
          Stay updated with the latest agricultural research.
        </h2>
        <p className="mt-5 text-foreground/70">A monthly digest of new studies, editor's picks and field reports — straight to your inbox.</p>
        <form className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input type="email" required placeholder="your@email.com" className="flex-1 bg-paper border border-rule px-4 py-3 rounded-sm text-sm focus:outline-none focus:border-primary" />
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-sm text-sm hover:bg-primary/90">Subscribe</button>
        </form>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="font-display text-3xl md:text-5xl mt-3 text-ink leading-tight max-w-2xl">{title}</h2>
    </div>
  );
}
