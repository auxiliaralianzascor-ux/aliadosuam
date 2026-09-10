import { createFileRoute } from "@tanstack/react-router";
import { CargarIndicadoresPage } from "@/components/pages/CargarIndicadoresPage";

export const Route = createFileRoute("/_authenticated/investigacion/indicadores/cargar")({
  head: () => ({ meta: [{ title: "Cargar indicadores · Investigación · UAM" }] }),
  component: () => (
    <CargarIndicadoresPage direction="investigacion" dashboardPath="/investigacion/indicadores" />
  ),
});
