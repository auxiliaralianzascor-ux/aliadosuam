import { createFileRoute } from "@tanstack/react-router";
import { AlliesListPage } from "@/components/pages/AlliesListPage";

export const Route = createFileRoute("/_authenticated/proyeccion/aliados/")({
  head: () => ({ meta: [{ title: "Aliados · Proyección · UAM" }] }),
  component: () => (
    <AlliesListPage
      direction="proyeccion"
      cardBasePath="/proyeccion/aliados/$id"
      showExport={false}
    />
  ),
});
