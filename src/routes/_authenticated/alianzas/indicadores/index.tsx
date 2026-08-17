import { createFileRoute } from "@tanstack/react-router";
import { IndicatorsDashboardPage } from "@/components/pages/IndicatorsDashboardPage";

export const Route = createFileRoute("/_authenticated/alianzas/indicadores/")({
  head: () => ({ meta: [{ title: "Indicadores · Alianzas · UAM" }] }),
  component: () => <IndicatorsDashboardPage direction="alianzas" />,
});
