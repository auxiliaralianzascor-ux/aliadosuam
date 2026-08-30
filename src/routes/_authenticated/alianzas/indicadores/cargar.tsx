import { createFileRoute } from "@tanstack/react-router";
import { CargarIndicadoresPage } from "@/components/pages/CargarIndicadoresPage";

export const Route = createFileRoute("/_authenticated/alianzas/indicadores/cargar")({
  head: () => ({ meta: [{ title: "Cargar indicadores · Alianzas · UAM" }] }),
  component: () => (
    <CargarIndicadoresPage direction="alianzas" dashboardPath="/alianzas/indicadores" />
  ),
});
