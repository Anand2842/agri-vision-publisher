import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";

export function SiteFooter() {
  return (
    <footer className="mt-0 bg-navy text-white">
      <div className="container-editorial py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" width={56} height={56} className="h-14 w-14 shrink-0" loading="lazy" />
            <div className="font-display text-xl leading-tight">The Agriculture Popular<br/>Article Magazine</div>
          </div>
          <p className="text-sm text-white/70 mt-4 max-w-xs leading-relaxed">
            A peer-reviewed, open-access monthly magazine advancing agriculture through knowledge, innovation, sustainability and community.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.18em] text-orange font-semibold">
            <span>Knowledge</span><span>·</span><span>Innovation</span><span>·</span><span>Sustainability</span><span>·</span><span>Community</span>
          </div>
        </div>
        <FooterCol title="Magazine" links={[["Current Issue","/current-issue"],["Archives","/archives"],["Editorial Board","/editorial-board"],["About","/about"]]} />
        <FooterCol title="Authors" links={[["Submit Article","/submit"],["Submission Guidelines","/submission-guidelines"],["Membership","/membership"],["Author Dashboard","/dashboard"]]} />
        <div>
          <div className="eyebrow mb-4 text-white/50">Editorial Office</div>
          <ul className="space-y-2 text-sm text-white/80">
            <li>Dr. Dileep Kumar</li>
            <li className="text-white/60">ICAR–RRS–CAZRI, Jaisalmer 345001</li>
            <li><a href="tel:+919509164410" className="hover:text-orange">+91 9509164410</a></li>
            <li><a href="mailto:dkdkdangi@gmail.com" className="hover:text-orange break-all">dkdkdangi@gmail.com</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-editorial py-6 flex flex-col md:flex-row justify-between text-xs text-white/60 gap-2">
          <div>© {new Date().getFullYear()} The Agriculture Popular Article Magazine. Published by Ram Mangalam Agri – Rural Development Foundation.</div>
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
