import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BASE_URL = "https://agriculturemagazine.in";

// llms.txt (https://llmstxt.org): a plain-text map of the site for AI search tools.
export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const { data: articles } = await supabaseAdmin
          .from("articles")
          .select("slug,title,abstract,issues(volume,issue_number)")
          .eq("status", "published")
          .order("published_at", { ascending: false });

        const summary = (text: string | null) => {
          const t = (text ?? "").replace(/\s+/g, " ").trim();
          return t.length > 200 ? `${t.slice(0, 200).replace(/\s+\S*$/, "")}…` : t;
        };

        const lines = [
          "# The Agriculture Popular Article Magazine",
          "",
          "> A peer-reviewed, open-access monthly magazine for agriculture and allied sciences, publishing popular articles written by researchers, students and extension workers in India.",
          "",
          "All articles are free to read. Each article page has the full text, authors, affiliation, issue and a citation.",
          "",
          "## Key pages",
          `- [Current issue](${BASE_URL}/current-issue): the latest issue and its articles`,
          `- [Archives](${BASE_URL}/archives): all past issues`,
          `- [Submission guidelines](${BASE_URL}/submission-guidelines): how to write and submit an article`,
          `- [Submit an article](${BASE_URL}/submit)`,
          `- [Editorial board](${BASE_URL}/editorial-board)`,
          `- [Publication ethics](${BASE_URL}/publication-ethics)`,
          `- [Open access policy](${BASE_URL}/open-access)`,
          `- [About](${BASE_URL}/about)`,
          "",
          "## Articles",
          ...(articles ?? []).map((a) => {
            const issue = a.issues ? ` (Vol. ${a.issues.volume}, Issue ${a.issues.issue_number})` : "";
            const desc = summary(a.abstract);
            return `- [${a.title}](${BASE_URL}/articles/${a.slug})${issue}${desc ? `: ${desc}` : ""}`;
          }),
          "",
        ];

        return new Response(lines.join("\n"), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
