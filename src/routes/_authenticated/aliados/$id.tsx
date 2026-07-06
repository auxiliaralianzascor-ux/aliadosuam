import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/aliados/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/alianzas/aliados/$id", params: { id: params.id } });
  },
});
