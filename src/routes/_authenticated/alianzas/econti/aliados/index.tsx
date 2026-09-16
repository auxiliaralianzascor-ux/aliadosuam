import { createFileRoute } from "@tanstack/react-router";
import { AlliesListPage } from "@/components/pages/AlliesListPage";

export const Route = createFileRoute("/_authenticated/alianzas/econti/aliados/")({
  head: () => ({ meta: [{ title: "Aliados · Educación Continuada · UAM" }] }),
  component: () => (
    <AlliesListPage
      direction="alianzas_econti"
      cardBasePath="/alianzas/econti/aliados/$id"
      showExport={false}
    />
  ),
});
