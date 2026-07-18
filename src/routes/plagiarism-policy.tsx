import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { fetchSeoMetadata } from "@/hooks/useSiteContent";

export const Route = createFileRoute("/plagiarism-policy")({
  component: PlagiarismPolicy,
  loader: () => fetchSeoMetadata("plagiarism_policy"),
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: loaderData.title },
          { name: "description", content: loaderData.description },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.description },
        ]
      : [{ title: "Plagiarism Policy (UGC Guidelines) — The Agriculture Magazine" }],
    links: [{ rel: "canonical", href: "https://agriculturemagazine.in/plagiarism-policy" }],
  }),
});

function PlagiarismPolicy() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="container-editorial py-16 max-w-4xl">
        <div className="eyebrow">Policies</div>
        <h1 className="font-display text-2xl md:text-3xl mt-3 text-ink max-w-3xl leading-[1.05]">
          Plagiarism Policy
        </h1>
        <p className="mt-6 max-w-2xl text-foreground/75 leading-relaxed">
          The Agriculture Popular Article Magazine strictly adheres to the University Grants
          Commission (UGC) regulations concerning the promotion of academic integrity and prevention
          of plagiarism.
        </p>

        <Section title="1. Definition of Plagiarism">
          <p>
            Plagiarism is defined as the practice of taking someone else's work, ideas, thoughts, or
            expressions and passing them off as one's own original work. This includes both
            intentional and unintentional copying of text without proper citation or attribution.
          </p>
        </Section>

        <Section title="2. Similarity Index & Tolerance (UGC Guidelines)">
          <p>
            In accordance with UGC guidelines, the core work carried out by the author(s) shall be
            based on original ideas and shall be covered by zero tolerance policy on plagiarism. The
            magazine accepts a maximum allowable similarity index of up to 10% for the entire
            manuscript (excluding bibliography, references, quoted text, and generic terms).
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-foreground/80">
            <li>
              <strong>Level 0:</strong> Similarities up to 10% - Minor similarities, no penalty.
            </li>
            <li>
              <strong>Level 1:</strong> Similarities above 10% to 40% - Manuscript returned for
              revision within a stipulated time period.
            </li>
            <li>
              <strong>Level 2:</strong> Similarities above 40% to 60% - Manuscript rejected
              immediately.
            </li>
            <li>
              <strong>Level 3:</strong> Similarities above 60% - Manuscript rejected, author may be
              blacklisted for future submissions.
            </li>
          </ul>
        </Section>

        <Section title="3. Plagiarism Detection">
          <p>
            All submitted manuscripts undergo a rigorous plagiarism check using reputed similarity
            detection software (such as Turnitin, iThenticate, or Ouriginal) before they are sent
            for peer review. Authors are strongly encouraged to check their manuscripts before
            submission.
          </p>
        </Section>

        <Section title="4. Self-Plagiarism">
          <p>
            Authors must not submit manuscripts that are previously published elsewhere or are
            currently under review by another publisher. Re-using one's own previously published
            work without proper citation is considered self-plagiarism and is unacceptable.
          </p>
        </Section>

        <Section title="5. Action Against Plagiarism">
          <p>
            If plagiarism is detected after publication, the editorial board reserves the right to
            formally retract the article from the magazine's archives, remove the PDF, and publish a
            notice of retraction. The author's affiliated institution may also be notified.
          </p>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-12">
      <h2 className="text-xl md:text-2xl font-display text-[oklch(var(--navy))] border-b border-rule pb-2 mb-4">
        {title}
      </h2>
      <div className="text-base leading-[1.8] text-foreground/80">{children}</div>
    </div>
  );
}
