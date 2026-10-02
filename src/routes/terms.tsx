import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { fetchSeoMetadata } from "@/hooks/useSiteContent";
import { sanitizeHtml } from "@/lib/sanitize";

export const Route = createFileRoute("/terms")({
  component: TermsAndConditions,
  loader: () => fetchSeoMetadata("terms"),
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
            title: "Terms & Conditions — The Agriculture Popular Article Magazine",
          },
        ],
    links: [{ rel: "canonical", href: "https://agriculturemagazine.in/terms" }],
  }),
});

function TermsAndConditions() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="container-editorial py-16 max-w-4xl">
        <div className="eyebrow">Legal</div>
        <h1 className="font-display text-2xl md:text-3xl mt-3 text-ink max-w-3xl leading-[1.05]">
          Terms & Conditions
        </h1>
        <p className="mt-6 max-w-2xl text-foreground/75 leading-relaxed">
          Please read these terms and conditions carefully before using our website or submitting any manuscript for publication in The Agriculture Popular Article Magazine.
        </p>

        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using the website <strong>agriculturemagazine.in</strong> (the "Site"), or submitting articles and membership applications, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any part of these terms, please do not use our services.
          </p>
        </Section>

        <Section title="2. Submission & Authorship">
          <p>
            By submitting an article, the author(s) confirm that:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-foreground/80">
            <li>The manuscript is an original work and has not been published previously.</li>
            <li>The manuscript is not under consideration for publication elsewhere.</li>
            <li>All co-authors listed have actively contributed to the work and consented to its submission.</li>
            <li>The article complies with UGC guidelines and plagiarism thresholds.</li>
          </ul>
        </Section>

        <Section title="3. Membership & Publication Fees">
          <p>
            All membership and article processing fees are non-refundable once an article has entered the peer review or publication pipeline. Memberships are annual or life-based as specified at registration.
          </p>
        </Section>

        <Section title="4. Editorial Authority & Retraction">
          <p>
            The Editorial Board reserves absolute discretion regarding acceptance, modification, revision, or rejection of submitted manuscripts. The Editorial Board also retains the authority to retract published articles if violations of publication ethics or severe plagiarism are discovered post-publication.
          </p>
        </Section>

        <Section title="5. Intellectual Property & Disclaimer">
          <p>
            The content, design, and branding of this website are protected under applicable intellectual property laws. While we strive for accuracy, the editorial team and publishers are not liable for factual inaccuracies, interpretations, or scientific opinions expressed by individual contributing authors.
          </p>
        </Section>

        <Section title="6. Governing Law & Jurisdiction">
          <p>
            These terms are governed by the laws of India. Any disputes arising in connection with the magazine or its digital services shall be subject to the exclusive jurisdiction of the competent courts in Rajasthan, India.
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
