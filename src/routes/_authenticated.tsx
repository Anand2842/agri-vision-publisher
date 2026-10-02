import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user && typeof window !== "undefined") {
      const redirectUrl = window.location.pathname + window.location.search + window.location.hash;
      navigate({
        to: "/auth",
        search: { redirect: redirectUrl },
      }).catch(() => {
        window.location.href = `/auth?redirect=${encodeURIComponent(redirectUrl)}`;
      });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <>
        <SiteHeader />
        <main className="container-dashboard py-20 font-sans text-center">
          <div className="text-muted-foreground text-sm">Checking authentication…</div>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <SiteHeader />
        <main className="container-dashboard py-20 font-sans text-center">
          <h2 className="font-display text-2xl text-ink">Authentication Required</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Please{" "}
            <a
              href={`/auth?redirect=${encodeURIComponent(
                typeof window !== "undefined"
                  ? window.location.pathname + window.location.search
                  : "/admin/articles",
              )}`}
              className="text-primary underline font-medium"
            >
              sign in
            </a>{" "}
            to access this page.
          </p>
        </main>
        <SiteFooter />
      </>
    );
  }

  return <Outlet />;
}


