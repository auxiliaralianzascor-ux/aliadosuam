import { createFileRoute } from "@tanstack/react-router";
import { CargarIndicadoresPage } from "@/components/pages/CargarIndicadoresPage";

export const Route = createFileRoute("/_authenticated/decanaturas/indicadores/cargar")({
  head: () => ({ meta: [{ title: "Cargar indicadores · Decanaturas · UAM" }] }),
  component: () => (
    <CargarIndicadoresPage direction="decanaturas" dashboardPath="/decanaturas/indicadores" />
  ),
});
