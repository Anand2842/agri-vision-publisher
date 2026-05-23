import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/advertise")({
  component: Advertise,
  head: () => ({
    meta: [
      { title: "Advertise With Us — The Agriculture Popular Article Magazine" },
      {
        name: "description",
        content:
          "Reach researchers, students, agri-startups and policy makers across India. Advertising opportunities, formats and rates for The Agriculture Popular Article Magazine.",
      },
      { property: "og:title", content: "Advertise With Us — The Agriculture Popular Article Magazine" },
      {
        property: "og:description",
        content:
          "Display, banner and sponsored-article advertising in The Agriculture Popular Article Magazine.",
      },
    ],
  }),
});

const RATES: { format: string; size: string; rate: string }[] = [
  { format: "Full page (inside)", size: "A4 colour", rate: "₹15,000 / issue" },
  { format: "Half page (inside)", size: "A5 colour", rate: "₹8,000 / issue" },
  { format: "Quarter page", size: "A6 colour", rate: "₹4,500 / issue" },
  { format: "Inside front / back cover", size: "A4 colour, premium", rate: "₹25,000 / issue" },
  { format: "Back cover", size: "A4 colour, premium", rate: "₹35,000 / issue" },
  { format: "Sponsored article (3 pages)", size: "Editorial layout", rate: "₹40,000 / issue" },
  { format: "Website banner (top, 30 days)", size: "1200×200 px", rate: "₹10,000 / month" },
];

function Advertise() {
  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16">
        <div className="eyebrow">Partnership</div>
        <h1 className="font-display text-5xl md:text-6xl mt-3 text-ink max-w-3xl leading-[1.05]">
          Advertise With Us
        </h1>
        <p className="mt-6 max-w-2xl text-foreground/75 leading-relaxed">
          The Agriculture Popular Article Magazine reaches researchers, postgraduate students,
          extension officers, agri-startups, FPOs and policy makers across India. Place your
          message in front of an engaged, decision-making audience.
        </p>

        <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Stat label="Monthly readers" value="12,000+" />
          <Stat label="Institutions reached" value="450+" />
          <Stat label="Avg. issue downloads" value="3,500" />
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl md:text-3xl text-ink">Advertising formats &amp; rates</h2>
          <div className="rule-thick mt-3 mb-5 max-w-[60px]" />
          <p className="text-foreground/75 max-w-3xl">
            Indicative rate card for Volume 1. Rates are negotiable for annual contracts
            and for non-profit / academic institutions. GST as applicable.
          </p>
          <div className="mt-6 overflow-x-auto border border-rule">
            <table className="min-w-full text-sm">
              <thead className="bg-secondary/40 text-left">
                <tr>
                  <Th>Format</Th>
                  <Th>Specification</Th>
                  <Th className="text-right">Rate</Th>
                </tr>
              </thead>
              <tbody>
                {RATES.map((r) => (
                  <tr key={r.format} className="border-t border-rule">
                    <Td>{r.format}</Td>
                    <Td className="text-foreground/70">{r.size}</Td>
                    <Td className="text-right font-medium">{r.rate}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl md:text-3xl text-ink">Mechanical requirements</h2>
          <div className="rule-thick mt-3 mb-5 max-w-[60px]" />
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-foreground/80">
            <li className="border border-rule bg-paper p-5">
              <div className="font-semibold text-ink">Artwork format</div>
              Press-ready PDF (CMYK, 300 dpi), with 3 mm bleed on all sides.
            </li>
            <li className="border border-rule bg-paper p-5">
              <div className="font-semibold text-ink">Web banner</div>
              Optimised JPG or PNG, under 200 KB, with click-through URL.
            </li>
            <li className="border border-rule bg-paper p-5">
              <div className="font-semibold text-ink">Material deadline</div>
              10 days before the issue release date.
            </li>
            <li className="border border-rule bg-paper p-5">
              <div className="font-semibold text-ink">Payment</div>
              50% advance on confirmation, balance before publication.
            </li>
          </ul>
        </section>

        <section className="mt-14 border border-rule bg-paper p-8 max-w-3xl">
          <h2 className="font-display text-2xl text-ink">Book a slot</h2>
          <p className="text-foreground/80 mt-2">
            Send your enquiry along with the preferred format, issue month and contact
            details. Our team will share the booking confirmation within 48 hours.
          </p>
          <Link to="/contact" className="btn-orange mt-5 inline-flex">
            Contact the advertising desk
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-rule bg-paper p-6">
      <div className="text-3xl font-display text-primary">{value}</div>
      <div className="eyebrow mt-2">{label}</div>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-xs uppercase tracking-wider font-condensed ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
