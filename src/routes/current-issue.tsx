import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { articles, cover, issues } from "@/lib/mock-data";
import { Download } from "lucide-react";

export const Route = createFileRoute("/current-issue")({
  component: CurrentIssue,
  head: () => ({ meta: [
    { title: "Current Issue · May 2026 — Agripop" },
    { name: "description", content: "Volume 4 Issue 5: Adapting to a Warming Climate." },
  ] }),
});

function CurrentIssue() {
  const issue = issues[0];
  return (
    <>
      <SiteHeader />
      <main className="container-editorial pt-16 pb-24">
        <div className="grid md:grid-cols-12 gap-12 items-start">
          <div className="md:col-span-5 md:sticky md:top-28">
            <img src={cover} alt={issue.title} className="w-full max-w-md shadow-2xl rounded-sm" />
            <button className="mt-6 inline-flex items-center gap-2 text-sm bg-primary text-primary-foreground px-5 py-3 rounded-sm">
              <Download className="h-4 w-4" /> Download PDF (12.4 MB)
            </button>
          </div>
          <div className="md:col-span-7">
            <div className="eyebrow">Volume {issue.volume} · Issue {issue.number} · {issue.date}</div>
            <h1 className="font-display text-5xl md:text-6xl mt-4 text-ink leading-[1.05]">{issue.title}</h1>
            <p className="mt-6 text-foreground/75 leading-relaxed text-lg max-w-2xl">{issue.desc}</p>

            <div className="mt-14">
              <div className="eyebrow">Table of Contents</div>
              <div className="rule-thick mt-3" />
              <ul className="divide-y divide-[var(--color-rule)]">
                {articles.map((a, i) => (
                  <li key={a.slug} className="py-6">
                    <Link to="/articles/$slug" params={{ slug: a.slug }} className="grid grid-cols-12 gap-4 group">
                      <div className="col-span-1 font-display text-xl text-muted-foreground">{String(i + 1).padStart(2, "0")}</div>
                      <div className="col-span-11">
                        <div className="eyebrow text-[0.6rem]">{a.category}</div>
                        <h3 className="font-display text-xl md:text-2xl mt-1 group-hover:text-primary transition-colors">{a.title}</h3>
                        <div className="text-xs text-muted-foreground mt-2">{a.author} · {a.affiliation} · {a.readTime} min read</div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
