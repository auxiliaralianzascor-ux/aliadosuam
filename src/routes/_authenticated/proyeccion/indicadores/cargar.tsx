import { createFileRoute } from "@tanstack/react-router";
import { CargarIndicadoresPage } from "@/components/pages/CargarIndicadoresPage";

export const Route = createFileRoute("/_authenticated/proyeccion/indicadores/cargar")({
  head: () => ({ meta: [{ title: "Cargar indicadores · Proyección · UAM" }] }),
  component: () => (
    <CargarIndicadoresPage direction="proyeccion" dashboardPath="/proyeccion/indicadores" />
  ),
});
