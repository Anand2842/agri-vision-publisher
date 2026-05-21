import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/moderate")({
  component: () => <Navigate to="/admin/queue" replace />,
  head: () => ({ meta: [{ title: "Editorial Queue" }, { name: "robots", content: "noindex" }] }),
});
