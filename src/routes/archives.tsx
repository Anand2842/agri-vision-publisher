import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { issues, cover } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/archives")({
  component: Archives,
  head: () => ({ meta: [
    { title: "Archives — Agripop" },
    { name: "description", content: "Browse the full archive of Agripop magazine issues." },
  ] }),
});

function Archives() {
  const [year, setYear] = useState<string>("all");
  const years = ["all", "2026", "2025"];
  const filtered = issues.filter((i) => year === "all" || i.date.endsWith(year));
  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16">
        <div className="eyebrow">Archives</div>
        <h1 className="font-display text-5xl md:text-6xl mt-3 text-ink">Every Issue, Since 2022</h1>
        <p className="mt-5 max-w-2xl text-foreground/70">Forty-eight issues of original agricultural research and reporting from across the world.</p>

        <div className="mt-10 flex gap-2">
          {years.map((y) => (
            <button key={y} onClick={() => setYear(y)} className={`text-xs px-4 py-2 rounded-sm border ${year === y ? "bg-foreground text-background border-foreground" : "border-rule hover:border-primary"}`}>
              {y === "all" ? "All Years" : y}
            </button>
          ))}
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {filtered.map((i) => (
            <div key={`${i.volume}-${i.number}`} className="hover-lift">
              <div className="bg-muted aspect-[3/4] overflow-hidden">
                <img src={cover} alt={i.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="eyebrow mt-5">Vol {i.volume} · Issue {i.number} · {i.date}</div>
              <h3 className="font-display text-2xl mt-2">{i.title}</h3>
              <p className="text-sm text-foreground/70 mt-3 leading-relaxed">{i.desc}</p>
              <Link to="/current-issue" className="text-xs text-primary mt-4 inline-block hover:underline">Open issue →</Link>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
