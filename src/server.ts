import "./lib/error-capture";
import ws from "ws";

if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as any).WebSocket = ws;
}

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

// Public pages are the same for every visitor (auth is client-side), so keep rendered HTML in
// Cloudflare's edge cache for a few minutes instead of re-querying Supabase on every hit.
// The key carries the build id, so a new Publish never serves HTML pointing at old assets.
declare const __BUILD_ID__: string;
const HTML_CACHE_SECONDS = 300;
const UNCACHED_PREFIXES = [
  "/admin", "/dashboard", "/auth", "/api", "/_serverFn", "/moderate", "/lovable",
  "/search", "/submit", "/article/", "/membership-cert",
];

type WaitUntil = { waitUntil?: (p: Promise<unknown>) => void };

function htmlCacheKey(request: Request): Request | null {
  if (request.method !== "GET") return null;
  const url = new URL(request.url);
  if (UNCACHED_PREFIXES.some((p) => url.pathname.startsWith(p))) return null;
  url.searchParams.set("__build", __BUILD_ID__);
  return new Request(url.toString());
}

function edgeCache(): Cache | undefined {
  return (globalThis as { caches?: { default?: Cache } }).caches?.default;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const cacheKey = htmlCacheKey(request);
    const cache = cacheKey ? edgeCache() : undefined;
    if (cache && cacheKey) {
      const hit = await cache.match(cacheKey).catch(() => undefined);
      if (hit) {
        const res = new Response(hit.body, hit);
        res.headers.set("x-html-cache", "HIT");
        return res;
      }
    }
    try {
      const handler = await getServerEntry();
      const response = await normalizeCatastrophicSsrResponse(await handler.fetch(request, env, ctx));
      if (
        cache && cacheKey &&
        response.status === 200 &&
        (response.headers.get("content-type") ?? "").includes("text/html") &&
        !response.headers.has("set-cookie")
      ) {
        const toCache = new Response(response.clone().body, response);
        toCache.headers.set("cache-control", `public, max-age=0, s-maxage=${HTML_CACHE_SECONDS}`);
        const put = cache.put(cacheKey, toCache).catch(() => {});
        (ctx as WaitUntil)?.waitUntil?.(put);
        const res = new Response(response.body, response);
        res.headers.set("x-html-cache", "MISS");
        return res;
      }
      return response;
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
