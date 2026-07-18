import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { fetchSeoMetadata, useSiteContent } from "@/hooks/useSiteContent";

export const Route = createFileRoute("/startup-spotlight")({
  component: Spotlight,
  loader: () => fetchSeoMetadata("startup_spotlight"),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: loaderData.title },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.description },
        ]
      : [{ title: "Startup Spotlight — The Agriculture Popular Article Magazine" }],
    links: [{ rel: "canonical", href: "https://agriculturemagazine.in/startup-spotlight" }],
  }),
});

function Spotlight() {
  const { get, getJson } = useSiteContent("startup_spotlight");
  const startups = getJson<"startups", "items", { name: string; founder: string; innovation: string; logo_url?: string }[]>("startups", "items");
  return (
    <>
      <SiteHeader />
      <main id="main-content">
      <main className="container-editorial py-16">
        <div className="eyebrow">Startup Spotlight</div>
        <h1 className="font-display text-5xl md:text-6xl mt-3 text-ink max-w-3xl leading-[1.05]">
          {get("hero", "heading")}
        </h1>

        <section className="mt-16 grid md:grid-cols-2 gap-8">
          {startups.map((s) => (
            <div key={s.name} className="bg-paper border border-rule p-10">
              <div className="h-14 w-14 rounded-sm flex items-center justify-center border border-rule overflow-hidden">
                {s.logo_url ? (
                  <img src={s.logo_url} alt={s.name} className="h-full w-full object-contain p-1" />
                ) : (
                  <div className="h-full w-full bg-primary/10 flex items-center justify-center font-display text-primary text-2xl">
                    {s.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="font-display text-3xl mt-6">{s.name}</h3>
              <div className="text-sm text-muted-foreground mt-1">Founded by {s.founder}</div>
              <p className="mt-5 text-foreground/80 leading-relaxed">{s.innovation}</p>
              <Link
                to="/contact"
                className="text-sm text-primary mt-6 inline-block hover:underline"
              >
                Apply for spotlight →
              </Link>
            </div>
          ))}
        </section>
      </main>
      </main>
      <SiteFooter />
    </>
  );
}
