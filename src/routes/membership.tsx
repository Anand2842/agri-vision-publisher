import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Check } from "lucide-react";

export const Route = createFileRoute("/membership")({
  component: Membership,
  head: () => ({ meta: [
    { title: "Membership & Pricing — The Agriculture Popular Article Magazine" },
    { name: "description", content: "Single article, annual, lifetime and institutional membership plans." },
  ] }),
});

const plans = [
  { id: "single", name: "Single Article", price: "₹500", period: "per submission", features: ["One article submission", "Peer review", "Publication certificate", "Indexed listing"], featured: false },
  { id: "annual", name: "Annual Membership", price: "₹2,500", period: "per year", features: ["Unlimited submissions for 12 months", "Priority review queue", "Member badge on author profile", "Newsletter feature spots"], featured: true },
  { id: "lifetime", name: "Lifetime Membership", price: "₹15,000", period: "one-time", features: ["Unlimited submissions, forever", "Editorial review consultations", "Conference passes (1/year)", "Lifetime member directory"], featured: false },
  { id: "institute", name: "Institute", price: "₹40,000", period: "per year", features: ["Up to 25 institutional authors", "Institute branded landing page", "Indexed institute archive", "Quarterly impact reports"], featured: false },
];

function Membership() {
  return (
    <>
      <SiteHeader />
      <main className="container-editorial py-16">
        <div className="eyebrow text-center">Membership</div>
        <h1 className="font-display text-5xl md:text-6xl mt-3 text-ink text-center max-w-3xl mx-auto leading-[1.05]">
          Choose the plan that fits your work.
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-center text-foreground/70">
          Membership supports independent agricultural publishing — and gives authors fair, predictable access to peer review.
        </p>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <div key={p.id} className={`border p-7 flex flex-col ${p.featured ? "bg-ink text-background border-ink" : "bg-paper border-rule"}`}>
              {p.featured && <div className="eyebrow text-background/70 mb-3">Most popular</div>}
              <h3 className="font-display text-2xl">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <div className="font-display text-4xl">{p.price}</div>
                <div className={`text-xs ${p.featured ? "text-background/60" : "text-muted-foreground"}`}>{p.period}</div>
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${p.featured ? "text-ochre" : "text-primary"}`} /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/submit" className={`mt-7 inline-flex justify-center items-center px-4 py-3 rounded-sm text-sm ${p.featured ? "bg-background text-ink hover:bg-background/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                Get started
              </Link>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
