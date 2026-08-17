import { createFileRoute } from "@tanstack/react-router";
import { IndicatorsDashboardPage } from "@/components/pages/IndicatorsDashboardPage";

export const Route = createFileRoute("/_authenticated/investigacion/indicadores/")({
  head: () => ({ meta: [{ title: "Indicadores · Investigación · UAM" }] }),
  component: () => <IndicatorsDashboardPage direction="investigacion" />,
});
