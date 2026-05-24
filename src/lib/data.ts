import { supabase } from "@/integrations/supabase/client";
import defaultCover from "@/assets/issue-cover-1.jpg";

export type Article = {
  slug: string;
  title: string;
  category: string;
  author: string;
  affiliation: string;
  readTime: number;
  views: string;
  cover: string;
  abstract: string;
  date: string;
  /** Path of the article PDF inside the `article-pdfs` Supabase Storage bucket. */
  pdfPath?: string;
  content?: string;
  authorBio?: string;
};

export type DBArticle = Article & { id?: string };

export type IssueRow = {
  id: string;
  volume: number;
  number: number;
  title: string;
  desc: string;
  date: string;
  cover: string;
  pdfUrl: string | null;
};

const issuePdf = (path?: string | null) =>
  path ? supabase.storage.from("article-pdfs").getPublicUrl(path).data.publicUrl : null;

const articlePdf = (path?: string | null) =>
  path ? supabase.storage.from("article-pdfs").getPublicUrl(path).data.publicUrl : "";

function fmtDate(d?: string | null) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleString("en-US", { month: "long", year: "numeric" });
  } catch {
    return d;
  }
}

export async function fetchIssues(): Promise<IssueRow[]> {
  const { data } = await supabase
    .from("issues")
    .select("id,volume,issue_number,title,description,published_at,cover_url,pdf_url")
    .order("published_at", { ascending: false });
  if (!data || data.length === 0) {
    return [];
  }
  return data.map((r) => ({
    id: r.id,
    volume: r.volume,
    number: r.issue_number,
    title: r.title,
    desc: r.description ?? "",
    date: fmtDate(r.published_at),
    cover: r.cover_url || defaultCover,
    pdfUrl: r.pdf_url ?? null,
  }));
}

type ArticleJoin = {
  id: string;
  slug: string;
  title: string;
  abstract: string | null;
  cover_url: string | null;
  read_time: number | null;
  views: number;
  pdf_url: string | null;
  published_at: string | null;
  categories: { name: string } | null;
  profiles: { full_name: string | null; institution: string | null } | null;
  content: string | null;
  author_bio: string | null;
};

function mapArticle(r: ArticleJoin): DBArticle {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    abstract: r.abstract ?? "",
    cover: r.cover_url || "",
    category: r.categories?.name ?? "Article",
    author: r.profiles?.full_name ?? "Editorial Team",
    affiliation: r.profiles?.institution ?? "",
    readTime: r.read_time ?? 5,
    views: String(r.views ?? 0),
    date: fmtDate(r.published_at),
    pdfPath: r.pdf_url ?? undefined,
    content: r.content ?? undefined,
    authorBio: r.author_bio ?? undefined,
  };
}

export async function fetchPublishedArticles(limit?: number): Promise<DBArticle[]> {
  let q = supabase
    .from("articles")
    .select(
      "id,slug,title,abstract,content,author_bio,cover_url,read_time,views,pdf_url,published_at,categories(name),profiles(full_name,institution)",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  if (!data || data.length === 0) return [];
  return (data as unknown as ArticleJoin[]).map(mapArticle);
}

export async function searchArticles(term: string, limit: number = 50): Promise<DBArticle[]> {
  if (!term.trim()) {
    return fetchPublishedArticles(limit);
  }
  const cleanTerm = `%${term.trim()}%`;
  const { data } = await supabase
    .from("articles")
    .select(
      "id,slug,title,abstract,content,author_bio,cover_url,read_time,views,pdf_url,published_at,categories(name),profiles(full_name,institution)",
    )
    .eq("status", "published")
    .or(`title.ilike.${cleanTerm},abstract.ilike.${cleanTerm}`)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (!data || data.length === 0) return [];
  return (data as unknown as ArticleJoin[]).map(mapArticle);
}

export async function fetchArticleBySlug(slug: string): Promise<DBArticle | null> {
  const { data } = await supabase
    .from("articles")
    .select(
      "id,slug,title,abstract,content,author_bio,cover_url,read_time,views,pdf_url,published_at,categories(name),profiles(full_name,institution)",
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (data) return mapArticle(data as unknown as ArticleJoin);
  return null;
}

export { issuePdf, articlePdf };
