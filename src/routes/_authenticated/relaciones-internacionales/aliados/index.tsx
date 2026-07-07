import { createFileRoute } from "@tanstack/react-router";
import { AlliesListPage } from "@/components/pages/AlliesListPage";

export const Route = createFileRoute("/_authenticated/relaciones-internacionales/aliados/")({
  head: () => ({ meta: [{ title: "Aliados · Relaciones Internacionales · UAM" }] }),
  component: () => (
    <AlliesListPage
      direction="relaciones_internacionales"
      cardBasePath="/relaciones-internacionales/aliados/$id"
      showExport={false}
    />
  ),
});
