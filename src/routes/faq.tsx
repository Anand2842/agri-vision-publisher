import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is The Agriculture Popular Article Magazine?",
    a: "The Agriculture Popular Article Magazine is a peer-reviewed, open-access monthly magazine for agriculture and allied sciences. We publish original research, popular articles, and editorial commentary written by scientists, faculty, research scholars, and extension professionals.",
  },
  {
    q: "Is the magazine peer-reviewed and open-access?",
    a: "Yes. Every accepted manuscript is reviewed by subject experts on our editorial board, and all published articles are freely accessible online without a paywall or subscription requirement.",
  },
  {
    q: "Who can submit an article?",
    a: "Faculty members, scientists, research scholars, postgraduate students, and extension professionals working in agriculture, horticulture, animal sciences, fisheries, forestry, food science, agricultural engineering, or any allied discipline are welcome to submit. Industry practitioners and policy researchers may also contribute.",
  },
  {
    q: "How do I submit a manuscript?",
    a: "Create a free author account, open the Submit Article page, fill in the title, abstract, authors, and category, then upload your manuscript file. You will receive a tracking ticket immediately and email updates as the manuscript moves through review.",
  },
  {
    q: "What is the article processing fee?",
    a: "Single-article submissions carry a nominal processing fee that covers editorial handling, plagiarism screening, DOI registration, and certificate issuance. Annual and lifetime members can submit multiple articles without per-article fees. Current pricing is listed on the Membership page.",
  },
  {
    q: "How long does the review process take?",
    a: "Initial editorial screening typically completes within 3–5 working days. Full peer review and a publication decision usually take 2–4 weeks depending on reviewer availability and the complexity of the submission.",
  },
  {
    q: "Will I receive a publication certificate?",
    a: "Yes. Every published author receives a verifiable digital certificate with a unique ID that can be downloaded from the author dashboard and shared with institutions, funders, or selection committees.",
  },
  {
    q: "Do you check for plagiarism?",
    a: "Every submission is screened with professional similarity-detection software. Manuscripts with a similarity index above our editorial threshold are returned for revision or rejected outright. Authors are expected to follow our publication-ethics policy.",
  },
  {
    q: "What file formats are accepted for submission?",
    a: "We accept manuscripts in Microsoft Word (.doc, .docx) and PDF. Figures should be embedded in the document and also available as high-resolution images on request. Tables should be editable, not screenshots.",
  },
  {
    q: "Do authors retain copyright of their published work?",
    a: "Yes. Authors retain copyright. Articles are published under an open-access licence that permits readers to share and cite the work with proper attribution, while authors keep the right to reuse the content in theses, books, and presentations.",
  },
  {
    q: "How can I become a member?",
    a: "Visit the Membership page, choose an annual, lifetime, or institutional plan, complete the payment, and submit the transaction reference on your dashboard. Verification is usually completed within 1–2 business days, after which your benefits activate automatically.",
  },
  {
    q: "How do I contact the editorial office?",
    a: "Use the Contact page to reach the editorial office for questions about submissions, membership, certificates, or partnerships. We respond to most queries within two working days.",
  },
];

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  head: () => ({
    meta: [
      { title: "FAQ — Submissions, Membership & Peer Review | Agriculture Magazine" },
      {
        name: "description",
        content:
          "Answers to common questions about The Agriculture Popular Article Magazine — submissions, peer review, processing fees, membership, certificates, copyright, and plagiarism policy.",
      },
      { property: "og:title", content: "Frequently Asked Questions — Agriculture Magazine" },
      {
        property: "og:description",
        content:
          "How submissions, peer review, membership, certificates, and open-access publication work at The Agriculture Popular Article Magazine.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "FAQ — Agriculture Magazine" },
      {
        name: "twitter:description",
        content:
          "Submissions, peer review, fees, membership, and certificates — explained.",
      },
    ],
    links: [{ rel: "canonical", href: "https://agriculturemagazine.in/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
});

function FaqPage() {
  return (
    <>
      <SiteHeader />
      <main className="container-dashboard py-16 font-sans">
        <header className="max-w-3xl">
          <div className="eyebrow">Help Centre</div>
          <h1 className="font-display text-5xl mt-3 text-ink">Frequently Asked Questions</h1>
          <p className="text-base text-muted-foreground mt-4 leading-relaxed">
            Answers to the questions authors, reviewers, and readers ask most often about
            submitting to, publishing with, and subscribing to The Agriculture Popular Article
            Magazine.
          </p>
        </header>

        <div className="rule-thick mt-10" />

        <section className="mt-8 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-display text-lg text-ink">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-foreground/80">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="mt-16 max-w-3xl border-t border-rule pt-8">
          <div className="eyebrow">Still need help?</div>
          <p className="text-sm text-muted-foreground mt-3">
            If your question is not answered above, write to our editorial office through the{" "}
            <a href="/contact" className="text-primary underline-offset-2 hover:underline">
              Contact page
            </a>
            . We respond to most enquiries within two working days.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
