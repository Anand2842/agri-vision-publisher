import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-rule bg-paper">
      <div className="container-editorial py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="font-display text-2xl text-ink">Agripop</div>
          <p className="text-sm text-muted-foreground mt-3 max-w-xs leading-relaxed">
            A global monthly peer-reviewed magazine advancing agriculture through knowledge, innovation and research.
          </p>
          <p className="eyebrow mt-6">ISSN 2980-2222 (Online)</p>
        </div>
        <FooterCol title="Magazine" links={[["Current Issue","/current-issue"],["Archives","/archives"],["Editorial Board","/editorial-board"],["About","/about"]]} />
        <FooterCol title="Authors" links={[["Submit Article","/submit"],["Submission Guidelines","/submission-guidelines"],["Membership","/membership"],["Author Dashboard","/dashboard"]]} />
        <FooterCol title="Editorial Office" links={[["Contact","/contact"],["Advertise","/contact"],["Privacy","/about"],["Terms","/about"]]} />
      </div>
      <div className="border-t border-rule">
        <div className="container-editorial py-6 flex flex-col md:flex-row justify-between text-xs text-muted-foreground gap-2">
          <div>© {new Date().getFullYear()} The Agriculture Popular Article Magazine. All rights reserved.</div>
          <div>Published monthly · Peer reviewed · Open access</div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="eyebrow mb-4">{title}</div>
      <ul className="space-y-2">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="text-sm text-foreground/80 hover:text-primary">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
