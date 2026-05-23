import { Link } from "@tanstack/react-router";
import React from "react";
import logo from "@/assets/logo.png";
import { useGlobalSiteContent } from "@/hooks/useSiteContent";

export function SiteFooter() {
  const { getHeader, getFooter, getFooterJson } = useGlobalSiteContent();
  return (
    <footer className="mt-0 bg-navy text-white">
      <div className="container-editorial py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-3">
            <img
              src={getHeader("branding", "logo_url") || logo}
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 shrink-0"
              loading="lazy"
            />
            <div className="font-display text-xl leading-tight">
              {getHeader("branding", "title_line1") || "The Agriculture"}
              <br />
              {getHeader("branding", "title_line2") || "Popular Article Magazine"}
            </div>
          </div>
          <p className="text-sm text-white/70 mt-4 max-w-xs leading-relaxed">
            {getFooter("branding", "description")}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.18em] text-orange font-semibold">
            {getFooterJson<"branding", "tagwords", string[]>("branding", "tagwords").map((w, i, arr) => (
              <React.Fragment key={w}>
                <span>{w}</span>
                {i < arr.length - 1 && <span>·</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
        <FooterCol
          title="Magazine"
          links={[
            ["Current Issue", "/current-issue"],
            ["Archives", "/archives"],
            ["Editorial Board", "/editorial-board"],
            ["Advertise", "/advertise"],
            ["About", "/about"],
          ]}
        />
        <FooterCol
          title="Authors"
          links={[
            ["Submit Article", "/submit"],
            ["Submission Guidelines", "/submission-guidelines"],
            ["Publication Ethics", "/publication-ethics"],
            ["Membership", "/membership"],
            ["Advertise", "/advertise"],
            ["Author Dashboard", "/dashboard"],
          ]}
        />
        <div>
          <div className="eyebrow mb-4 text-white/50">Editorial Office</div>
          <ul className="space-y-2 text-sm text-white/80">
            <li>{getFooter("contact", "name")}</li>
            <li className="text-white/60">{getFooter("contact", "address")}</li>
            <li>
              <a href={`tel:${getFooter("contact", "phone")}`} className="hover:text-orange">
                {getFooter("contact", "phone")}
              </a>
            </li>
            <li>
              <a href={`mailto:${getFooter("contact", "email")}`} className="hover:text-orange break-all">
                {getFooter("contact", "email")}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-editorial py-6 flex flex-col md:flex-row justify-between text-xs text-white/60 gap-2">
          <div>
            © {new Date().getFullYear()}{" "}
            {getHeader("branding", "title_line1") || "The Agriculture"}{" "}
            {getHeader("branding", "title_line2") || "Popular Article Magazine"}. Published by {getFooter("legal", "publisher_name")}.
          </div>
          <div>Published monthly · Peer reviewed · Open access</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="eyebrow mb-4 text-white/50">{title}</div>
      <ul className="space-y-2">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="text-sm text-white/80 hover:text-orange">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
