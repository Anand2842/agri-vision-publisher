import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import ScrollToTop from "@/components/site/ScrollToTop";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-16">
      <div className="max-w-md text-center bg-paper border border-rule p-8 sm:p-10 rounded-sm shadow-sm">
        <div className="eyebrow text-orange">404 Error</div>
        <h1 className="font-display text-3xl md:text-4xl mt-2 text-navy font-bold">Page Not Found</h1>
        <div className="rule-thick my-4 mx-auto max-w-[50px]" />
        <p className="text-sm text-foreground/75 leading-relaxed">
          The publication page or article you are looking for does not exist, has been renamed, or has been archived.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="btn-orange text-xs"
          >
            <Home className="h-3.5 w-3.5 mr-1.5 inline" /> Return to Homepage
          </Link>
          <Link
            to="/archives"
            className="text-xs uppercase tracking-wider font-semibold text-primary hover:text-orange transition-colors font-sans py-2.5 px-4 border border-rule bg-white"
          >
            Browse Archives
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("Application Error:", error);
  const router = useRouter();

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-16">
      <div className="max-w-md text-center bg-paper border border-rule p-8 sm:p-10 rounded-sm shadow-sm">
        <div className="h-12 w-12 rounded-full bg-orange/10 text-orange grid place-items-center mx-auto mb-3">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="eyebrow text-orange">Notice</div>
        <h1 className="font-display text-2xl md:text-3xl mt-2 text-navy font-bold">
          Unable to Load Content
        </h1>
        <div className="rule-thick my-4 mx-auto max-w-[50px]" />
        <p className="text-sm text-foreground/75 leading-relaxed">
          We encountered an unexpected issue while loading this page. Please try refreshing or return to the magazine homepage.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-orange text-xs cursor-pointer inline-flex items-center"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Try Again
          </button>
          <Link
            to="/"
            className="text-xs uppercase tracking-wider font-semibold text-primary hover:text-orange transition-colors font-sans py-2.5 px-4 border border-rule bg-white inline-flex items-center"
          >
            <Home className="h-3.5 w-3.5 mr-1.5" /> Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "The Agriculture Popular Article Magazine" },
      {
        name: "description",
        content:
          "A peer-reviewed, open-access monthly magazine for agriculture and allied sciences — original research, popular articles, and editorial commentary.",
      },
      { name: "author", content: "The Agriculture Popular Article Magazine — Editorial Office" },
      { property: "og:title", content: "The Agriculture Popular Article Magazine" },
      {
        property: "og:description",
        content:
          "A peer-reviewed, open-access monthly magazine for agriculture and allied sciences — original research, popular articles, and editorial commentary.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@AgricMagazine" },
      { property: "og:image", content: "https://agriculturemagazine.in/og-default.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "theme-color", content: "#356B3A" },
      {
        name: "google-site-verification",
        content: "Cm8UqdLMIQQccshAlvkEEcpX53Ke3IhMRZrVOkVEMFs",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
    ],
    scripts: [
      {
        async: true,
        src: "https://www.googletagmanager.com/gtag/js?id=G-HFNDHFLXZP",
      },
      {
        children:
          "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-HFNDHFLXZP');",
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "The Agriculture Popular Article Magazine",
              url: "https://agriculturemagazine.in",
              logo: "https://storage.googleapis.com/gpt-engineer-file-uploads/slAjYeeuQ8SRuPj17PjsNhvrcv43/social-images/social-1779385100705-logo.webp",
            },
            {
              "@type": "WebSite",
              name: "The Agriculture Popular Article Magazine",
              url: "https://agriculturemagazine.in",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://agriculturemagazine.in/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ scrollPaddingTop: "140px" }} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { AuthProvider } from "@/context/AuthContext";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const inAdmin = useRouterState({ select: (s) => s.location.pathname.startsWith("/admin") });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster position="top-right" richColors closeButton />
        {!inAdmin && <WhatsAppButton />}
        <ScrollToTop />
      </AuthProvider>
    </QueryClientProvider>
  );
}
