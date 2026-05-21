import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SITE_CONTENT_DEFAULTS, SiteContentKeys } from "@/lib/site-content-defaults";

type PageContent = Record<string, Record<string, string>>;

const cache: Record<string, PageContent> = {};
const pendingRequests: Record<string, Promise<any>> = {};

export function useSiteContent<P extends keyof SiteContentKeys>(page: P) {
  const [content, setContent] = useState<PageContent>(cache[page as string] || {});
  const [loading, setLoading] = useState(!cache[page as string]);

  useEffect(() => {
    if (cache[page as string] && Object.keys(cache[page as string]).length > 0) {
      setContent(cache[page as string]);
      setLoading(false);
      return;
    }

    async function load() {
      if (!pendingRequests[page as string]) {
        pendingRequests[page as string] = Promise.resolve(
          supabase
            .from("site_content")
            .select("section, key, value")
            .eq("page", page as string)
            .then(({ data, error }) => {
              const newContent: PageContent = {};
              if (data && !error) {
                data.forEach((row) => {
                  if (!newContent[row.section]) newContent[row.section] = {};
                  newContent[row.section][row.key] = row.value || "";
                });
              }
              cache[page as string] = newContent;
              return newContent;
            })
        );
      }

      const newContent = await pendingRequests[page as string];
      setContent(newContent);
      setLoading(false);
    }
    load();
  }, [page]);

  function get<S extends keyof SiteContentKeys[P] & string, K extends SiteContentKeys[P][S] & string>(
    section: S,
    key: K
  ): string {
    return content[section]?.[key] ?? SITE_CONTENT_DEFAULTS[page as string]?.[section]?.[key] ?? "";
  }

  function getJson<S extends keyof SiteContentKeys[P] & string, K extends SiteContentKeys[P][S] & string, T = any>(
    section: S,
    key: K
  ): T {
    const raw = get(section, key);
    try {
      return JSON.parse(raw) as T;
    } catch {
      return [] as any as T;
    }
  }

  return { get, getJson, loading };
}

export function useGlobalSiteContent() {
  const { get: getHeader, getJson: getHeaderJson } = useSiteContent("header");
  const { get: getFooter, getJson: getFooterJson } = useSiteContent("footer");
  return { getHeader, getHeaderJson, getFooter, getFooterJson };
}

export async function fetchSeoMetadata(pageKey: string): Promise<{ title: string; description: string }> {
  const seoPage = "seo";
  if (!cache[seoPage]) {
    if (!pendingRequests[seoPage]) {
      pendingRequests[seoPage] = Promise.resolve(
        supabase
          .from("site_content")
          .select("section, key, value")
          .eq("page", seoPage)
          .then(({ data, error }) => {
            const newContent: PageContent = {};
            if (data && !error) {
              data.forEach((row) => {
                if (!newContent[row.section]) newContent[row.section] = {};
                newContent[row.section][row.key] = row.value || "";
              });
            }
            cache[seoPage] = newContent;
            return newContent;
          })
      );
    }
    await pendingRequests[seoPage];
  }

  const pageSeo = cache[seoPage]?.[pageKey] || {};
  const defaultSeo = SITE_CONTENT_DEFAULTS.seo?.[pageKey] || {};
  return {
    title: pageSeo.title || defaultSeo.title || "",
    description: pageSeo.description || defaultSeo.description || "",
  };
}
