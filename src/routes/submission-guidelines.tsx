import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/submission-guidelines")({
  component: Guidelines,
  head: () => ({ meta: [
    { title: "Submission Guidelines — The Agriculture Popular Article Magazine" },
    { name: "description", content: "Editorial process, membership, fees and formatting rules for The Agriculture Popular Article Magazine." },
  ] }),
});

const steps = ["Submit", "Initial Screening", "Peer Review", "Revision", "Approval", "Publish"];

const formatting = [
  { l: "Title", v: "Times New Roman 14 pt · Bold · Centered" },
  { l: "Author details", v: "TNR 12 pt — name, designation, affiliation" },
  { l: "Corresponding email", v: "TNR 12 pt · Bold" },
  { l: "Headings", v: "TNR 14 pt · Bold" },
  { l: "Sub-headings", v: "TNR 12 pt · Bold" },
  { l: "Body text", v: "TNR 12 pt · Justified · 1.5 line spacing" },
  { l: "Units & abbreviations", v: "SI units · IUB / IUPAC nomenclature" },
  { l: "File format", v: "Microsoft Word (.doc / .docx) only" },
];

const fees = [
  { who: "Annual Members", fee: "Free", note: "Up to 8 articles in 12 months" },
  { who: "Non-member Authors", fee: "₹200 / article", note: "Single article membership" },
  { who: "Non-member Co-authors", fee: "₹100 / co-author", note: "Per additional author" },
];

function Guidelines() {
  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16">
        <div className="eyebrow">Authors</div>
        <h1 className="font-display text-5xl md:text-6xl mt-3 text-ink max-w-3xl leading-[1.05]">Submission Guidelines</h1>
        <p className="mt-6 max-w-2xl text-foreground/75 leading-relaxed">
          The Agriculture Popular Article Magazine welcomes original popular-science articles from researchers,
          extension officers, students and progressive farmers. Please read the guidelines below carefully
          before preparing your manuscript.
        </p>

        <Section title="1. Editorial & Review Process">
          <ol className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {steps.map((s, i) => (
              <li key={s} className="border border-rule bg-paper p-5 text-center">
                <div className="font-display text-3xl text-primary">{String(i + 1).padStart(2, "0")}</div>
                <div className="text-sm mt-2">{s}</div>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-foreground/75 leading-relaxed max-w-3xl">
            Every manuscript is screened by the editorial office, then sent to at least one subject-matter
            reviewer. Authors typically receive a decision within 21 days. Accepted articles are scheduled
            into the next available monthly issue.
          </p>
        </Section>

        <Section title="2. Membership Requirements">
          <p className="text-foreground/80 leading-relaxed max-w-3xl">
            Annual membership of the magazine is required for all corresponding authors. On enrolment,
            members receive a unique <strong>Member ID</strong> and a digital membership certificate, and
            may submit up to eight articles in the 12-month validity period at no additional charge.
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
                {fees.map((f) => (
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
            <li>• Manuscripts must be submitted in Microsoft Word format (.doc / .docx). Other formats will be rejected at screening.</li>
            <li>• Article length: <strong>2–4 pages</strong> (approximately 1,500–3,000 words).</li>
            <li>• Each article must contain a clear <strong>introduction</strong> and a <strong>conclusion</strong>.</li>
            <li>• Submissions for the next monthly issue close on the <strong>25th of every month</strong>.</li>
            <li>• Submit online through the portal, or e-mail your file to <a className="underline" href="mailto:dkdkdangi@gmail.com">dkdkdangi@gmail.com</a>.</li>
          </ul>
        </Section>

        <Section title="5. Formatting Guidelines">
          <dl className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
            {formatting.map((f) => (
              <div key={f.l} className="border-t border-rule pt-4">
                <dt className="eyebrow">{f.l}</dt>
                <dd className="font-display text-lg mt-1">{f.v}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="6. Originality & Plagiarism">
          <ul className="space-y-3 text-foreground/80 leading-relaxed max-w-3xl">
            <li>• Submissions must be the authors' own original work and not under review elsewhere.</li>
            <li>• Plagiarism is screened on every submission; manuscripts above 15% similarity are returned.</li>
            <li>• Proper attribution must be given to all data, figures and ideas borrowed from other sources.</li>
            <li>• Authors retain copyright; articles are released under CC BY 4.0.</li>
          </ul>
        </Section>

        <Section title="7. Publication & Access">
          <p className="text-foreground/80 leading-relaxed max-w-3xl">
            Published articles are made available as a downloadable PDF on the magazine's website and are
            also e-mailed directly to the corresponding author. Each author receives a digital publication
            certificate for the article.
          </p>
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
