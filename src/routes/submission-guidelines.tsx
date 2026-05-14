import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/submission-guidelines")({
  component: Guidelines,
  head: () => ({ meta: [
    { title: "Submission Guidelines — The Agriculture Popular Article Magazine" },
    { name: "description", content: "How to submit your article to The Agriculture Popular Article Magazine magazine." },
  ] }),
});

const types = [
  { t: "Popular Articles", d: "1500–3000 words. Plain-language summaries of original research for a broad audience." },
  { t: "Technical Articles", d: "3000–6000 words. Methods, data and analysis for the specialist reader." },
  { t: "Reviews & Perspectives", d: "Up to 8000 words. Synthesis of a sub-field, theme or policy debate." },
];

const formatting = [
  { l: "Title format", v: "Sentence case, ≤ 14 words." },
  { l: "Body font", v: "Times New Roman 12 / Calibri 11." },
  { l: "References", v: "APA 7th edition, embedded with DOI where available." },
  { l: "Figures", v: "300 dpi minimum, separate files at submission." },
];

const steps = ["Submit", "Initial Screening", "Peer Review", "Revision", "Approval", "Publish"];

function Guidelines() {
  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16">
        <div className="eyebrow">Authors</div>
        <h1 className="font-display text-5xl md:text-6xl mt-3 text-ink max-w-3xl leading-[1.05]">Submission Guidelines</h1>
        <p className="mt-6 max-w-2xl text-foreground/75 leading-relaxed">
          We accept original work from researchers, practitioners and graduate students worldwide. Please read the guidelines carefully before submitting.
        </p>

        <Section title="Accepted Article Types">
          <div className="grid md:grid-cols-3 gap-6">
            {types.map((t) => (
              <div key={t.t} className="border border-rule bg-paper p-7">
                <h3 className="font-display text-xl">{t.t}</h3>
                <p className="text-sm text-foreground/75 mt-3 leading-relaxed">{t.d}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Formatting Guidelines">
          <dl className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
            {formatting.map((f) => (
              <div key={f.l} className="border-t border-rule pt-4">
                <dt className="eyebrow">{f.l}</dt>
                <dd className="font-display text-lg mt-1">{f.v}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Submission Workflow">
          <ol className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {steps.map((s, i) => (
              <li key={s} className="border border-rule bg-paper p-5 text-center">
                <div className="font-display text-3xl text-primary">{String(i + 1).padStart(2, "0")}</div>
                <div className="text-sm mt-2">{s}</div>
              </li>
            ))}
          </ol>
        </Section>

        <Section title="Editorial Policies">
          <ul className="space-y-3 text-foreground/80 leading-relaxed">
            <li>• Plagiarism is screened on every submission. Manuscripts above 15% similarity are returned.</li>
            <li>• Authors confirm originality and warrant that the work is not under review elsewhere.</li>
            <li>• Authors retain copyright; articles are licensed CC BY 4.0.</li>
          </ul>
        </Section>

        <div className="mt-16 flex justify-center">
          <Link to="/submit" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-4 rounded-sm">
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
