import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Check, Building2, Smartphone, Banknote } from "lucide-react";

export const Route = createFileRoute("/membership")({
  component: Membership,
  head: () => ({
    meta: [
      { title: "Membership & Pricing — The Agriculture Popular Article Magazine" },
      {
        name: "description",
        content:
          "Single article, annual, lifetime and institutional membership plans. Annual members publish for free; non-member authors pay a small publication fee.",
      },
    ],
  }),
});

const plans = [
  {
    id: "single",
    name: "Single Article",
    price: "₹200",
    period: "per article",
    validity: "1 article",
    features: ["Peer review", "Online publication", "Author certificate", "Indexed listing"],
    featured: false,
  },
  {
    id: "annual",
    name: "Annual Membership",
    price: "₹500",
    period: "per year",
    validity: "Up to 8 articles · 12 months",
    features: ["Publish up to 8 articles free", "Priority review queue", "Member ID & certificate", "Listed on author directory"],
    featured: true,
  },
  {
    id: "lifetime",
    name: "Lifetime Membership",
    price: "₹2,000",
    period: "one-time",
    validity: "5 years",
    features: ["Unlimited submissions for 5 years", "Editorial consultations", "Member ID & certificate", "Lifetime member directory"],
    featured: false,
  },
  {
    id: "institute",
    name: "Institute / Library",
    price: "₹5,000",
    period: "one-time",
    validity: "5 years",
    features: ["Institutional authorship support", "Branded archive page", "Discounted author fees for faculty", "Quarterly impact reports"],
    featured: false,
  },
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
        <p className="mt-6 max-w-2xl mx-auto text-center text-foreground/70">
          Annual members publish for free. Non-member authors and non-member co-authors pay a small
          per-article publication fee. Membership directly supports independent agricultural
          publishing in India.
        </p>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`border p-7 flex flex-col ${p.featured ? "bg-ink text-background border-ink" : "bg-paper border-rule"}`}
            >
              {p.featured && <div className="eyebrow text-background/70 mb-3">Most popular</div>}
              <h3 className="font-display text-2xl">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <div className="font-display text-4xl">{p.price}</div>
                <div className={`text-xs ${p.featured ? "text-background/60" : "text-muted-foreground"}`}>{p.period}</div>
              </div>
              <div className={`text-xs uppercase tracking-wider mt-2 ${p.featured ? "text-ochre" : "text-orange"} font-semibold`}>
                {p.validity}
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${p.featured ? "text-ochre" : "text-primary"}`} /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/submit"
                className={`mt-7 inline-flex justify-center items-center px-4 py-3 rounded-sm text-sm ${p.featured ? "bg-background text-ink hover:bg-background/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>

        {/* Payment panel */}
        <section className="mt-24 border-t border-rule pt-16">
          <div className="text-center max-w-2xl mx-auto">
            <div className="eyebrow">Payment Methods</div>
            <h2 className="font-display text-3xl md:text-4xl mt-3 text-ink">How to pay your membership or article fee.</h2>
            <p className="mt-4 text-foreground/70">
              Online card payments via Razorpay are coming soon. In the meantime, please use one of
              the following methods and email the transaction reference to{" "}
              <a href="mailto:dkdkdangi@gmail.com" className="underline text-orange">dkdkdangi@gmail.com</a>.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-paper border border-rule p-7">
              <Banknote className="h-6 w-6 text-orange" />
              <h3 className="font-display text-xl mt-4 text-ink">Bank Transfer / NEFT</h3>
              <dl className="mt-5 text-sm space-y-2 text-foreground/85">
                <div className="flex justify-between gap-4"><dt className="text-foreground/60">A/c Holder</dt><dd className="font-medium">Dileep Kumar</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-foreground/60">A/c No.</dt><dd className="font-mono">32971942417</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-foreground/60">Bank</dt><dd>State Bank of India</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-foreground/60">IFSC</dt><dd className="font-mono">SBIN0003877</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-foreground/60">Branch</dt><dd className="text-right">SBI Main Jaisalmer</dd></div>
              </dl>
            </div>

            <div className="bg-paper border border-rule p-7">
              <Smartphone className="h-6 w-6 text-orange" />
              <h3 className="font-display text-xl mt-4 text-ink">UPI / PhonePe</h3>
              <p className="mt-5 text-sm text-foreground/85">
                Send payment via PhonePe, Google Pay or any UPI app to:
              </p>
              <div className="mt-4 font-mono text-2xl text-ink">+91 9509164410</div>
              <p className="mt-3 text-xs text-foreground/60">
                A QR code is available on request — email{" "}
                <a href="mailto:dkdkdangi@gmail.com" className="underline">dkdkdangi@gmail.com</a>.
              </p>
            </div>

            <div className="bg-ink text-background p-7 border border-ink">
              <Building2 className="h-6 w-6 text-ochre" />
              <h3 className="font-display text-xl mt-4">Razorpay (Coming soon)</h3>
              <p className="mt-5 text-sm text-background/80">
                Secure online card, netbanking and wallet payments via Razorpay will be enabled on
                this page in the next update. Until then, please use bank transfer or UPI above.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-wider text-ochre font-semibold">
                Pay Now · Secured by Razorpay
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-foreground/60 max-w-2xl mx-auto">
            After paying, please email the transaction screenshot and your manuscript title to{" "}
            <a href="mailto:dkdkdangi@gmail.com" className="underline">dkdkdangi@gmail.com</a> or
            mention it in your submission notes. A member ID and payment receipt will be issued
            within two working days.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
