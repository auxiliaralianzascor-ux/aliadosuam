import { createFileRoute } from "@tanstack/react-router";
import { AlliesListPage } from "@/components/pages/AlliesListPage";

export const Route = createFileRoute("/_authenticated/alianzas/graduados/aliados/")({
  head: () => ({ meta: [{ title: "Aliados · Unidad de Graduados · UAM" }] }),
  component: () => (
    <AlliesListPage
      direction="alianzas_graduados"
      cardBasePath="/alianzas/graduados/aliados/$id"
      showExport={false}
    />
  ),
});
