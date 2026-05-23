import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/publication-ethics")({
  component: PublicationEthics,
  head: () => ({
    title: "Publication Ethics & Plagiarism Policy — The Agriculture Popular Article Magazine",
    meta: [
      {
        name: "description",
        content:
          "Publication ethics, plagiarism policy, authorship, peer review and editorial standards followed by The Agriculture Popular Article Magazine.",
      },
      { property: "og:title", content: "Publication Ethics & Plagiarism Policy" },
      {
        property: "og:description",
        content:
          "Editorial standards, plagiarism policy, authorship and peer-review ethics for The Agriculture Popular Article Magazine.",
      },
    ],
  }),
});

function PublicationEthics() {
  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16">
        <div className="eyebrow">Editorial Policy</div>
        <h1 className="font-display text-5xl md:text-6xl mt-3 text-ink max-w-3xl leading-[1.05]">
          Publication Ethics &amp; Plagiarism Policy
        </h1>
        <p className="mt-6 max-w-2xl text-foreground/75 leading-relaxed">
          The Agriculture Popular Article Magazine is committed to maintaining the highest
          standards of publication ethics. All authors, reviewers and editors are expected to
          follow the principles set out below.
        </p>

        <Section title="1. Originality &amp; Plagiarism">
          <p>
            Manuscripts submitted to the magazine must be the original work of the authors and
            must not have been published or be under consideration elsewhere. All submissions
            are screened for plagiarism. Any manuscript with a similarity index above 15%
            (excluding references and standard terminology) will be returned to the author
            for revision or rejected outright.
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-foreground/80">
            <li>Verbatim copying without quotation and citation is considered plagiarism.</li>
            <li>Paraphrasing another author's work without attribution is plagiarism.</li>
            <li>Self-plagiarism (republishing one's own work without disclosure) is not permitted.</li>
            <li>All sources, data and figures must be properly cited.</li>
          </ul>
        </Section>

        <Section title="2. Authorship">
          <p>
            Authorship should be limited to those who have made a significant contribution to
            the conception, design, execution or interpretation of the reported study. All
            persons who have made substantial contributions must be listed as co-authors.
            The corresponding author is responsible for ensuring that all co-authors have
            seen and approved the final version of the manuscript.
          </p>
        </Section>

        <Section title="3. Peer Review">
          <p>
            Every research article is subject to a double-blind peer review process. The
            identity of authors and reviewers is kept confidential. Reviewers are expected
            to evaluate manuscripts objectively, declare any conflicts of interest, and
            return their assessment within the agreed timeline.
          </p>
        </Section>

        <Section title="4. Conflicts of Interest">
          <p>
            Authors must disclose any financial, personal or professional relationships that
            could be perceived as influencing the content of their manuscript. Reviewers and
            editors must recuse themselves from manuscripts where a conflict of interest exists.
          </p>
        </Section>

        <Section title="5. Corrections, Retractions &amp; Misconduct">
          <p>
            If errors are discovered in a published article, the magazine will publish a
            correction or, in serious cases, retract the article. Allegations of misconduct
            including fabrication of data, image manipulation, duplicate submission or
            plagiarism will be investigated in line with COPE (Committee on Publication
            Ethics) guidelines.
          </p>
        </Section>

        <Section title="6. Open Access &amp; Copyright">
          <p>
            All articles are published under an open-access license. Authors retain copyright
            of their work and grant the magazine a non-exclusive license to publish and
            distribute the article. Readers may share and adapt the work for non-commercial
            purposes with proper attribution.
          </p>
        </Section>

        <Section title="7. Reporting Concerns">
          <p>
            Concerns about publication ethics, plagiarism or research misconduct should be
            reported in writing to the Chief Editor through the{" "}
            <a href="/contact" className="text-primary underline underline-offset-2">
              contact page
            </a>
            . All reports will be reviewed confidentially.
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
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <div className="rule-thick mt-3 mb-5 max-w-[60px]" />
      <div className="prose-editorial text-foreground/80 leading-relaxed max-w-3xl space-y-3">
        {children}
      </div>
    </section>
  );
}
