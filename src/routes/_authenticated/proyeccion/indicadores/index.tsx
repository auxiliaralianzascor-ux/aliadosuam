import { createFileRoute } from "@tanstack/react-router";
import { IndicatorsDashboardPage } from "@/components/pages/IndicatorsDashboardPage";

export const Route = createFileRoute("/_authenticated/proyeccion/indicadores/")({
  head: () => ({ meta: [{ title: "Indicadores · Proyección · UAM" }] }),
  component: () => <IndicatorsDashboardPage direction="proyeccion" cargarPath="/proyeccion/indicadores/cargar" />,
});
