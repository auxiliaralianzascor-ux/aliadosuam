import { createFileRoute } from "@tanstack/react-router";
import { IndicatorsDashboardPage } from "@/components/pages/IndicatorsDashboardPage";

export const Route = createFileRoute("/_authenticated/decanaturas/indicadores/")({
  head: () => ({ meta: [{ title: "Indicadores · Decanaturas · UAM" }] }),
  component: () => <IndicatorsDashboardPage direction="decanaturas" cargarPath="/decanaturas/indicadores/cargar" />,
});
