import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useSiteContent, fetchSeoMetadata } from "@/hooks/useSiteContent";
import { Mail } from "lucide-react";

export type BoardMember = {
  name: string;
  role?: string;
  title?: string;
  /** Official designation (e.g. "Senior Scientist") — required by ISSN India */
  designation?: string;
  /** Department (e.g. "Agriculture Extension") — required by ISSN India */
  department?: string;
  inst?: string;
  /** Full official postal address — required by ISSN India */
  address?: string;
  email?: string;
  country?: string;
  photo_url?: string;
  /** Institutional profile URL — shown if available */
  profile_url?: string;
};

export const Route = createFileRoute("/editorial-board")({
  component: Board,
  loader: () => fetchSeoMetadata("editorial_board"),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: loaderData.title },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.description },
        ]
      : [{ title: "Editorial Board — The Agriculture Popular Article Magazine" }],
    links: [{ rel: "canonical", href: "https://agriculturemagazine.in/editorial-board" }],
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
  const nameNode = m.profile_url ? (
    <a
      href={m.profile_url}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-[oklch(var(--orange))] transition-colors"
    >
      {m.name}
    </a>
  ) : (
    m.name
  );

  return (
    <article className="group">
      <div
        className={`aspect-[4/5] bg-muted rounded-sm flex items-center justify-center font-display ${
          large ? "text-7xl" : "text-4xl"
        } text-[oklch(var(--navy))]/30 border border-rule overflow-hidden`}
      >
        {m.photo_url ? (
          <img src={m.photo_url} alt={m.name} width={480} height={600} className="h-full w-full object-cover object-top" loading="lazy" />
        ) : (
          <span className="tracking-wider">{initials(m.name)}</span>
        )}
      </div>
      <h4
        className={`font-display ${large ? "text-2xl" : "text-lg"} mt-4 text-[oklch(var(--navy))] leading-tight`}
      >
        {nameNode}
      </h4>
      {m.title && (
        <div className="text-xs uppercase tracking-wide text-[oklch(var(--orange))] mt-1.5 font-medium">
          {m.title}
        </div>
      )}
      {(m.designation || m.department) && (
        <div className="text-xs text-foreground/65 mt-1 leading-snug">
          {m.designation}
          {m.designation && m.department && <span className="mx-1 opacity-40">·</span>}
          {m.department}
        </div>
      )}
      <div className="text-sm text-foreground/70 mt-1.5 leading-snug">{m.inst}</div>
      {m.address && (
        <div className="text-xs text-foreground/45 mt-1 leading-tight">{m.address}</div>
      )}
      {m.country && <div className="text-xs text-foreground/55 mt-1 italic">{m.country}</div>}
      {m.email && (
        <a
          href={`mailto:${m.email}`}
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-[oklch(var(--navy))]/60 hover:text-[oklch(var(--orange))] transition-colors break-all"
        >
          <Mail className="h-3 w-3 shrink-0" />
          {m.email}
        </a>
      )}
    </article>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="mt-20 mb-10">
      <div className="text-xs uppercase tracking-[0.2em] text-[oklch(var(--orange))] font-semibold">
        {eyebrow}
      </div>
      <h2 className="font-display text-3xl md:text-4xl mt-2 text-[oklch(var(--navy))]">{title}</h2>
      <div className="h-px bg-[oklch(var(--navy))]/20 mt-4" />
    </header>
  );
}

function Board() {
  const { get, getJson } = useSiteContent("editorial_board");
  const editorialBoard = getJson<"editors", "items", BoardMember[]>("editors", "items");
  const advisoryCommittee = getJson<"advisory", "items", BoardMember[]>("advisory", "items");
  const reviewers = getJson<"reviewers", "items", (BoardMember & { dept?: string })[]>("reviewers", "items");

  const groupBy = (role: string) => editorialBoard.filter((m) => m.role === role);
  const eic = groupBy("Editor-in-Chief")[0];
  const international = groupBy("International Editor");
  const associate = groupBy("Associate Editor");

  return (
    <>
      <SiteHeader />
      <main id="main-content">
      <main className="container-editorial py-16">
        <div className="border-b border-[oklch(var(--navy))]/15 pb-12">
          <div className="text-xs uppercase tracking-[0.2em] text-[oklch(var(--orange))] font-semibold">
            {get("hero", "eyebrow")}
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl mt-4 text-[oklch(var(--navy))] leading-[1.05] max-w-4xl">
            {get("hero", "tagline")}
          </h1>
          <p className="mt-6 text-lg text-foreground/75 max-w-2xl leading-relaxed">
            {get("hero", "subtitle")}
          </p>
        </div>

        <SectionHeader eyebrow="Leadership" title="Editor-in-Chief" />
        <div className="grid md:grid-cols-3 gap-10">{eic && <PersonCard m={eic} large />}</div>

        <SectionHeader eyebrow={`${international.length} Editors`} title="International Editors" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {international.map((m) => (
            <PersonCard key={m.name} m={m} />
          ))}
        </div>

        <SectionHeader eyebrow={`${associate.length} Editors`} title="Associate Editors" />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {associate.map((m) => (
            <PersonCard key={m.name} m={m} />
          ))}
        </div>

        <SectionHeader
          eyebrow={`${advisoryCommittee.length} Members`}
          title="International Advisory Committee"
        />
        <p className="-mt-6 mb-10 text-foreground/70 max-w-2xl">
          {get("advisory", "description")}
        </p>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-0 border-t border-[oklch(var(--navy))]/15">
          {advisoryCommittee.map((m) => (
            <div
              key={`${m.name}-${m.inst}`}
              className="py-5 border-b border-[oklch(var(--navy))]/10 flex items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="font-display text-lg text-[oklch(var(--navy))] leading-snug">{m.name}</div>
                {m.email && (
                  <a
                    href={`mailto:${m.email}`}
                    className="inline-flex items-center gap-1 mt-1 text-[11px] text-[oklch(var(--navy))]/55 hover:text-[oklch(var(--orange))] transition-colors break-all"
                  >
                    <Mail className="h-3 w-3 shrink-0" />
                    {m.email}
                  </a>
                )}
              </div>
              <div className="text-sm text-foreground/65 text-right max-w-[55%] leading-snug shrink-0">
                <span className="italic">{m.inst}</span>
                {m.country && <span className="block text-foreground/50">{m.country}</span>}
              </div>
            </div>
          ))}
        </div>

        <SectionHeader eyebrow={`${reviewers.length} Reviewers`} title="Peer Reviewers" />
        <p className="-mt-6 mb-10 text-foreground/70 max-w-2xl">
          {get("reviewers", "description")}
        </p>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-0 border-t border-[oklch(var(--navy))]/15">
          {reviewers.map((r, i) => (
            <div
              key={`${r.name}-${i}`}
              className="py-5 border-b border-[oklch(var(--navy))]/10 flex items-start gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="font-display text-lg text-[oklch(var(--navy))] leading-snug">{r.name}</div>
                {r.email && (
                  <a
                    href={`mailto:${r.email}`}
                    className="inline-flex items-center gap-1 mt-1 text-[11px] text-[oklch(var(--navy))]/55 hover:text-[oklch(var(--orange))] transition-colors break-all"
                  >
                    <Mail className="h-3 w-3 shrink-0" />
                    {r.email}
                  </a>
                )}
              </div>
              {r.inst && (
                <div className="text-sm text-foreground/65 text-right max-w-[55%] leading-snug shrink-0">
                  {r.dept && <span className="block">{r.dept}</span>}
                  <span className="italic">{r.inst}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      </main>
      <SiteFooter />
    </>
  );
}
