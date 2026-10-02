import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { fetchSeoMetadata } from "@/hooks/useSiteContent";
import { sanitizeHtml } from "@/lib/sanitize";

export const Route = createFileRoute("/open-access")({
  component: OpenAccessPolicy,
  loader: () => fetchSeoMetadata("open_access"),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: loaderData.title },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.description },
        ]
      : [
          {
            title: "Open Access Policy — The Agriculture Popular Article Magazine",
          },
        ],
    links: [{ rel: "canonical", href: "https://agriculturemagazine.in/open-access" }],
  }),
});

function OpenAccessPolicy() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="container-editorial py-16 max-w-4xl">
        <div className="eyebrow">Policies</div>
        <h1 className="font-display text-2xl md:text-3xl mt-3 text-ink max-w-3xl leading-[1.05]">
          Open Access Policy
        </h1>
        <p className="mt-6 max-w-2xl text-foreground/75 leading-relaxed">
          The Agriculture Popular Article Magazine is dedicated to the open dissemination of agricultural knowledge, research insights, and farming innovations without financial, legal, or technical barriers.
        </p>

        <Section title="1. Open Access Statement">
          <p>
            All articles published by <em>The Agriculture Popular Article Magazine</em> are fully open access and immediately available online upon publication. This means that anyone—researchers, students, farmers, policymakers, and the general public—has free and unlimited access to the full text of all articles without subscription fees or paywalls.
          </p>
        </Section>

        <Section title="2. Licensing & Copyright (Creative Commons)">
          <p>
            Articles are published under the <strong>Creative Commons Attribution-NonCommercial (CC BY-NC 4.0)</strong> license. Under this license:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-foreground/80">
            <li>
              <strong>Share:</strong> Readers are free to copy and redistribute the material in any medium or format.
            </li>
            <li>
              <strong>Adapt:</strong> Readers may remix, transform, and build upon the material for non-commercial purposes.
            </li>
            <li>
              <strong>Attribution:</strong> Appropriate credit must be given to the original authors and the magazine, with a link to the license and mention of any changes made.
            </li>
            <li>
              <strong>Non-Commercial:</strong> The material may not be used for commercial purposes without explicit written permission.
            </li>
          </ul>
        </Section>

        <Section title="3. Author Rights & Repository Policy">
          <p>
            Authors retain copyright of their work while granting the magazine the right of first publication. Authors are encouraged to deposit the published version (PDF) of their articles in institutional repositories, subject repositories (such as AgEcon Search, ResearchGate, Google Scholar), or personal websites with appropriate citation.
          </p>
        </Section>

        <Section title="4. Archiving & Long-Term Preservation">
          <p>
            All published issues and individual articles are digitally archived in the magazine's permanent online repository. We ensure that our archive remains accessible, backed up, and securely maintained for long-term scholarly reference.
          </p>
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
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(title) }}
      />
      <div className="rule-thick mt-3 mb-5 max-w-[60px]" />
      <div className="prose-editorial text-foreground/80 leading-relaxed max-w-3xl space-y-3">
        {children}
      </div>
    </section>
  );
}
