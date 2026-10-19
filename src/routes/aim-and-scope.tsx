import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { useSiteContent } from "@/hooks/useSiteContent";

const TITLE = "Aim & Scope — The Agriculture Popular Article Magazine";
const DESC =
  "Aim and scope of The Agriculture Popular Article Magazine: a peer-reviewed, open-access online monthly covering agriculture and allied sciences in English.";

export const Route = createFileRoute("/aim-and-scope")({
  component: AimScope,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://agriculturemagazine.in/aim-and-scope" }],
  }),
});

function AimScope() {
  const { get, getJson } = useSiteContent("aim_scope");
  const items = getJson<"main", "scope_items", string[]>("main", "scope_items") || [];
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="container-editorial py-16 max-w-4xl">
        <div className="eyebrow">Aim &amp; Scope</div>
        <h1 className="font-display text-2xl md:text-3xl mt-4 text-ink leading-tight">
          Aim &amp; Scope of the Magazine
        </h1>

        <h2 className="font-display text-2xl text-ink mt-10">Aim</h2>
        <p className="mt-3 text-foreground/85 leading-relaxed">{get("main", "aim")}</p>

        <h2 className="font-display text-2xl text-ink mt-10">Scope</h2>
        <ul className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-3">
          {items.map((it, i) => (
            <li key={i} className="flex gap-3 text-foreground/85">
              <span className="font-display text-orange shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <span>{it}</span>
            </li>
          ))}
        </ul>

        <h2 className="font-display text-2xl text-ink mt-10">Readership</h2>
        <p className="mt-3 text-foreground/85 leading-relaxed">{get("main", "audience")}</p>

        <div className="mt-10 border border-rule bg-paper p-6 text-sm text-foreground/80 leading-relaxed">
          Published monthly · Online only · English · Peer reviewed · Open access. See{" "}
          <Link to="/about" className="text-primary underline">About</Link>,{" "}
          <Link to="/editorial-board" className="text-primary underline">Editorial Board</Link> and{" "}
          <Link to="/submission-guidelines" className="text-primary underline">Submission Guidelines</Link>.
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
