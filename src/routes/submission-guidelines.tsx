import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { fetchSeoMetadata, useSiteContent } from "@/hooks/useSiteContent";

export const Route = createFileRoute("/submission-guidelines")({
  component: Guidelines,
  loader: () => fetchSeoMetadata("guidelines"),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: loaderData.title },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.description },
        ]
      : [{ title: "Submission Guidelines — The Agriculture Popular Article Magazine" }],
    links: [{ rel: "canonical", href: "/submission-guidelines" }],
  }),
});

function Guidelines() {
  const { get, getJson } = useSiteContent("guidelines");
  const steps = getJson<"process", "steps", string[]>("process", "steps");
  const formatting = getJson<"formatting", "items", { l: string; v: string }[]>("formatting", "items");
  const fees = getJson<"fees", "items", { who: string; fee: string; note: string }[]>("fees", "items");
  const requirements = getJson<"requirements", "items", string[]>("requirements", "items");
  const originality = getJson<"originality", "items", string[]>("originality", "items");

  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16">
        <div className="eyebrow">Authors</div>
        <h1 className="font-display text-5xl md:text-6xl mt-3 text-ink max-w-3xl leading-[1.05]">
          {get("hero", "heading")}
        </h1>
        <p className="mt-6 max-w-2xl text-foreground/75 leading-relaxed">
          {get("hero", "intro")}
        </p>

        <Section title="1. Editorial & Review Process">
          <ol className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {steps.map((s, i) => (
              <li key={s} className="border border-rule bg-paper p-5 text-center">
                <div className="font-display text-3xl text-primary">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="text-sm mt-2">{s}</div>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-foreground/75 leading-relaxed max-w-3xl">
            {get("process", "description")}
          </p>
        </Section>

        <Section title="2. Membership Requirements">
          <p className="text-foreground/80 leading-relaxed max-w-3xl">
            {get("membership", "body")}
          </p>
        </Section>

        <Section title="3. Publication Fees">
          <div className="border border-rule overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper">
                <tr className="text-left">
                  <th className="px-5 py-3 eyebrow">Category</th>
                  <th className="px-5 py-3 eyebrow">Fee</th>
                  <th className="px-5 py-3 eyebrow">Notes</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f: any) => (
                  <tr key={f.who} className="border-t border-rule">
                    <td className="px-5 py-4 font-display">{f.who}</td>
                    <td className="px-5 py-4">{f.fee}</td>
                    <td className="px-5 py-4 text-foreground/70">{f.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="4. Submission Requirements">
          <ul className="space-y-3 text-foreground/80 leading-relaxed max-w-3xl">
            {requirements.map((req: string, i: number) => (
              <li key={i}>
                • {req}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="5. Formatting Guidelines">
          <dl className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
            {formatting.map((f: any) => (
              <div key={f.l} className="border-t border-rule pt-4">
                <dt className="eyebrow">{f.l}</dt>
                <dd className="font-display text-lg mt-1">{f.v}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="6. Originality & Plagiarism">
          <ul className="space-y-3 text-foreground/80 leading-relaxed max-w-3xl">
            {originality.map((orig: string, i: number) => (
              <li key={i}>
                • {orig}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="7. Publication & Access">
          <p className="text-foreground/80 leading-relaxed max-w-3xl">
            {get("publication", "body")}
          </p>
        </Section>

        <div className="mt-16 flex justify-center">
          <Link
            to="/submit"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-4 rounded-sm"
          >
            Begin a submission →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-16">
      <div className="eyebrow">{title}</div>
      <div className="rule-thick mt-3 mb-8" />
      {children}
    </section>
  );
}
