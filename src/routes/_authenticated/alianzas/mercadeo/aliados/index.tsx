import { createFileRoute } from "@tanstack/react-router";
import { AlliesListPage } from "@/components/pages/AlliesListPage";

export const Route = createFileRoute("/_authenticated/alianzas/mercadeo/aliados/")({
  head: () => ({ meta: [{ title: "Aliados · Mercadeo Institucional · UAM" }] }),
  component: () => (
    <AlliesListPage
      direction="alianzas_mercadeo"
      cardBasePath="/alianzas/mercadeo/aliados/$id"
      showExport={false}
    />
  ),
});
