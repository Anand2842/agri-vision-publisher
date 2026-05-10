import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { editorialBoard, reviewers, type BoardMember } from "@/lib/mock-data";

export const Route = createFileRoute("/editorial-board")({
  component: Board,
  head: () => ({
    meta: [
      { title: "Editorial Board — The Agriculture Popular Article Magazine" },
      {
        name: "description",
        content:
          "The editorial board, content editors and reviewers behind The Agriculture Popular Article Magazine — scientists from leading agricultural universities and research institutes across India and abroad.",
      },
    ],
  }),
});

const initials = (name: string) =>
  name
    .replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Prof\.)\s+/i, "")
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

function PersonCard({ m, large = false }: { m: BoardMember; large?: boolean }) {
  return (
    <article className="group">
      <div
        className={`aspect-[4/5] bg-muted rounded-sm flex items-center justify-center font-display ${
          large ? "text-7xl" : "text-4xl"
        } text-[oklch(var(--navy))]/30 border border-rule overflow-hidden`}
      >
        <span className="tracking-wider">{initials(m.name)}</span>
      </div>
      <h4 className={`font-display ${large ? "text-2xl" : "text-lg"} mt-4 text-[oklch(var(--navy))] leading-tight`}>
        {m.name}
      </h4>
      {m.title && <div className="text-xs uppercase tracking-wide text-[oklch(var(--orange))] mt-1.5 font-medium">{m.title}</div>}
      <div className="text-sm text-foreground/70 mt-1.5 leading-snug">{m.inst}</div>
    </article>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="mt-20 mb-10">
      <div className="text-xs uppercase tracking-[0.2em] text-[oklch(var(--orange))] font-semibold">{eyebrow}</div>
      <h2 className="font-display text-3xl md:text-4xl mt-2 text-[oklch(var(--navy))]">{title}</h2>
      <div className="h-px bg-[oklch(var(--navy))]/20 mt-4" />
    </header>
  );
}

function Board() {
  const groupBy = (role: string) => editorialBoard.filter((m) => m.role === role);
  const founder = groupBy("Founder & Managing Editor")[0];
  const cofounder = groupBy("Co-founder")[0];
  const eic = groupBy("Editor-in-Chief")[0];
  const associate = groupBy("Associate Editor");
  const international = groupBy("International Editor");
  const board = groupBy("Editorial Board");
  const content = groupBy("Content Editor");

  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16">
        {/* Hero */}
        <div className="border-b border-[oklch(var(--navy))]/15 pb-12">
          <div className="text-xs uppercase tracking-[0.2em] text-[oklch(var(--orange))] font-semibold">
            Masthead · Volume IV
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl mt-4 text-[oklch(var(--navy))] leading-[1.05] max-w-4xl">
            The minds behind the magazine.
          </h1>
          <p className="mt-6 text-lg text-foreground/75 max-w-2xl leading-relaxed">
            A peer panel of agronomists, horticulturists, soil scientists and breeders — drawn from
            ICAR institutes, state agricultural universities and partner laboratories across India
            and abroad.
          </p>
        </div>

        {/* Leadership: Founder + Co-founder + EIC */}
        <SectionHeader eyebrow="Leadership" title="Founders & Editor-in-Chief" />
        <div className="grid md:grid-cols-3 gap-10">
          {founder && <PersonCard m={founder} large />}
          {cofounder && <PersonCard m={cofounder} large />}
          {eic && <PersonCard m={eic} large />}
        </div>

        {/* Associate + International */}
        <SectionHeader eyebrow="Editors" title="Associate & International Editors" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {[...associate, ...international].map((m) => (
            <PersonCard key={m.name} m={m} />
          ))}
        </div>

        {/* Editorial Board */}
        <SectionHeader eyebrow={`${board.length} Members`} title="Editorial Board" />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {board.map((m) => (
            <PersonCard key={m.name} m={m} />
          ))}
        </div>

        {/* Content Editors */}
        <SectionHeader eyebrow="Editorial Desk" title="Content Editors" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {content.map((m) => (
            <PersonCard key={m.name} m={m} />
          ))}
        </div>

        {/* Reviewers — text-only, two-column editorial list */}
        <SectionHeader eyebrow={`${reviewers.length} Reviewers`} title="Peer Reviewers" />
        <p className="-mt-6 mb-10 text-foreground/70 max-w-2xl">
          Independent scholars and research scholars who evaluate every submission for scientific
          rigour, originality and clarity before publication.
        </p>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-0 border-t border-[oklch(var(--navy))]/15">
          {reviewers.map((r) => (
            <div
              key={r.name}
              className="py-5 border-b border-[oklch(var(--navy))]/10 flex items-baseline gap-4"
            >
              <div className="font-display text-lg text-[oklch(var(--navy))] flex-1">{r.name}</div>
              <div className="text-sm text-foreground/65 text-right max-w-[60%] leading-snug">
                {r.dept && <span className="block">{r.dept}</span>}
                <span className="italic">{r.inst}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
