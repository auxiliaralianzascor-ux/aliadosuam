import { createFileRoute } from "@tanstack/react-router";
import { IndicatorsDashboardPage } from "@/components/pages/IndicatorsDashboardPage";

export const Route = createFileRoute("/_authenticated/relaciones-internacionales/indicadores/")({
  component: () => <IndicatorsDashboardPage direction="relaciones_internacionales" />,
});
