import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { fetchSeoMetadata, useSiteContent } from "@/hooks/useSiteContent";

export const Route = createFileRoute("/about")({
  component: About,
  loader: () => fetchSeoMetadata("about"),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: loaderData.title },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.description },
        ]
      : [],
  }),
});

function About() {
  const { get, getJson } = useSiteContent("about");
  const mission = getJson<"mission", "items", string[]>("mission", "items");
  const particulars = getJson<"particulars", "items", [string, string][]>("particulars", "items");

  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16">
        <div className="eyebrow">About</div>
        <h1 className="font-display text-5xl md:text-7xl mt-4 text-ink leading-[1.02] max-w-4xl">
          {get("hero", "tagline")}
        </h1>

        <div className="grid md:grid-cols-12 gap-12 mt-16">
          <div className="md:col-span-7 space-y-8 text-foreground/85 leading-[1.8]">
            <p className="drop-cap text-lg">
              {get("hero", "para1")}
            </p>
            <p>{get("hero", "para2")}</p>
            <p>{get("hero", "para3")}</p>
            <p>{get("hero", "para4")}</p>

            <h2 className="font-display text-3xl text-ink pt-6">{get("vision", "heading")}</h2>
            <p>{get("vision", "body")}</p>

            <h2 className="font-display text-3xl text-ink pt-6">{get("mission", "heading")}</h2>
            <ul className="space-y-3 list-none pl-0">
              {mission.map((m, i) => (
                <li key={i} className="flex gap-4">
                  <span className="font-display text-orange shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
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
                    <dt className="text-xs uppercase tracking-wider text-foreground/60 font-semibold pt-0.5">
                      {k}
                    </dt>
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
