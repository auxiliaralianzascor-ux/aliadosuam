import { createFileRoute } from "@tanstack/react-router";
import { AlliesListPage } from "@/components/pages/AlliesListPage";

export const Route = createFileRoute("/_authenticated/alianzas/proyectos/aliados/")({
  head: () => ({ meta: [{ title: "Aliados · Proyectos · UAM" }] }),
  component: () => (
    <AlliesListPage
      direction="alianzas_proyectos"
      cardBasePath="/alianzas/proyectos/aliados/$id"
      showExport={false}
    />
  ),
});
