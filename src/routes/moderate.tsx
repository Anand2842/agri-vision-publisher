import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/moderate")({
  component: () => <Navigate to="/admin/queue" replace />,
  head: () => ({ title: "Editorial Queue", meta: [{ name: "robots", content: "noindex" }] }),
});
