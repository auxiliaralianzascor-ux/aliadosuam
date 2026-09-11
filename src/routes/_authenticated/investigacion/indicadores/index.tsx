import { createFileRoute } from "@tanstack/react-router";
import { IndicatorsDashboardPage } from "@/components/pages/IndicatorsDashboardPage";

export const Route = createFileRoute("/_authenticated/investigacion/indicadores/")({
  component: () => <IndicatorsDashboardPage direction="investigacion" />,
});
