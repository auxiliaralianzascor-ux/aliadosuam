import { createFileRoute } from "@tanstack/react-router";
import { IndicatorsDashboardPage } from "@/components/pages/IndicatorsDashboardPage";

export const Route = createFileRoute("/_authenticated/relaciones-internacionales/indicadores/")({
  head: () => ({ meta: [{ title: "Indicadores · Relaciones Internacionales · UAM" }] }),
  component: () => <IndicatorsDashboardPage direction="relaciones_internacionales" cargarPath="/relaciones-internacionales/indicadores/cargar" />,
});
