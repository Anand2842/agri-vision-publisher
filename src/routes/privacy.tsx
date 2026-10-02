import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { fetchSeoMetadata } from "@/hooks/useSiteContent";
import DOMPurify from "isomorphic-dompurify";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicy,
  loader: () => fetchSeoMetadata("privacy"),
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
            title: "Privacy Policy — The Agriculture Popular Article Magazine",
          },
        ],
    links: [{ rel: "canonical", href: "https://agriculturemagazine.in/privacy" }],
  }),
});

function PrivacyPolicy() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="container-editorial py-16 max-w-4xl">
        <div className="eyebrow">Legal</div>
        <h1 className="font-display text-2xl md:text-3xl mt-3 text-ink max-w-3xl leading-[1.05]">
          Privacy Policy
        </h1>
        <p className="mt-6 max-w-2xl text-foreground/75 leading-relaxed">
          The Agriculture Popular Article Magazine is committed to protecting the privacy of authors, reviewers, readers, and subscribers who engage with our platform.
        </p>

        <Section title="1. Information We Collect">
          <p>
            When you register for membership, submit a manuscript, subscribe, or contact us, we may collect the following personal information:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-foreground/80">
            <li><strong>Personal details:</strong> Full name, institutional affiliation, designation, and department.</li>
            <li><strong>Contact details:</strong> Email address, mobile/WhatsApp phone number, and mailing address.</li>
            <li><strong>Scholarly profile:</strong> ORCID iD, research interests, and authored publications.</li>
            <li><strong>Payment information:</strong> Transaction ID and payment proofs for membership or article processing fees (we do not store credit card/banking credentials directly).</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>
            The collected information is used solely for the following academic and editorial purposes:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-foreground/80">
            <li>Managing article submission, peer review, and editorial communications.</li>
            <li>Publishing author metadata alongside accepted articles in accordance with open-access standards.</li>
            <li>Issuing certificates of publication and membership IDs.</li>
            <li>Sending notices regarding published issues, review updates, or editorial announcements.</li>
          </ul>
        </Section>

        <Section title="3. Data Protection & Sharing">
          <p>
            We do not sell, rent, or trade your personal information to third parties or marketing agencies. Author names and affiliations are made public only as part of the published scholarly articles. Reviewers' identities are strictly confidential and protected under our double-blind / single-blind review guidelines.
          </p>
        </Section>

        <Section title="4. Cookies & Analytics">
          <p>
            Our website uses minimal cookies to manage user authentication sessions and aggregate traffic analytics to improve site performance and reader experience.
          </p>
        </Section>

        <Section title="5. Contact Regarding Privacy">
          <p>
            For any queries or requests regarding your personal data or privacy preferences, please contact our Editorial Office at <strong>dkdkdangi@gmail.com</strong> or phone <strong>+91 9509164410</strong>.
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
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(title) }}
      />
      <div className="rule-thick mt-3 mb-5 max-w-[60px]" />
      <div className="prose-editorial text-foreground/80 leading-relaxed max-w-3xl space-y-3">
        {children}
      </div>
    </section>
  );
}
