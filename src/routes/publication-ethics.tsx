import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { fetchSeoMetadata, useSiteContent } from "@/hooks/useSiteContent";

export const Route = createFileRoute("/publication-ethics")({
  component: PublicationEthics,
  loader: () => fetchSeoMetadata("publication_ethics"),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: loaderData.title },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.description },
        ]
      : [{ title: "Publication Ethics & Plagiarism Policy — The Agriculture Popular Article Magazine" }],
    links: [{ rel: "canonical", href: "https://agriculturemagazine.in/publication-ethics" }],
  }),
});

function PublicationEthics() {
  const { get, getJson } = useSiteContent("publication_ethics");
  const originalityPoints = getJson<"originality", "points", string[]>("originality", "points");

  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16">
        <div className="eyebrow">{get("hero", "eyebrow")}</div>
        <h1 className="font-display text-5xl md:text-6xl mt-3 text-ink max-w-3xl leading-[1.05]">
          {get("hero", "title")}
        </h1>
        <p className="mt-6 max-w-2xl text-foreground/75 leading-relaxed">
          {get("hero", "body")}
        </p>

        <Section title={get("originality", "title")}>
          <p>{get("originality", "body")}</p>
          {originalityPoints && originalityPoints.length > 0 && (
            <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-foreground/80">
              {originalityPoints.map((pt, i) => (
                <li key={i}>{pt}</li>
              ))}
            </ul>
          )}
        </Section>

        <Section title={get("authorship", "title")}>
          <p>{get("authorship", "body")}</p>
        </Section>

        <Section title={get("peer_review", "title")}>
          <p>{get("peer_review", "body")}</p>
        </Section>

        <Section title={get("conflicts", "title")}>
          <p>{get("conflicts", "body")}</p>
        </Section>

        <Section title={get("corrections", "title")}>
          <p>{get("corrections", "body")}</p>
        </Section>

        <Section title={get("open_access", "title")}>
          <p>{get("open_access", "body")}</p>
        </Section>

        <Section title={get("reporting", "title")}>
          <p dangerouslySetInnerHTML={{ __html: get("reporting", "body") }} />
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2
        className="font-display text-2xl md:text-3xl text-ink"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <div className="rule-thick mt-3 mb-5 max-w-[60px]" />
      <div className="prose-editorial text-foreground/80 leading-relaxed max-w-3xl space-y-3">
        {children}
      </div>
    </section>
  );
}

