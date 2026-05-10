import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-0 bg-navy text-white">
      <div className="container-editorial py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="font-display text-2xl">The Agriculture Magazine</div>
          <p className="text-sm text-white/70 mt-3 max-w-xs leading-relaxed">
            A peer-reviewed, open access monthly magazine advancing agriculture through knowledge, innovation and research.
          </p>
          <p className="eyebrow mt-6 text-white/50">ISSN 2980-2222 (Online)</p>
        </div>
        <FooterCol title="Magazine" links={[["Current Issue","/current-issue"],["Archives","/archives"],["Editorial Board","/editorial-board"],["About","/about"]]} />
        <FooterCol title="Authors" links={[["Submit Article","/submit"],["Submission Guidelines","/submission-guidelines"],["Membership","/membership"],["Author Dashboard","/dashboard"]]} />
        <FooterCol title="Editorial Office" links={[["Contact","/contact"],["Advertise","/contact"],["Privacy","/about"],["Terms","/about"]]} />
      </div>
      <div className="border-t border-white/10">
        <div className="container-editorial py-6 flex flex-col md:flex-row justify-between text-xs text-white/60 gap-2">
          <div>© {new Date().getFullYear()} The Agriculture Magazine. All rights reserved.</div>
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
            <Link to={to} className="text-sm text-white/80 hover:text-orange">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
