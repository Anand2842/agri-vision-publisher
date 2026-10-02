import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/author-guidelines")({
  beforeLoad: () => {
    throw redirect({
      to: "/submission-guidelines",
    });
  },
});
