import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({ meta: [
    { title: "About — The Agriculture Popular Article Magazine" },
    { name: "description", content: "About The Agriculture Popular Article Magazine — mission, vision and history." },
  ] }),
});

const timeline = [
  { y: "2022", t: "Founded as a quarterly with five contributing institutes." },
  { y: "2023", t: "Transitioned to monthly publishing with full peer review." },
  { y: "2024", t: "Indexed in DOAJ and Scopus; readership crosses 100k/month." },
  { y: "2025", t: "International Advisory Committee established across 18 countries." },
  { y: "2026", t: "Launched the Startup Spotlight programme and open-data archive." },
];

function About() {
  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16">
        <div className="eyebrow">About</div>
        <h1 className="font-display text-5xl md:text-7xl mt-4 text-ink leading-[1.02] max-w-4xl">
          Why a magazine for agriculture, and why now.
        </h1>

        <div className="grid md:grid-cols-12 gap-12 mt-16">
          <div className="md:col-span-7 space-y-10 text-foreground/80 leading-[1.8]">
            <p className="drop-cap text-lg">
              The Agriculture Popular Article Magazine exists because the world's most important industry — feeding eight billion people on a warming planet — deserves a publishing platform built for the next century, not the last one. We sit between the academic journal and the trade magazine: rigorous enough for research, accessible enough for the field officer.
            </p>
            <p>
              Every article we publish has been reviewed by at least two specialists in its sub-field. Authors retain copyright. Readers pay nothing. Institutions and members support the work that makes the magazine possible.
            </p>
            <h2 className="font-display text-3xl text-ink mt-12">Mission</h2>
            <p>
              To advance agricultural science by connecting researchers, practitioners and policy-makers through a publication of editorial excellence and scientific integrity.
            </p>
            <h2 className="font-display text-3xl text-ink mt-12">Vision</h2>
            <p>
              A world in which every agricultural breakthrough — from a smallholder's adaptation to a national soil-carbon programme — finds an audience large enough to matter.
            </p>
          </div>
          <aside className="md:col-span-5">
            <div className="md:sticky md:top-28 bg-paper border border-rule p-8">
              <div className="eyebrow">Timeline</div>
              <ol className="mt-6 space-y-6">
                {timeline.map((e) => (
                  <li key={e.y} className="grid grid-cols-[60px_1fr] gap-4">
                    <div className="font-display text-2xl text-primary">{e.y}</div>
                    <div className="text-sm text-foreground/80 leading-relaxed pt-1">{e.t}</div>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
