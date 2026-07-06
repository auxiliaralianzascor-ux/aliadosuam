import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/descuentos")({
  beforeLoad: () => {
    throw redirect({ to: "/alianzas/descuentos" });
  },
});
