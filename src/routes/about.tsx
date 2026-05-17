import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About — The Agriculture Popular Article Magazine" },
      {
        name: "description",
        content:
          "About The Agriculture Popular Article Magazine — a peer-reviewed monthly published by Ram Mangalam Agri – Rural Development Foundation, edited by Dr. Dileep Kumar.",
      },
    ],
  }),
});

const particulars: [string, string][] = [
  ["Title", "The Agriculture Popular Article Magazine"],
  ["Frequency", "Monthly"],
  ["Subject", "Agriculture"],
  ["Language", "English / Hindi"],
  ["Format", "Online"],
  ["Starting Year", "2026"],
  ["Publisher", "Ram Mangalam Agri – Rural Development Foundation (RADF)"],
  ["Chief Editor", "Dr. Dileep Kumar"],
  ["Address", "ICAR–RRS–CAZRI, Jaisalmer 345001, Rajasthan, India"],
  ["Mobile", "+91 95091 64410"],
  ["Email", "dkdkdangi@gmail.com"],
];

const mission = [
  "Disseminate practical, science-based agricultural knowledge to farmers, extension workers, students and policy-makers.",
  "Highlight indigenous innovations, traditional wisdom and locally adapted practices alongside contemporary research.",
  "Bridge the gap between scientific research and on-farm application through accessible popular articles.",
  "Support young scientists, research scholars and field practitioners with a credible publishing platform.",
  "Encourage interdisciplinary work across agronomy, horticulture, animal sciences, extension and allied fields.",
  "Strengthen India's rural development ecosystem by amplifying voices from KVKs, ICAR institutes and state universities.",
];

function About() {
  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16">
        <div className="eyebrow">About</div>
        <h1 className="font-display text-5xl md:text-7xl mt-4 text-ink leading-[1.02] max-w-4xl">
          A peer-reviewed magazine for India's agricultural community.
        </h1>

        <div className="grid md:grid-cols-12 gap-12 mt-16">
          <div className="md:col-span-7 space-y-8 text-foreground/85 leading-[1.8]">
            <p className="drop-cap text-lg">
              The Agriculture Popular Article Magazine is a monthly, online, peer-reviewed
              publication dedicated to advancing Indian agriculture through knowledge,
              innovation, sustainability and community. It is published by the Ram Mangalam Agri –
              Rural Development Foundation (RADF) and edited by Dr. Dileep Kumar, Senior Scientist
              (Agriculture Extension) at ICAR–RRS–CAZRI, Jaisalmer.
            </p>
            <p>
              We sit between the academic journal and the trade magazine: rigorous enough for
              research, accessible enough for the field officer, the KVK scientist and the
              progressive farmer. Every article is reviewed by qualified specialists before it
              reaches our readers.
            </p>
            <p>
              Our pages cover agronomy, horticulture, soil and water management, animal sciences,
              agri-business, extension and allied disciplines — with a particular focus on the
              arid and semi-arid systems of western India and on the smallholder economies of
              South Asia.
            </p>
            <p>
              The magazine is open-access. Authors retain copyright. Readers pay nothing.
              Members and institutional partners support the work that makes the magazine
              possible.
            </p>

            <h2 className="font-display text-3xl text-ink pt-6">Vision</h2>
            <p>
              A connected community of researchers, extension workers and farmers in which every
              agricultural breakthrough — from a smallholder's adaptation to a national
              soil-carbon programme — finds an audience large enough to matter.
            </p>

            <h2 className="font-display text-3xl text-ink pt-6">Mission</h2>
            <ul className="space-y-3 list-none pl-0">
              {mission.map((m, i) => (
                <li key={i} className="flex gap-4">
                  <span className="font-display text-orange shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="md:col-span-5">
            <div className="md:sticky md:top-28 bg-paper border border-rule p-8">
              <div className="eyebrow">Journal Particulars</div>
              <dl className="mt-6 divide-y divide-rule">
                {particulars.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[110px_1fr] gap-4 py-3">
                    <dt className="text-xs uppercase tracking-wider text-foreground/60 font-semibold pt-0.5">{k}</dt>
                    <dd className="text-sm text-ink leading-relaxed">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
