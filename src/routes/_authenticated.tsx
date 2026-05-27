import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    // Supabase auth session lives in localStorage, so it isn't available during
    // SSR/prerender. Skip the gate on the server — the client will re-run
    // beforeLoad after hydration and redirect if truly unauthenticated.
    if (typeof window === "undefined") {
      return { user: null };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw redirect({
        to: "/auth",
        search: {
          redirect: location.href,
        },
      });
    }

    return { user };
  },
  component: () => <Outlet />,
});
