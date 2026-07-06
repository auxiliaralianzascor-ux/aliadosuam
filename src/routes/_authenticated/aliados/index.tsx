import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/aliados/")({
  beforeLoad: () => {
    throw redirect({ to: "/alianzas/aliados" });
  },
});
