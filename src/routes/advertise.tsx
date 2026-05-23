import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { fetchSeoMetadata, useSiteContent } from "@/hooks/useSiteContent";
import { Mail, Phone, Megaphone, CheckCircle, BarChart3, Users, Globe2, Award } from "lucide-react";

export const Route = createFileRoute("/advertise")({
  component: Advertise,
  loader: () => fetchSeoMetadata("contact"), // Use contact SEO metadata as high-quality fallback
  head: ({ loaderData }) => ({
    title: "Advertise — The Agriculture Popular Article Magazine",
    meta: loaderData
      ? [
          { name: "description", content: "Reach a highly targeted audience of scientists, progressive farmers, researchers, and agri-startups by advertising with us." },
          { property: "og:title", content: "Advertise — The Agriculture Popular Article Magazine" },
          { property: "og:description", content: "Reach a highly targeted audience of scientists, progressive farmers, researchers, and agri-startups by advertising with us." },
        ]
      : [],
  }),
});

function Advertise() {
  const { get } = useSiteContent("contact");

  const benefits = [
    {
      title: "Targeted Audience",
      description: "Direct connection with researchers, KVK scientists, faculty members, and progressive farmers.",
      icon: Users,
    },
    {
      title: "Extensive Reach",
      description: "Over 50,000+ active monthly readers and growing agricultural community network.",
      icon: BarChart3,
    },
    {
      title: "International Visibility",
      description: "Global readership across India, Nepal, Sri Lanka, and international agricultural research bodies.",
      icon: Globe2,
    },
    {
      title: "Credible Alignment",
      description: "Associate your brand with an open-access, peer-reviewed scientific and rural advancement platform.",
      icon: Award,
    },
  ];

  const packages = [
    {
      name: "Issue Sponsor",
      price: "Enquire for Price",
      description: "Premium placement on the cover and table of contents pages of our monthly issue.",
      features: [
        "Full-page back cover advertisement",
        "Editorial board acknowledgement",
        "Logo in Monthly Newsletter",
        "Hyperlink to company website",
      ],
      cta: "Contact Editor",
      highlighted: true,
    },
    {
      name: "Startup Spotlight Sponsor",
      price: "Special Startup Rate",
      description: "Specifically designed for young agri-tech startups looking to showcase innovations.",
      features: [
        "Feature story in Startup Spotlight section",
        "Half-page display advertisement",
        "Social media announcement",
        "Direct inquiry lead forwarding",
      ],
      cta: "Enquire Now",
      highlighted: false,
    },
    {
      name: "Standard Banner Placement",
      price: "Flexible Monthly Rates",
      description: "Standard slots across our dynamic online article pages and categories.",
      features: [
        "Sidebar banner on article view pages",
        "Bottom banner on home page",
        "Rotational priority slots",
        "Basic CTR performance analytics",
      ],
      cta: "Request Rate Card",
      highlighted: false,
    },
  ];

  return (
    <>
      <SiteHeader />
      
      {/* Hero Section */}
      <section className="bg-navy text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        <div className="container-editorial relative z-10">
          <div className="max-w-3xl">
            <div className="eyebrow text-orange mb-3">Partner With Us</div>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] text-white">
              {get("advertise", "heading") || "Reach the agriculture community"}
            </h1>
            <p className="mt-6 text-white/80 text-lg leading-relaxed font-sans">
              {get("advertise", "body") || "Agro-based industrial and other allied sectors can advertise in The Agriculture Popular Article Magazine. Write to us for placements, rate cards and partnership enquiries."}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#packages" className="btn-orange">
                View Packages
              </a>
              <Link to="/contact" className="border border-white/30 hover:border-white px-6 py-3 rounded-sm text-sm font-sans tracking-wide transition-colors">
                Contact Office
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container-editorial py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="eyebrow">Why Advertise With Us</div>
          <h2 className="font-display text-4xl mt-3 text-ink">Connect With Key Decision Makers</h2>
          <p className="text-foreground/70 mt-4 leading-relaxed">
            Our magazine bridges the gap between scientific agricultural research and on-farm applications. Align your brand with agricultural progress and sustainability.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((b, i) => (
            <div key={i} className="bg-paper border border-rule p-8 hover-lift">
              <div className="bg-orange/10 p-3 rounded-sm w-fit mb-6">
                <b.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl text-ink mb-3">{b.title}</h3>
              <p className="text-sm text-foreground/75 leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Callout */}
      <section className="bg-paper border-y border-rule py-16">
        <div className="container-editorial text-center">
          <div className="eyebrow">Audience Breakdown</div>
          <h2 className="font-display text-3xl mt-2 mb-10 text-ink">Our Growing Agricultural Reader Network</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="p-4 border-r border-rule last:border-0">
              <div className="font-display text-4xl font-bold text-primary">50,000+</div>
              <div className="text-xs uppercase tracking-wider text-foreground/60 mt-1 font-semibold">Monthly Readers</div>
            </div>
            <div className="p-4 border-r border-rule last:border-0">
              <div className="font-display text-4xl font-bold text-primary">30,000+</div>
              <div className="text-xs uppercase tracking-wider text-foreground/60 mt-1 font-semibold">Active Farmers</div>
            </div>
            <div className="p-4 border-r border-rule last:border-0">
              <div className="font-display text-4xl font-bold text-primary">55,000+</div>
              <div className="text-xs uppercase tracking-wider text-foreground/60 mt-1 font-semibold">Academicians</div>
            </div>
            <div className="p-4">
              <div className="font-display text-4xl font-bold text-primary">2,500+</div>
              <div className="text-xs uppercase tracking-wider text-foreground/60 mt-1 font-semibold">International Visitors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="container-editorial py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="eyebrow">Our Placements</div>
          <h2 className="font-display text-4xl mt-3 text-ink">Advertising & Sponsorship Options</h2>
          <p className="text-foreground/70 mt-4 leading-relaxed">
            Select a sponsorship program that fits your corporate outreach goals. All packages can be tailored to meet specific branding initiatives.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg, idx) => (
            <div
              key={idx}
              className={`border p-8 flex flex-col justify-between hover-lift relative ${
                pkg.highlighted
                  ? "border-primary bg-paper ring-2 ring-primary/20"
                  : "border-rule bg-paper"
              }`}
            >
              {pkg.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] uppercase tracking-wider px-3 py-1 font-semibold rounded-full font-sans">
                  Most Popular
                </div>
              )}
              <div>
                <h3 className="font-display text-2xl text-ink mb-2">{pkg.name}</h3>
                <div className="font-sans text-sm font-semibold text-primary mb-4">{pkg.price}</div>
                <p className="text-sm text-foreground/75 leading-relaxed mb-6">{pkg.description}</p>
                <div className="h-px bg-rule mb-6" />
                <ul className="space-y-3.5 mb-8">
                  {pkg.features.map((feat, fidx) => (
                    <li key={fidx} className="flex gap-3 text-sm text-foreground/80 leading-snug">
                      <CheckCircle className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Link
                to="/contact"
                className={`w-full py-3 text-center rounded-sm text-xs uppercase tracking-wider font-semibold font-sans transition-colors ${
                  pkg.highlighted
                    ? "bg-primary text-white hover:bg-primary/95"
                    : "bg-background border border-rule hover:border-primary text-ink"
                }`}
              >
                {pkg.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-navy text-white border-t border-rule py-16">
        <div className="container-editorial text-center max-w-3xl">
          <Megaphone className="h-10 w-10 text-orange mx-auto mb-6" />
          <h2 className="font-display text-3xl md:text-4xl text-white">Get in Touch with our Editorial Office</h2>
          <p className="text-white/80 mt-4 leading-relaxed font-sans max-w-xl mx-auto">
            Ready to advertise? Request a comprehensive media kit and discussion regarding custom marketing schedules.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm font-sans">
            <a href={`mailto:${get("office", "email") || "dkdkdangi@gmail.com"}`} className="flex items-center gap-2.5 underline hover:text-orange transition-colors">
              <Mail className="h-4 w-4" /> {get("office", "email") || "dkdkdangi@gmail.com"}
            </a>
            <a href={`tel:${get("office", "phone") || "+91 9509164410"}`} className="flex items-center gap-2.5 hover:text-orange transition-colors">
              <Phone className="h-4 w-4" /> {get("office", "phone") || "+91 9509164410"}
            </a>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
