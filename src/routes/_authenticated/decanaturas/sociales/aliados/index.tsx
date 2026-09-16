import { createFileRoute } from "@tanstack/react-router";
import { AlliesListPage } from "@/components/pages/AlliesListPage";

export const Route = createFileRoute("/_authenticated/decanaturas/sociales/aliados/")({
  head: () => ({ meta: [{ title: "Aliados · Estudios Sociales y Empresariales · UAM" }] }),
  component: () => (
    <AlliesListPage
      direction="decanatura_sociales"
      cardBasePath="/decanaturas/sociales/aliados/$id"
      showExport={false}
    />
  ),
});
