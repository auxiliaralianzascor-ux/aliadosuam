import { createFileRoute } from "@tanstack/react-router";
import { AlliesListPage } from "@/components/pages/AlliesListPage";

export const Route = createFileRoute("/_authenticated/decanaturas/salud/aliados/")({
  head: () => ({ meta: [{ title: "Aliados · Facultad de Salud · UAM" }] }),
  component: () => (
    <AlliesListPage
      direction="decanatura_salud"
      cardBasePath="/decanaturas/salud/aliados/$id"
      showExport={false}
    />
  ),
});
