import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSiteContent } from "@/hooks/useSiteContent";
import { SITE_CONTENT_DEFAULTS } from "@/lib/site-content-defaults";
import { supabase } from "@/integrations/supabase/client";

type FaqItem = { q: string; a: string };

function parseItems(raw: string | null | undefined): FaqItem[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x) => x && x.q && x.a) : [];
  } catch {
    return [];
  }
}

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  loader: async () => {
    // Load FAQ items from the CMS so JSON-LD reflects what's published.
    const { data } = await supabase
      .from("site_content")
      .select("section,key,value")
      .eq("page", "faq")
      .eq("section", "main")
      .eq("key", "items")
      .maybeSingle();
    const fallback = SITE_CONTENT_DEFAULTS.faq?.main?.items ?? "[]";
    return { items: parseItems(data?.value ?? fallback) };
  },
  head: ({ loaderData }) => {
    const items = loaderData?.items ?? [];
    return {
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
          content: "Submissions, peer review, fees, membership, and certificates — explained.",
        },
      ],
      links: [{ rel: "canonical", href: "https://agriculturemagazine.in/faq" }],
      scripts:
        items.length > 0
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: items.map((f) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                  })),
                }),
              },
            ]
          : [],
    };
  },
});

function FaqPage() {
  const { get, getJson, loading } = useSiteContent("faq");
  const { items: initialItems } = Route.useLoaderData();

  const cmsItems = getJson<"main", "items", FaqItem[]>("main", "items");
  const items: FaqItem[] =
    Array.isArray(cmsItems) && cmsItems.length > 0 ? cmsItems : initialItems;

  const eyebrow = get("hero", "eyebrow");
  const title = get("hero", "title");
  const intro = get("hero", "intro");
  const ctaHeading = get("cta", "heading");
  const ctaBody = get("cta", "body");

  return (
    <>
      <SiteHeader />
      <main id="main-content">
      <main className="container-dashboard py-16 font-sans">
        <header className="max-w-3xl">
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="font-display text-5xl mt-3 text-ink">{title}</h1>
          <p className="text-base text-muted-foreground mt-4 leading-relaxed">{intro}</p>
        </header>

        <div className="rule-thick mt-10" />

        <section className="mt-8 max-w-3xl">
          {loading && items.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground text-sm">Loading FAQs…</p>
          ) : items.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground text-sm">
              No FAQs published yet.
            </p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {items.map((f, i) => (
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
          )}
        </section>

        <section className="mt-16 max-w-3xl border-t border-rule pt-8">
          <div className="eyebrow">{ctaHeading}</div>
          <p className="text-sm text-muted-foreground mt-3">
            {ctaBody}{" "}
            <a href="/contact" className="text-primary underline-offset-2 hover:underline">
              Contact page
            </a>
            .
          </p>
        </section>
      </main>
      </main>
      <SiteFooter />
    </>
  );
}
