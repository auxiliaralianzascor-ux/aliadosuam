import { createFileRoute } from "@tanstack/react-router";
import { AlliesListPage } from "@/components/pages/AlliesListPage";

export const Route = createFileRoute("/_authenticated/decanaturas/ingenierias/aliados/")({
  head: () => ({ meta: [{ title: "Aliados · Facultad de Ingenierías · UAM" }] }),
  component: () => (
    <AlliesListPage
      direction="decanatura_ingenierias"
      cardBasePath="/decanaturas/ingenierias/aliados/$id"
      showExport={false}
    />
  ),
});
