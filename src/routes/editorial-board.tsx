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
  mobile?: string;
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
      className="hover:text-[var(--orange)] transition-colors"
    >
      {m.name}
    </a>
  ) : (
    m.name
  );

  return (
    <article
      className={
        large
          ? "group flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left"
          : "group flex flex-col items-center text-center h-full"
      }
    >
      <div
        className={`aspect-square bg-muted rounded-full flex items-center justify-center font-display ${
          large ? "text-4xl w-36 sm:w-40" : "text-2xl w-[120px]"
        } shrink-0 text-[var(--navy)]/30 border border-rule overflow-hidden`}
      >
        {m.photo_url ? (
          <img
            src={m.photo_url}
            alt={m.name}
            width={480}
            height={600}
            className="h-full w-full object-cover object-top"
            loading="lazy"
          />
        ) : (
          <span className="tracking-wider">{initials(m.name)}</span>
        )}
      </div>
      <div className={large ? "min-w-0 sm:pt-2" : "min-w-0"}>
      <h4
        className={`font-display ${large ? "text-xl sm:mt-0" : "text-lg"} mt-4 text-[var(--navy)] leading-tight`}
      >
        {nameNode}
      </h4>
      {m.title && (
        <div className="text-xs uppercase tracking-wide text-[var(--orange)] mt-1.5 font-medium">
          {m.title}
        </div>
      )}
      {(m.designation || m.department) && (
        <div className="text-xs text-muted-foreground mt-1 leading-snug">
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
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-[var(--navy)]/60 hover:text-[var(--orange)] transition-colors break-all"
        >
          <Mail className="h-3 w-3 shrink-0" />
          {m.email}
        </a>
      )}
      </div>
    </article>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="mt-12 mb-6">
      <div className="text-xs uppercase tracking-[0.2em] text-[var(--orange)] font-semibold">
        {eyebrow}
      </div>
      <h2 className="font-display text-xl md:text-2xl mt-2 text-[var(--navy)]">{title}</h2>
      <div className="h-px bg-[var(--navy)]/20 mt-4" />
    </header>
  );
}

function DirectoryEntry({ member }: { member: BoardMember & { dept?: string } }) {
  const department = member.department || member.dept;
  return (
    <article className="py-5 border-b border-[var(--navy)]/10 min-w-0">
      <div className="font-display text-lg text-[var(--navy)] leading-snug">
        {member.profile_url ? <a href={member.profile_url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--orange)] transition-colors">{member.name}</a> : member.name}
      </div>
      {(member.designation || department) && <div className="mt-1 text-xs text-foreground/65">{[member.designation, department].filter(Boolean).join(" · ")}</div>}
      {(member.inst || member.country) && (
        <div className="mt-1 text-sm text-muted-foreground leading-snug">
          {[member.inst, member.country].filter(Boolean).join(", ")}
        </div>
      )}
      {member.address && <div className="mt-1 text-xs text-foreground/55">{member.address}</div>}
      {(member.email || member.mobile) && (
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--navy)]/70">
          {member.email && <a href={`mailto:${member.email}`} className="inline-flex items-center gap-1.5 hover:text-[var(--orange)] break-all"><Mail className="h-3 w-3 shrink-0" />{member.email}</a>}
          {member.mobile && <a href={`tel:${member.mobile.replace(/\s/g, "")}`} className="hover:text-[var(--orange)]">Mobile: {member.mobile}</a>}
        </div>
      )}
    </article>
  );
}

function Board() {
  const { get, getJson } = useSiteContent("editorial_board");
  const editorialBoard = getJson<"editors", "items", BoardMember[]>("editors", "items");
  const advisoryCommittee = getJson<"advisory", "items", BoardMember[]>("advisory", "items");
  const reviewers = getJson<"reviewers", "items", (BoardMember & { dept?: string })[]>(
    "reviewers",
    "items",
  );

  const groupBy = (role: string) => editorialBoard.filter((m) => m.role === role);
  const eic = groupBy("Editor-in-Chief")[0];
  const members = editorialBoard.filter((m) => m.role !== "Editor-in-Chief");

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="container-editorial py-16">
        <div className="border-b border-[var(--navy)]/15 pb-12">
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--orange)] font-semibold">
            {get("hero", "eyebrow")}
          </div>
          <h1 className="font-display text-xl md:text-2xl mt-4 text-[var(--navy)] leading-[1.05] max-w-4xl">
            {get("hero", "tagline")}
          </h1>
          <p className="mt-6 text-lg text-foreground/75 max-w-2xl leading-relaxed">
            {get("hero", "subtitle")}
          </p>
        </div>

        <SectionHeader eyebrow="Leadership" title="Editor-in-Chief" />
        <div className="grid md:grid-cols-1 max-w-xs">{eic && <PersonCard m={eic} large />}</div>

        <SectionHeader eyebrow={`${members.length} Members`} title="Editorial Board" />
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {members.map((m) => (
            <PersonCard key={m.name} m={m} />
          ))}
        </div>

        <SectionHeader
          eyebrow={`${advisoryCommittee.length} Members`}
          title="International Advisory Committee"
        />
        <p className="-mt-8 mb-4 text-xs uppercase tracking-wider text-muted-foreground">Not part of the Editorial Board</p>
        <p className="-mt-6 mb-10 text-foreground/70 max-w-2xl">{get("advisory", "description")}</p>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-0 border-t border-[var(--navy)]/15">
          {advisoryCommittee.map((m) => <DirectoryEntry key={`${m.name}-${m.inst}`} member={m} />)}
        </div>

        <SectionHeader eyebrow={`${reviewers.length} Reviewers`} title="Peer Reviewers" />
        <p className="-mt-8 mb-4 text-xs uppercase tracking-wider text-muted-foreground">Not part of the Editorial Board</p>
        <p className="-mt-6 mb-10 text-foreground/70 max-w-2xl">
          {get("reviewers", "description")}
        </p>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-0 border-t border-[var(--navy)]/15">
          {reviewers.map((r, i) => <DirectoryEntry key={`${r.name}-${i}`} member={r} />)}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
