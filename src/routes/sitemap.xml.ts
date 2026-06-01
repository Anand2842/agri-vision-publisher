import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BASE_URL = "https://theagriculturepopulararticlemagazine.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap/xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/about", changefreq: "monthly", priority: "0.7" },
          { path: "/advertise", changefreq: "monthly", priority: "0.6" },
          { path: "/archives", changefreq: "weekly", priority: "0.8" },
          { path: "/contact", changefreq: "monthly", priority: "0.6" },
          { path: "/current-issue", changefreq: "weekly", priority: "0.9" },
          { path: "/editorial-board", changefreq: "monthly", priority: "0.6" },
          { path: "/membership", changefreq: "monthly", priority: "0.7" },
          { path: "/publication-ethics", changefreq: "monthly", priority: "0.6" },
          { path: "/search", changefreq: "weekly", priority: "0.7" },
          { path: "/startup-spotlight", changefreq: "weekly", priority: "0.7" },
          { path: "/submission-guidelines", changefreq: "monthly", priority: "0.7" },
        ];

        // Fetch published articles for dynamic URLs
        const { data: articles } = await supabaseAdmin
          .from("articles")
          .select("slug,published_at")
          .eq("status", "published")
          .order("published_at", { ascending: false });

        if (articles && articles.length > 0) {
          for (const article of articles) {
            entries.push({
              path: `/articles/${article.slug}`,
              lastmod: article.published_at ?? undefined,
              changefreq: "monthly",
              priority: "0.8",
            });
          }
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${new Date(e.lastmod).toISOString()}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
